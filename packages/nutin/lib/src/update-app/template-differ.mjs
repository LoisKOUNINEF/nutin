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

    const toUpdate = [];
    const toAdd = [];
    const conflicts = [];
    const unknown = [];
    const removedByUser = [];

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
        // Nutin no longer generates this file; leave it alone either way.
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

    return { toUpdate, toAdd, conflicts, unknown, removedByUser };
  }
}
