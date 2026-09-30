import path from 'path';
import * as fsExtra from 'fs-extra';
import * as Diff from 'diff';
import { print } from '../utils/print.mjs';

const fs = fsExtra.default;

// Base templates may carry `{{#if <featureKey>}}` blocks (e.g. the markdown build step in
// builder.js.hbs). New projects render them with the feature off; this brings an existing
// project's files in line once the feature is added, by rendering each gated template
// without and with the feature and applying the difference as a patch — so unrelated user
// edits to the file are kept. nutin-update renders base with the project's features too,
// so patched files then match upstream.
function gatesOnFeature(source, featureKey) {
  return new RegExp(`\\{\\{[#^]?(if|unless)\\s+${featureKey}\\b`).test(source);
}

async function findGatedTemplates(dir, featureKey, found = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await findGatedTemplates(entryPath, featureKey, found);
    } else if (entry.name.endsWith('.hbs') && gatesOnFeature(await fs.readFile(entryPath, 'utf8'), featureKey)) {
      found.push(entryPath);
    }
  }
  return found;
}

const toLines = (text) => text.replace(/\n$/, '').split('\n');

const MAX_ANCHOR_LINES = 3;

// The blocks a feature inserts, each with the unchanged lines just before and after it.
// null when the change also removes or rewrites lines: only insertions can be re-anchored.
function getInsertions(before, after) {
  const parts = Diff.diffLines(before, after);
  if (parts.some((part) => part.removed)) return null;

  return parts.flatMap((part, i) => {
    if (!part.added) return [];
    const previous = parts[i - 1] ? toLines(parts[i - 1].value) : [];
    const next = parts[i + 1] ? toLines(parts[i + 1].value) : [];
    return [{ lines: toLines(part.value), previous: previous.slice(-MAX_ANCHOR_LINES), next: next.slice(0, MAX_ANCHOR_LINES) }];
  });
}

function findBlock(lines, block, from = 0) {
  for (let start = from; start + block.length <= lines.length; start++) {
    if (block.every((line, offset) => lines[start + offset] === line)) return start;
  }
  return -1;
}

// Start of the shortest run of anchor lines (1 to 3, taken from the side next to the
// inserted block) that appears exactly once in the file and isn't only blank lines, or -1.
function findUniqueAnchor(lines, anchor, side) {
  for (let size = 1; size <= anchor.length; size++) {
    const block = side === 'previous' ? anchor.slice(-size) : anchor.slice(0, size);
    if (block.every((line) => !line.trim())) continue;
    const first = findBlock(lines, block);
    if (first === -1) return -1;
    if (findBlock(lines, block, first + 1) === -1) return first + (side === 'previous' ? size : 0);
  }
  return -1;
}

// Fallback for files the user changed around the insertion points (e.g. routes added to
// routes.ts): each missing block goes right after the unchanged lines that preceded it in
// the template, or right before the ones that followed it, wherever those lines are unique
// in the file. Returns the patched content, the unchanged content when every block is
// already there, or null when a block can't be placed.
function applyInsertions(current, insertions) {
  const lines = toLines(current);
  const missing = insertions.filter((insertion) => findBlock(lines, insertion.lines) === -1);
  if (!missing.length) return current;

  const placements = [];
  for (const insertion of missing) {
    const afterPrevious = findUniqueAnchor(lines, insertion.previous, 'previous');
    const beforeNext = findUniqueAnchor(lines, insertion.next, 'next');
    if (afterPrevious !== -1) placements.push({ at: afterPrevious, lines: insertion.lines });
    else if (beforeNext !== -1) placements.push({ at: beforeNext, lines: insertion.lines });
    else return null;
  }

  // Bottom-up, so earlier indexes stay valid.
  placements.sort((a, b) => b.at - a.at).forEach(({ at, lines: block }) => lines.splice(at, 0, ...block));
  return lines.join('\n') + (current.endsWith('\n') ? '\n' : '');
}

export async function patchBaseTemplates(projectPath, feature, context, fileGenerator) {
  const baseDir = path.join(fileGenerator.getTemplatesRoot(), 'base');
  const templates = await findGatedTemplates(baseDir, feature.key);

  for (const templatePath of templates) {
    const fileName = path.basename(templatePath);
    const before = await fileGenerator.isRenderTemplateFile(templatePath, fileName, { ...context, [feature.key]: false });
    const after = await fileGenerator.isRenderTemplateFile(templatePath, fileName, context);
    if (!before || !after || before.content === after.content) continue;

    const relativePath = path.join(path.relative(baseDir, path.dirname(templatePath)), after.outputFileName);
    const targetPath = path.join(projectPath, relativePath);
    const patch = Diff.createPatch(relativePath, before.content, after.content);

    const current = (await fs.pathExists(targetPath)) ? await fs.readFile(targetPath, 'utf8') : null;

    if (current !== null) {
      if (current === after.content || Diff.applyPatch(current, Diff.reversePatch(Diff.parsePatch(patch)[0])) !== false) {
        print.gray(`Already up to date: ${relativePath}`);
        continue;
      }

      const patched = Diff.applyPatch(current, patch);
      if (patched !== false) {
        await fs.writeFile(targetPath, patched);
        print.info(`Updated ${relativePath}`);
        continue;
      }

      const insertions = getInsertions(before.content, after.content);
      const inserted = insertions && applyInsertions(current, insertions);
      if (inserted === current) {
        print.gray(`Already up to date: ${relativePath}`);
        continue;
      }
      if (inserted) {
        await fs.writeFile(targetPath, inserted);
        print.info(`Updated ${relativePath}`);
        continue;
      }
    }

    print.warn(
      `Could not update ${relativePath} automatically (${current === null ? 'file not found' : 'it was modified'}). ` +
      `Apply this change by hand for ${feature.key} to work:`
    );
    print.gray(patch.split('\n').slice(4).join('\n'));
  }
}
