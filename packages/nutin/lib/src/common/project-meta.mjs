import path from 'path';
import * as fsExtra from 'fs-extra';
import { FEATURES } from './feature-registry.mjs';
import { META_FILE_NAME } from './package-data.mjs';

const fs = fsExtra.default;

function metaPath(projectPath) {
  return path.join(projectPath, META_FILE_NAME);
}

function extractFeatures(context) {
  const features = {};
  for (const feature of FEATURES) {
    features[feature.key] = Boolean(context[feature.key]);
  }
  return features;
}

export async function writeProjectMeta(projectPath, context) {
  const meta = {
    version: context.version,
    packageManager: context.packageManager,
    lang: context.lang ?? 'ts',
    features: extractFeatures(context),
  };

  await fs.writeJSON(metaPath(projectPath), meta, { spaces: 2 });
  return meta;
}

export async function readProjectMeta(projectPath) {
  const file = metaPath(projectPath);
  if (!(await fs.pathExists(file))) {
    return null;
  }
  return fs.readJSON(file);
}

export async function updateProjectMeta(projectPath, patch) {
  const existing = (await readProjectMeta(projectPath)) ?? {};

  const merged = {
    ...existing,
    ...patch,
    features: {
      ...(existing.features ?? {}),
      ...(patch.features ?? {}),
    },
  };

  await fs.writeJSON(metaPath(projectPath), merged, { spaces: 2 });
  return merged;
}
