import path from 'path';
import { FEATURES } from './feature-registry.mjs';
import { META_FILE_NAME } from './package-data.mjs';
import { realWriter } from './project-writer.mjs';

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

// writer: see project-writer.mjs (a dry run records the write instead).
export async function writeProjectMeta(projectPath, context, writer = realWriter) {
  const meta = {
    version: context.version,
    packageManager: context.packageManager,
    lang: context.lang ?? 'ts',
    extension: context.extension ?? false,
    features: extractFeatures(context),
  };

  await writer.writeJSON(metaPath(projectPath), meta);
  return meta;
}

export async function readProjectMeta(projectPath, writer = realWriter) {
  const file = metaPath(projectPath);
  if (!(await writer.pathExists(file))) {
    return null;
  }
  return writer.readJSON(file);
}

export async function updateProjectMeta(projectPath, patch, writer = realWriter) {
  const existing = (await readProjectMeta(projectPath, writer)) ?? {};

  const merged = {
    ...existing,
    ...patch,
    features: {
      ...(existing.features ?? {}),
      ...(patch.features ?? {}),
    },
  };

  await writer.writeJSON(metaPath(projectPath), merged);
  return merged;
}
