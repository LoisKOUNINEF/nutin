import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { getDockerScripts } from '../common/package-json-helper.mjs';

const fs = fsExtra.default;

function mergeAdditive(target, additions) {
  const merged = { ...target };
  const added = [];
  const skipped = [];

  for (const [key, value] of Object.entries(additions)) {
    if (Object.prototype.hasOwnProperty.call(merged, key)) {
      skipped.push(key);
    } else {
      merged[key] = value;
      added.push(key);
    }
  }

  return { merged, added, skipped };
}

export async function updatePackageJson(projectPath, feature) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJSON(packageJsonPath);
  
  const isDocker = feature.key === 'docker';

  let scripts = {};

  if (isDocker) {
    scripts = getDockerScripts();
  } else {
    return;
  }

  const scriptsResult = mergeAdditive(packageJson.scripts ?? {}, scripts);
  packageJson.scripts = scriptsResult.merged;

  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });

  const skipped = scriptsResult.skipped;
  if (skipped.length > 0) {
    print.info(`Kept existing package.json values for: ${skipped.join(', ')}`);
  }
  print.info('Updated package.json');
}
