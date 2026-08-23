import path from 'path';
import * as fsExtra from 'fs-extra';
import { print } from '../utils/print.mjs';

const fs = fsExtra.default;

const GENERATE_SEO_LINE_RE = /^([ \t]*generateSEOFiles:[^\n]*\n)/m;
const DOCKER_PORTS_LINE = '\n// Nutin features\n  dockerPorts: [9090],     // Ports the Docker container exposes/listens on — edit as needed\n';

export async function updateNutinConfig(projectPath, feature) {
  if (feature.key !== 'docker') return;

  const configPath = path.join(projectPath, 'nutin.config.js');
  const content = await fs.readFile(configPath, 'utf-8');

  if (/dockerPorts\s*:/.test(content)) {
    print.info('Kept existing "dockerPorts" value in nutin.config.js');
    return;
  }

  if (!GENERATE_SEO_LINE_RE.test(content)) {
    print.warn('Could not find a "generateSEOFiles:" line in nutin.config.js — add "dockerPorts: [9090]" to it manually before building.');
    return;
  }

  const updated = content.replace(GENERATE_SEO_LINE_RE, `$1${DOCKER_PORTS_LINE}`);
  await fs.writeFile(configPath, updated);
  print.warn('Added "dockerPorts" to nutin.config.js — edit it if you need different port(s).');
}
