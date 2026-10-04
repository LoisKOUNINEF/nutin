import path from 'path';
import * as fsExtra from 'fs-extra';
import { JsonManager } from '../create-app/json-manager.mjs';

const fs = fsExtra.default;

// package.json and tsconfig.json aren't rendered from templates (JsonManager writes them
// once, at creation), so the template diff never sees them. They're compared with what
// this CLI would generate instead, and only reported: the user owns these files.
// Only the entries nutin generates are compared; anything the user added is ignored.
const PACKAGE_JSON_SECTIONS = ['scripts', 'devDependencies'];

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareEntries(file, section, yours = {}, generated = {}) {
  return Object.entries(generated)
    .filter(([key, value]) => !same(yours[key], value))
    .map(([key, value]) => ({ file, key: section ? `${section}.${key}` : key, yours: yours[key], nutin: value }));
}

async function readJsonIfExists(filePath) {
  if (!(await fs.pathExists(filePath))) return null;
  try {
    return await fs.readJSON(filePath);
  } catch {
    return null;
  }
}

export async function findJsonDrift(projectPath, context) {
  const jsonManager = new JsonManager();
  const drift = [];

  const packageJson = await readJsonIfExists(path.join(projectPath, 'package.json'));
  if (packageJson) {
    const generated = jsonManager.buildPackageJson(context);
    for (const section of PACKAGE_JSON_SECTIONS) {
      drift.push(...compareEntries('package.json', section, packageJson[section], generated[section]));
    }
  }

  if (context.lang !== 'js') {
    const tsconfig = await readJsonIfExists(path.join(projectPath, 'tsconfig.json'));
    if (tsconfig) {
      const generated = jsonManager.buildTsconfigJson();
      drift.push(...compareEntries('tsconfig.json', 'compilerOptions', tsconfig.compilerOptions, generated.compilerOptions));
      drift.push(...compareEntries('tsconfig.json', null, { include: tsconfig.include, exclude: tsconfig.exclude }, { include: generated.include, exclude: generated.exclude }));
    }
  }

  return drift;
}
