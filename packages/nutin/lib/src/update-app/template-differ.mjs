import path from 'path';
import * as fsExtra from 'fs-extra';
import { FileGenerator } from '../common/file-generator.mjs';

const fs = fsExtra.default;

function contentEquals(a, b) {
  if (Buffer.isBuffer(a) || Buffer.isBuffer(b)) {
    return Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;
  }
  return a === b;
}

// Paths the user is expected to hand-edit right after `create-app`.
// Their generated content is just placeholder/starter scaffolding, so nutin-update must never rewrite
// or conflict-flag them.
const FULLY_EXCLUDED_PATTERNS = [
  /^config\/[^/]+\.json$/,
  /^src\/app(\/|$)/,
  /^src\/assets(\/|$)/,
  // Extension projects: the manifest and the background script are starters, like src/app.
  /^src\/extension(\/|$)/,
];

// Like FULLY_EXCLUDED_PATTERNS, but only for files that already existed before this
// update. A brand new file introduced by a newer template version should still be added.
const ADD_ONLY_PATTERNS = [
  /^src\/styles(\/|$)/,
];

function toPosixPath(relPath) {
  return relPath.split(path.sep).join('/');
}

function excludeUserOwnedPaths(oldTree, newTree) {
  for (const relPath of new Set([...oldTree.keys(), ...newTree.keys()])) {
    const posixPath = toPosixPath(relPath);
    const fullyExcluded = FULLY_EXCLUDED_PATTERNS.some((re) => re.test(posixPath));
    const preexistingAddOnly = ADD_ONLY_PATTERNS.some((re) => re.test(posixPath)) && oldTree.has(relPath);

    if (fullyExcluded || preexistingAddOnly) {
      oldTree.delete(relPath);
      newTree.delete(relPath);
    }
  }
}

export class TemplateDiffer {
  constructor() {
    this.fileGenerator = new FileGenerator();
  }

  // prepareMerge(relPath, { actual, base, next }) → { actual, base }: a migration's in-memory rewrite
  // of a text file (yours, and the old version as merge base) before it's compared and merged.
  async diff(projectPath, oldTemplatesRoot, oldContext, newContext, { prepareMerge = null } = {}) {
    const newTemplatesRoot = this.fileGenerator.getTemplatesRoot();

    const [oldTree, newTree] = await Promise.all([
      this.fileGenerator.collectTemplateTree(oldTemplatesRoot, oldContext, { includeExtensionExclusions: true }),
      this.fileGenerator.collectTemplateTree(newTemplatesRoot, newContext),
    ]);

    excludeUserOwnedPaths(oldTree, newTree);

    const toUpdate = [];
    const toAdd = [];
    const conflicts = [];
    const unknown = [];
    const removedByUser = [];
    const noLongerGenerated = [];

    for (const relPath of new Set([...oldTree.keys(), ...newTree.keys()])) {
      const oldEntry = oldTree.get(relPath);
      const newEntry = newTree.get(relPath);

      if (oldEntry && newEntry && contentEquals(oldEntry.content, newEntry.content)) {
        continue;
      }

      const outputPath = path.join(projectPath, relPath);
      const existsOnDisk = await fs.pathExists(outputPath);

      if (!oldEntry) {
        // Brand new file introduced in the new version — nothing to conflict with,
        // unless something else already occupies that path
        if (!existsOnDisk) {
          toAdd.push({ relPath, newEntry });
          continue;
        }

        const actualContent = newEntry.isBinary
          ? await fs.readFile(outputPath)
          : await fs.readFile(outputPath, 'utf8');
        if (!contentEquals(actualContent, newEntry.content)) {
          unknown.push({ relPath });
        }
        continue;
      }

      if (!newEntry) {
        // Nutin no longer generates this file; leave it alone either way,
        // but warn if it's still on disk since it may now be stale/broken.
        if (existsOnDisk) {
          noLongerGenerated.push({ relPath });
        }
        continue;
      }

      if (!existsOnDisk) {
        removedByUser.push({ relPath });
        continue;
      }

      const diskContent = oldEntry.isBinary
        ? await fs.readFile(outputPath)
        : await fs.readFile(outputPath, 'utf8');
      const { actual: actualContent, base: baseContent } = prepareMerge && !oldEntry.isBinary && !newEntry.isBinary
        ? prepareMerge(toPosixPath(relPath), { actual: diskContent, base: oldEntry.content, next: newEntry.content })
        : { actual: diskContent, base: oldEntry.content };

      if (contentEquals(actualContent, baseContent)) {
        toUpdate.push({ relPath, newEntry });
      } else if (!contentEquals(actualContent, newEntry.content)) {
        // Differs from both baselines: a real conflict, merged from the old baseline at apply time.
        conflicts.push({ relPath, actualContent, baseContent, newEntry });
      } else if (!contentEquals(actualContent, diskContent)) {
        // Only the rewrite made it the new version: the file on disk still needs it.
        toUpdate.push({ relPath, newEntry });
      }
    }

    return { toUpdate, toAdd, conflicts, unknown, removedByUser, noLongerGenerated };
  }
}
