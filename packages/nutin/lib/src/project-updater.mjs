import path from 'path';
import * as fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import * as Diff from 'diff';
import { print } from './print.mjs';
import { FileGenerator } from './file-generator.mjs';
import { FEATURES } from './feature-registry.mjs';
import { getCiCommand, detectPackageManager } from './package-manager.mjs';
import { packageVersion } from './version.mjs';
import { readProjectMeta, writeProjectMeta, updateProjectMeta } from './project-meta.mjs';
import { fetchOldTemplates } from './version-fetcher.mjs';

const fs = fsExtra.default;
const fileGenerator = new FileGenerator();
const REPORT_FILE_NAME = 'NUTIN-UPDATE-REPORT.md';

function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map((n) => parseInt(n, 10) || 0);
  return { major, minor, patch };
}

function compareVersions(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  return va.patch - vb.patch;
}

function contentEquals(a, b) {
  if (Buffer.isBuffer(a) || Buffer.isBuffer(b)) {
    return Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;
  }
  return a === b;
}

async function bootstrapProjectMeta(projectPath) {
  print.section('⚠️  No .nutin-meta.json found — this project predates nutin-update.');
  print.section('Answer a couple of questions so a baseline can be reconstructed:\n');

  const { version } = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: 'Which nutin version was this project originally created with (e.g. 1.3.1)?',
      validate: (input) => /^\d+\.\d+\.\d+$/.test(input.trim()) || 'Enter a version like 1.3.1',
    },
  ]);

  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Which optional features does this project have?',
      choices: FEATURES.map((feature) => ({ name: feature.key, value: feature.key })),
    },
  ]);

  const packageManager = await detectPackageManager(projectPath);
  const flags = Object.fromEntries(FEATURES.map((f) => [f.key, features.includes(f.key)]));

  return writeProjectMeta(projectPath, { version: version.trim(), packageManager, ...flags });
}

function printSummary({ toUpdate, toAdd, conflicts, unknown, removedByUser }) {
  print.section('\nSummary:');
  print.info(`  ${toUpdate.length} file(s) will be updated (untouched since generation)`);
  print.info(`  ${toAdd.length} new file(s) will be added`);
  if (conflicts.length > 0) {
    print.boldError(`  ${conflicts.length} file(s) you modified need manual attention`);
  }
  if (unknown.length > 0) {
    print.section(`  ${unknown.length} file(s) have no baseline to compare against — left untouched:`);
    unknown.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
  if (removedByUser.length > 0) {
    print.section(`  ${removedByUser.length} file(s) nutin used to generate but you removed — not recreated:`);
    removedByUser.forEach(({ relPath }) => print.section(`    - ${relPath}`));
  }
}

async function writeConflictReport(projectPath, conflicts, oldVersion, newVersion) {
  const sections = conflicts.map(({ relPath, actualContent, newEntry }) => {
    if (newEntry.isBinary || Buffer.isBuffer(actualContent)) {
      return `## ${relPath}\n\nBinary file — differs from both your recorded baseline and the new nutin version. Compare manually.\n`;
    }

    const patch = Diff.createTwoFilesPatch(
      relPath,
      relPath,
      actualContent,
      newEntry.content,
      'yours',
      `nutin v${newVersion}`,
    );
    return `## ${relPath}\n\n\`\`\`diff\n${patch}\`\`\`\n`;
  });

  const header = '# nutin-update report\n\n' +
    `These files changed between nutin v${oldVersion} and v${newVersion}, but you've customized them ` +
    'since generation, so they were left untouched. Review each diff below (yours vs. the new nutin ' +
    'version) and merge by hand.\n\n';

  await fs.writeFile(path.join(projectPath, REPORT_FILE_NAME), header + sections.join('\n'));
}

export async function updateProject(projectPath, options = {}) {
  const { yes = false, from } = options;

  const meta = (await readProjectMeta(projectPath)) ?? (await bootstrapProjectMeta(projectPath));

  const comparison = compareVersions(meta.version, packageVersion);
  if (comparison === 0) {
    print.boldSuccess(`✅ Already up to date (nutin v${packageVersion}).`);
    return;
  }
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

  print.boldHead(`\n🔄 Updating ${projectPath} from nutin v${meta.version} to v${packageVersion}...\n`);

  const { templatesRoot: oldTemplatesRoot, cleanup } = await fetchOldTemplates(meta.version, { from });

  try {
    const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
    const packageManager = meta.packageManager ?? (await detectPackageManager(projectPath));

    const baseContext = {
      projectName: packageJson.name,
      packageManager,
      ...meta.features,
      ciCommand: getCiCommand(packageManager),
    };

    const oldContext = { ...baseContext, version: meta.version };
    const newContext = { ...baseContext, version: packageVersion };
    const newTemplatesRoot = fileGenerator.getTemplatesRoot();

    const [oldTree, newTree] = await Promise.all([
      fileGenerator.collectTemplateTree(oldTemplatesRoot, oldContext),
      fileGenerator.collectTemplateTree(newTemplatesRoot, newContext),
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
        // unless something else already occupies that path (no baseline to judge it by).
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
        // Differs from both baselines — a real conflict. (If it already matches
        // the new version verbatim, there's nothing to do or report.)
        conflicts.push({ relPath, actualContent, newEntry });
      }
    }

    printSummary({ toUpdate, toAdd, conflicts, unknown, removedByUser });

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
  } finally {
    await cleanup();
  }
}
