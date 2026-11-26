import path from 'path';
import { print } from '../utils/print.mjs';
import { getDockerScripts, getMarkdownScripts } from '../common/package-json-helper.mjs';

import { realWriter } from '../common/project-writer.mjs';

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

export async function updatePackageJson(projectPath, feature, writer = realWriter) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await writer.readJSON(packageJsonPath);
  
  const featureScripts = {
    docker: getDockerScripts,
    markdown: getMarkdownScripts,
  };

  if (!featureScripts[feature.key]) return;
  const scripts = featureScripts[feature.key]();

  const scriptsResult = mergeAdditive(packageJson.scripts ?? {}, scripts);
  const skipped = scriptsResult.skipped;
  if (skipped.length > 0) {
    print.info(`Kept your existing package.json scripts: ${skipped.join(', ')}.`);
  }
  if (skipped.length === Object.keys(scripts).length) return;

  packageJson.scripts = scriptsResult.merged;
  await writer.writeJSON(packageJsonPath, packageJson);
  writer.info('Updated package.json.');
}
