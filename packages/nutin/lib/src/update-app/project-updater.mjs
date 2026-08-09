import path from 'path';
import * as fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import { print } from '../utils/print.mjs';
import { PACKAGE_VERSION as packageVersion } from '../common/package-data.mjs';
import { readProjectMeta, updateProjectMeta } from '../common/project-meta.mjs';
import { fetchOldTemplates } from './fetch-old-templates.mjs';
import { parseVersion, compareVersions } from './version-compare.mjs';
import { bootstrapProjectMeta } from './meta-bootstrap-prompt.mjs';
import { printUpdateSummary } from './update-summary-printer.mjs';
import { writeConflictReport } from './conflict-report-writer.mjs';
import { UpdateContextBuilder } from './update-context-builder.mjs';
import { TemplateDiffer } from './template-differ.mjs';

const fs = fsExtra.default;
const REPORT_FILE_NAME = 'NUTIN-UPDATE-REPORT.md';

export class ProjectUpdater {
  constructor() {
    this.contextBuilder = new UpdateContextBuilder();
    this.differ = new TemplateDiffer();
  }

  async updateProject(projectPath, options = {}) {
    const { yes = false, from } = options;
    const meta = await this.resolveMeta(projectPath);

    if (this.isUpToDate(meta)) {
      print.boldSuccess(`✅ Already up to date (nutin v${packageVersion}).`);
      return;
    }
    this.assertUpdatable(meta);

    print.boldHead(`\n🔄 Updating ${projectPath} from nutin v${meta.version} to v${packageVersion}...\n`);

    const { templatesRoot: oldTemplatesRoot, cleanup } = await fetchOldTemplates(meta.version, { from });

    try {
      const changeSet = await this.computeChangeSet(projectPath, meta, oldTemplatesRoot);
      await this.applyChangeSet(projectPath, meta, changeSet, { yes });
    } finally {
      await cleanup();
    }
  }

  async resolveMeta(projectPath) {
    return (await readProjectMeta(projectPath)) ?? (await bootstrapProjectMeta(projectPath));
  }

  isUpToDate(meta) {
    return compareVersions(meta.version, packageVersion) === 0;
  }

  assertUpdatable(meta) {
    const comparison = compareVersions(meta.version, packageVersion);
    if (comparison > 0) {
      throw new Error(
        `This project records nutin v${meta.version}, but the installed CLI is v${packageVersion}. ` +
        'Install the latest nutin before running nutin-update.',
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
    return this.differ.diff(projectPath, oldTemplatesRoot, oldContext, newContext);
  }

  async applyChangeSet(projectPath, meta, changeSet, { yes }) {
    const { toUpdate, toAdd, conflicts, unknown, removedByUser } = changeSet;
    printUpdateSummary({ toUpdate, toAdd, conflicts, unknown, removedByUser });

    if (toUpdate.length === 0 && toAdd.length === 0 && conflicts.length === 0) {
      print.boldSuccess('\n✅ Nothing to update.');
      await updateProjectMeta(projectPath, { version: packageVersion });
      return;
    }

    if (!yes && (toUpdate.length > 0 || toAdd.length > 0)) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: `\nApply ${toUpdate.length + toAdd.length} safe file update(s)?`,
          default: true,
        },
      ]);
      if (!proceed) {
        print.section('Aborted — no files were changed.');
        return;
      }
    }

    for (const { relPath, newEntry } of [...toUpdate, ...toAdd]) {
      const outputPath = path.join(projectPath, relPath);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, newEntry.content);
    }

    if (conflicts.length > 0) {
      await writeConflictReport(projectPath, conflicts, meta.version, packageVersion);
      print.boldError(`\n⚠️  ${conflicts.length} file(s) you modified need manual attention — see ${REPORT_FILE_NAME}`);
    }

    await updateProjectMeta(projectPath, { version: packageVersion });

    print.boldSuccess(`\n✅ Updated to nutin v${packageVersion}.`);
  }
}

export const projectUpdater = new ProjectUpdater();

export async function updateProject(projectPath, options = {}) {
  return projectUpdater.updateProject(projectPath, options);
}
