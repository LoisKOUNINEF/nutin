import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';
import { getDeployHelperScripts, getTestinNutinScripts, getTestinNutinExtras, installDependencies } from '../common/package-json-helper.mjs';

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

export async function updatePackageJson(projectPath, feature, context) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJSON(packageJsonPath);

  let scripts = {};
  let extras = {};

  if (feature.key === 'deployHelper') {
    scripts = getDeployHelperScripts(context);
  } else if (feature.key === 'testinNutin') {
    scripts = getTestinNutinScripts(context);
    extras = getTestinNutinExtras();
  } else {
    return;
  }

  const scriptsResult = mergeAdditive(packageJson.scripts ?? {}, scripts);
  const devDepsResult = mergeAdditive(packageJson.devDependencies ?? {}, extras.devDependencies ?? {});
  const importsResult = mergeAdditive(packageJson.imports ?? {}, extras.imports ?? {});
  const enginesResult = mergeAdditive(packageJson.engines ?? {}, extras.engines ?? {});

  packageJson.scripts = scriptsResult.merged;
  if (extras.devDependencies) packageJson.devDependencies = devDepsResult.merged;
  if (extras.imports) packageJson.imports = importsResult.merged;
  if (extras.engines) packageJson.engines = enginesResult.merged;

  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });

  const skipped = [...scriptsResult.skipped, ...devDepsResult.skipped, ...importsResult.skipped, ...enginesResult.skipped];
  if (skipped.length > 0) {
    print.info(`Kept existing package.json values for: ${skipped.join(', ')}`);
  }
  print.info('Updated package.json');

  await installDependencies(projectPath, context.packageManager);
}
