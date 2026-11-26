import path from 'path';
import { print } from '../utils/print.mjs';

import { realWriter } from '../common/project-writer.mjs';

const GENERATE_SEO_LINE_RE = /^([ \t]*generateSEOFiles:[^\n]*\n)/m;
const FEATURES_HEADER_RE = /^([ \t]*\/\/ Nutin features[^\n]*\n)/m;
const FEATURES_HEADER = '\n  // Nutin features\n';

const FEATURE_CONFIGS = {
  docker: {
    key: 'dockerPorts',
    lines: '  dockerPorts: [9090],     // Ports the Docker container exposes/listens on — edit as needed\n',
    added: 'Added "dockerPorts" to nutin.config.js: edit it if you need other ports.',
    manual: 'add "dockerPorts: [9090]" to it manually before building.',
  },
  markdown: {
    key: 'markdownSources',
    lines:
      '  markdownSources: {       // Markdown folders compiled to /generated/<name>.json at build time\n' +
      "    sourceFolders: ['markdown-content'], // folder paths, or { folder, hubFiles, routePrefix, sectionInPath, prefixReplacements, seo }\n" +
      '  },\n',
    added: 'Added "markdownSources" to nutin.config.js.',
    manual: 'add "markdownSources: { sourceFolders: [\'markdown-content\'] }" to it manually.',
  },
};

export async function updateNutinConfig(projectPath, feature, writer = realWriter) {
  const featureConfig = FEATURE_CONFIGS[feature.key];
  if (!featureConfig) return;

  const configPath = path.join(projectPath, 'nutin.config.js');
  const content = await writer.readFile(configPath, 'utf-8');

  if (new RegExp(`${featureConfig.key}\\s*:`).test(content)) {
    print.info(`Kept your existing "${featureConfig.key}" in nutin.config.js.`);
    return;
  }

  // Features share one "// Nutin features" block, created by whichever feature is added first.
  let updated;
  if (FEATURES_HEADER_RE.test(content)) {
    updated = content.replace(FEATURES_HEADER_RE, `$1${featureConfig.lines}`);
  } else if (GENERATE_SEO_LINE_RE.test(content)) {
    updated = content.replace(GENERATE_SEO_LINE_RE, `$1${FEATURES_HEADER}${featureConfig.lines}`);
  } else {
    print.warn(`Could not find a "generateSEOFiles:" line in nutin.config.js — ${featureConfig.manual}`);
    return;
  }

  await writer.writeFile(configPath, updated);
  writer.info(featureConfig.added);
}
