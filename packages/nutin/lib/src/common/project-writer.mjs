import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';

const fs = fsExtra.default;

const DELETED = Symbol('deleted');

/**
 * Every file a command writes goes through one of these
 * --dry-run runs the same code as a real run, only the writes are recorded instead of done.
 * Paths are absolute.
 * Reads go through what this run already wrote, so a later step sees an earlier one's output either way.
 */
export function createProjectWriter({ dryRun = false } = {}) {
  // Dry run only: absolute path → content (string or Buffer) or DELETED.
  const pending = new Map();
  // Absolute path → 'create' | 'modify' | 'delete', from whether it was on disk at its first write.
  const changes = new Map();

  async function record(filePath, kind) {
    if (!dryRun) return;
    if (!changes.has(filePath)) {
      changes.set(filePath, kind ?? ((await fs.pathExists(filePath)) ? 'modify' : 'create'));
    } else if (kind === 'delete') {
      // Created then deleted in the same run: nothing would change.
      if (changes.get(filePath) === 'create') changes.delete(filePath);
      else changes.set(filePath, 'delete');
    }
  }

  const writer = {
    dryRun,

    async pathExists(filePath) {
      if (pending.has(filePath)) return pending.get(filePath) !== DELETED;
      return fs.pathExists(filePath);
    },

    async readFile(filePath, encoding) {
      if (pending.has(filePath)) {
        const content = pending.get(filePath);
        if (content === DELETED) throw Object.assign(new Error(`ENOENT: no such file, open '${filePath}'`), { code: 'ENOENT' });
        return encoding && Buffer.isBuffer(content) ? content.toString(encoding) : content;
      }
      return fs.readFile(filePath, encoding);
    },

    async readJSON(filePath) {
      return JSON.parse(await writer.readFile(filePath, 'utf8'));
    },

    async writeFile(filePath, content) {
      await record(filePath);
      if (dryRun) {
        pending.set(filePath, content);
        return;
      }
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
    },

    // Same formatting as fs-extra's writeJSON(…, { spaces: 2 }).
    async writeJSON(filePath, value) {
      await writer.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
    },

    async remove(filePath) {
      if (!(await writer.pathExists(filePath))) return;
      await record(filePath, 'delete');
      if (dryRun) {
        pending.set(filePath, DELETED);
        return;
      }
      await fs.remove(filePath);
    },

    // Folders aren't listed: the files written in them are.
    async ensureDir(dirPath) {
      if (!dryRun) await fs.ensureDir(dirPath);
    },

    // A status line about a write ("Updated package.json."): it would be false in a dry run.
    info(message) {
      if (!dryRun) print.info(message);
    },

    printPlan(projectPath) {
      const byKind = { create: [], modify: [], delete: [] };
      for (const [filePath, kind] of changes) byKind[kind].push(path.relative(projectPath, filePath));

      const labels = { create: 'Would create', modify: 'Would modify', delete: 'Would delete' };
      if (changes.size === 0) print.info('\nNo file would change.');
      for (const kind of ['create', 'modify', 'delete']) {
        if (byKind[kind].length === 0) continue;
        print.section(`\n${labels[kind]} (${byKind[kind].length}):`);
        byKind[kind].sort().forEach((relPath) => print.section(`  - ${relPath}`));
      }
      print.boldSuccess('\nDry run: no files were changed.');
    },
  };

  return writer;
}

// For callers that don't pass a writer (nutin-new): writes straight to disk.
export const realWriter = createProjectWriter();
