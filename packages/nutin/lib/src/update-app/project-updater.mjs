import path from 'path';
import * as fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import { print } from '../utils/print.mjs';
import { PACKAGE_VERSION as packageVersion, META_FILE_NAME } from '../common/package-data.mjs';
import { readProjectMeta, updateProjectMeta } from '../common/project-meta.mjs';
import { fetchOldTemplates } from './fetch-old-templates.mjs';
import { parseVersion, compareVersions } from './version-compare.mjs';
import { bootstrapProjectMeta } from '../common/meta-bootstrap-prompt.mjs';
import { printUpdateSummary } from './update-summary-printer.mjs';
import { writeUpdateReport, REPORT_FILE_NAME } from './conflict-report-writer.mjs';
import { mergeFile, hasConflictMarkers, CONFLICT_MARKER } from './three-way-merge.mjs';
import { isGitAvailable, getWorkingTreeStatus } from '../common/git.mjs';
import { UpdateContextBuilder } from './update-context-builder.mjs';
import { TemplateDiffer } from './template-differ.mjs';
import { findJsonDrift } from './json-drift.mjs';
import { detectI18nMigration, findI18nReferences, applyI18nMigration, NUTIN_CONFIG_FILE } from './i18n-migration.mjs';
import { buildMergePreparer } from './merge-preparers.mjs';

const fs = fsExtra.default;

const UNDO_COMMAND = 'git checkout -- . && git clean -fd';

export class ProjectUpdater {
  constructor() {
    this.contextBuilder = new UpdateContextBuilder();
    this.differ = new TemplateDiffer();
  }

  async updateProject(projectPath, options = {}) {
    const { yes = false, from, allowDirty = false } = options;
    // Read before anything here writes .nutin-meta.json (bootstrap, resolved conflicts), so only your
    // own changes count. Enforced right before the first file write.
    const gitStatus = allowDirty ? null : await getWorkingTreeStatus(projectPath);
    const meta = await this.resolveMeta(projectPath);
    await this.assertNoConflictMarkers(projectPath, meta);

    if (this.isUpToDate(meta)) {
      print.boldSuccess(`✅ Already up to date (nutin v${packageVersion}).`);
      return;
    }
    this.assertUpdatable(meta);

    print.boldHead(`\n🔄 Updating ${projectPath} from nutin v${meta.version} to v${packageVersion}...\n`);

    const { templatesRoot: oldTemplatesRoot, cleanup } = await fetchOldTemplates(meta.version, { from });

    try {
      const changeSet = await this.computeChangeSet(projectPath, meta, oldTemplatesRoot);
      await this.applyChangeSet(projectPath, meta, changeSet, { yes, gitStatus });
    } finally {
      await cleanup();
    }
  }

  async resolveMeta(projectPath) {
    const meta = (await readProjectMeta(projectPath)) ?? (await bootstrapProjectMeta(projectPath));
    this.assertValidVersion(meta.version);
    return meta;
  }

