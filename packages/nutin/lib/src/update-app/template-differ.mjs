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

// Paths the user is expected to hand-edit right after `create-app` — their generated
// content is just placeholder/starter scaffolding, so nutin-update must never rewrite
// or conflict-flag them.
const FULLY_EXCLUDED_PATTERNS = [
  /^config\/[^/]+\.json$/,
  /^src\/app(\/|$)/,
  /^src\/assets(\/|$)/,
];

// Like FULLY_EXCLUDED_PATTERNS, but only for files that already existed before this
// update — a brand new file introduced by a newer template version should still be added.
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

  async diff(projectPath, oldTemplatesRoot, oldContext, newContext) {
    const newTemplatesRoot = this.fileGenerator.getTemplatesRoot();

    const [oldTree, newTree] = await Promise.all([
      this.fileGenerator.collectTemplateTree(oldTemplatesRoot, oldContext),
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

      const actualContent = oldEntry.isBinary
        ? await fs.readFile(outputPath)
        : await fs.readFile(outputPath, 'utf8');

      if (contentEquals(actualContent, oldEntry.content)) {
        toUpdate.push({ relPath, newEntry });
      } else if (!contentEquals(actualContent, newEntry.content)) {
        // Differs from both baselines — a real conflict.
        conflicts.push({ relPath, actualContent, newEntry });
      }
    }

    return { toUpdate, toAdd, conflicts, unknown, removedByUser, noLongerGenerated };
  }
}