  // meta.version ends up interpolated into a shell command in fetchOldTemplates
  // (npm pack), so it must be strictly numeric before anything downstream uses it —
  // .nutin-meta.json is a plain project file that could be hand-edited or come from
  // an untrusted clone.
  assertValidVersion(version) {
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(
        `${META_FILE_NAME} has an invalid version "${version}" — expected a version in major.minor.patch format, e.g. "1.3.1". ` +
        `Fix or delete ${META_FILE_NAME} and try again.`,
      );
    }
  }

  // Files the last update left with conflict markers (meta.unmergedFiles): nothing is updated until
  // they're resolved, so a merge never runs on top of markers and a re-run still reports them.
  async assertNoConflictMarkers(projectPath, meta) {
    const unmerged = meta.unmergedFiles ?? [];
    if (unmerged.length === 0) return;

    const stillMarked = [];
    for (const relPath of unmerged) {
      if (await hasConflictMarkers(path.join(projectPath, relPath))) stillMarked.push(relPath);
    }
    if (stillMarked.length > 0) {
      throw new Error(
        `${stillMarked.length} file(s) still have conflict markers from the last update — the project won't build until ` +
        `they're resolved. Search for "${CONFLICT_MARKER}", merge, then run nutin-update again:\n` +
        stillMarked.map((relPath) => `  - ${relPath}`).join('\n'),
      );
    }

    await updateProjectMeta(projectPath, { unmergedFiles: [] });
    print.info('Conflict markers from the last update are resolved.');
  }

  isUpToDate(meta) {
    return compareVersions(meta.version, packageVersion) === 0;
  }

  assertUpdatable(meta) {
    const comparison = compareVersions(meta.version, packageVersion);
    if (comparison > 0) {
      throw new Error(
        `This project records nutin v${meta.version}, but the installed CLI is v${packageVersion}. ` +
        'Install the latest nutin with "npm i -g @nutin/cli" before running nutin-update.',
      );
    }
    if (parseVersion(meta.version).major !== parseVersion(packageVersion).major) {
      throw new Error(
        `nutin-update only handles minor/patch updates. Project is on v${meta.version}, installed CLI is ` +
        `v${packageVersion} — that's a major version change. Please migrate manually (see the changelog).`,
      );
    }
  }

  async computeChangeSet(projectPath, meta, oldTemplatesRoot) {
    const { oldContext, newContext } = await this.contextBuilder.buildContexts(projectPath, meta);
    // config/languages.json → nutin.config.js "i18n": see i18n-migration.mjs.
    const i18nMigration = await detectI18nMigration(projectPath);
    const prepare = buildMergePreparer({ i18nMigration });
    const { generatedPaths, ...changeSet } = await this.differ.diff(projectPath, oldTemplatesRoot, oldContext, newContext, { prepare });
    // Your files only: nutin's own still mention languages.json until this update rewrites them.
    if (i18nMigration) Object.assign(i18nMigration, await findI18nReferences(projectPath, generatedPaths));
    return { ...changeSet, jsonDrift: await findJsonDrift(projectPath, newContext), i18nMigration };
  }

  async applyChangeSet(projectPath, meta, changeSet, { yes, gitStatus = null }) {
    const { toUpdate, toAdd, conflicts, unknown, removedByUser, noLongerGenerated, jsonDrift, i18nMigration = null } = changeSet;
    printUpdateSummary({ toUpdate, toAdd, conflicts, unknown, removedByUser, noLongerGenerated, jsonDrift, i18nMigration });

    if (toUpdate.length === 0 && toAdd.length === 0 && conflicts.length === 0 && !i18nMigration) {
      print.boldSuccess('\n✅ Nothing to update.');
      await updateProjectMeta(projectPath, { version: packageVersion });
      return;
    }

    // Binary files can't be merged: they're kept as they are and listed in the report.
    const toMerge = conflicts.filter(({ newEntry, actualContent }) => !newEntry.isBinary && !Buffer.isBuffer(actualContent));
    const binaryConflicts = conflicts.filter((conflict) => !toMerge.includes(conflict));

    if (gitStatus) this.assertPristine(gitStatus);

    if (toMerge.length > 0 && !(await isGitAvailable())) {
      throw new Error(
        `nutin-update needs git to merge the ${toMerge.length} file(s) you edited, but git was not found. ` +
        'Install git and run nutin-update again. No files were changed.',
      );
    }

    if (!yes && (toUpdate.length > 0 || toAdd.length > 0 || toMerge.length > 0 || i18nMigration)) {
      if (!process.stdin.isTTY) {
        print.warn('\n⚠️ Non-interactive shell detected — skipping the confirmation prompt.');
        print.boldInfo('Re-run with --yes to apply these updates automatically. No files were changed.');
        return;
      }

      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `\n${confirmationMessage({ fileCount: toUpdate.length + toAdd.length, mergeCount: toMerge.length, i18nMigration })}`,
          default: true,
        },
      ]);
      if (!proceed) {
        print.boldInfo('Aborted — no files were changed.');
        return;
      }
    }

    for (const { relPath, newEntry } of [...toUpdate, ...toAdd]) {
      const outputPath = path.join(projectPath, relPath);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, newEntry.content);
    }

    const { merged, conflicted } = await this.mergeEditedFiles(projectPath, meta, toMerge);

    const manualSteps = [];
    if (i18nMigration) {
      const configConflicted = conflicted.some(({ relPath }) => relPath === NUTIN_CONFIG_FILE);
      const { messages, manualSteps: steps } = await applyI18nMigration(projectPath, i18nMigration, { conflicted: configConflicted });
      messages.forEach((message) => print.info(message));
      manualSteps.push(...steps);
    }

    if (merged.length > 0 || conflicted.length > 0 || binaryConflicts.length > 0 || manualSteps.length > 0) {
      await writeUpdateReport(projectPath, { merged, conflicted, binaryConflicts, manualSteps }, meta.version, packageVersion);
    }

    await updateProjectMeta(projectPath, {
      version: packageVersion,
      unmergedFiles: conflicted.map(({ relPath }) => relPath),
    });

    if (merged.length > 0) {
      print.info(`\n${merged.length} file(s) you edited were merged with the new version — review them (listed in ${REPORT_FILE_NAME}).`);
    }
    if (binaryConflicts.length > 0) {
      print.boldError(`\n⚠️  ${binaryConflicts.length} binary file(s) you modified were left as they are — see ${REPORT_FILE_NAME}`);
    }
    if (manualSteps.length > 0) {
      print.boldError(`\n⚠️  To do by hand (also in ${REPORT_FILE_NAME}):`);
      manualSteps.forEach((step) => print.boldError(`    - ${step}`));
    }
    if (conflicted.length > 0) {
      print.boldError(
        `\n⚠️  ${conflicted.length} file(s) have conflict markers — the project won't build until they're resolved ` +
        `(search for "${CONFLICT_MARKER}"):`,
      );
      conflicted.forEach(({ relPath }) => print.boldError(`    - ${relPath}`));
    }
    if (gitStatus) {
      print.info(`\nTo undo this update, run from the project folder: ${UNDO_COMMAND}`);
      print.info(`Important: this will also remove any untracked folder.`);
    }

    print.boldSuccess(`\n✅ Updated to nutin v${packageVersion}.`);
  }

  // The update must be undoable with git: no uncommitted changes and no untracked files in the
  // project folder, so checkout + clean only reverts what the update wrote. --allow-dirty skips this.
  assertPristine({ repo, gitFound, changes }) {
    if (!gitFound) {
      throw new Error('git was not found: nutin-update uses it to make the update undoable. Install git, or pass --allow-dirty. No files were changed.');
    }
    if (!repo) {
      throw new Error(
        'This project isn\'t in a git repository, so the update couldn\'t be undone. Run "git init" and commit, ' +
        'or pass --allow-dirty. No files were changed.',
      );
    }
    if (changes.length > 0) {
      throw new Error(
        'Commit or stash your changes first (untracked files included), so the update can be undone with git, ' +
        `or pass --allow-dirty. No files were changed:\n${changes.map((line) => `    ${line}`).join('\n')}`,
      );
    }
  }

  // Three-way merge of each file you edited: the old nutin version is the base, so your edits and
  // nutin's changes are both kept, and only overlapping edits get conflict markers.
  async mergeEditedFiles(projectPath, meta, toMerge) {
    const merged = [];
    const conflicted = [];
    const labels = { base: `nutin v${meta.version}`, theirs: `nutin v${packageVersion}` };

    for (const { relPath, actualContent, baseContent, newEntry } of toMerge) {
      const { content, conflictCount } = await mergeFile({
        base: baseContent,
        yours: actualContent,
        theirs: newEntry.content,
        labels,
      });
      await fs.writeFile(path.join(projectPath, relPath), content);
      if (conflictCount > 0) conflicted.push({ relPath, conflictCount });
      else merged.push({ relPath });
    }

    return { merged, conflicted };
  }
}

// "Apply 3 file update(s), merge 1 file(s) you edited and migrate config/languages.json?"
export function confirmationMessage({ fileCount, mergeCount, i18nMigration }) {
  const actions = [
    fileCount > 0 && `apply ${fileCount} file update(s)`,
    mergeCount > 0 && `merge ${mergeCount} file(s) you edited`,
    i18nMigration && 'migrate config/languages.json',
  ].filter(Boolean);
  const text = actions.length > 1 ? `${actions.slice(0, -1).join(', ')} and ${actions.at(-1)}` : actions[0] ?? 'apply 0 file update(s)';
  return `${text[0].toUpperCase()}${text.slice(1)}?`;
}

export const projectUpdater = new ProjectUpdater();

export async function updateProject(projectPath, options = {}) {
  return projectUpdater.updateProject(projectPath, options);
}
