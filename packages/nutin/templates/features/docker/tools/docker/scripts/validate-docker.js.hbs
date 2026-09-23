import fs from 'fs';
import path from 'path';
import { errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
import { validateDockerPorts } from './docker-ports.js';
import { renderFromTemplate } from './render-docker-template.js';

const DOCKER_DIR = path.join(process.cwd(), 'tools', 'docker');
const PLACEHOLDER = '__PORTS_PLACEHOLDER__';
const ROOT_REDIRECT_PLACEHOLDER = '__ROOT_REDIRECT_PLACEHOLDER__';

// Only i18n builds serve every page under a language prefix — without it, "/" is a real page.
function rootRedirect() {
  if (!nutinConfig.i18n) return '';

  const languagesConfigPath = path.join(process.cwd(), 'config', 'languages.json');
  const { defaultLanguage } = JSON.parse(fs.readFileSync(languagesConfigPath, 'utf-8'));
  return `location = / {\n        return 301 /${defaultLanguage}/$is_args$args;\n    }`;
}

async function validateDocker() {
  let ports;
  try {
    ports = validateDockerPorts(nutinConfig.dockerPorts);
  } catch (err) {
    errorExit(err.message);
  }

  await renderFromTemplate(DOCKER_DIR, 'Dockerfile.template', 'Dockerfile', [
    [PLACEHOLDER, ports.join(' ')],
    ['__PRIMARY_PORT_PLACEHOLDER__', String(ports[0])],
  ]).catch((err) => errorExit(err.message));

  await renderFromTemplate(DOCKER_DIR, 'nginx.conf.template', 'nginx.conf', [
    [PLACEHOLDER, ports.map((port) => `listen ${port};`).join('\n    ')],
    [ROOT_REDIRECT_PLACEHOLDER, rootRedirect()],
  ]).catch((err) => errorExit(err.message));
}

validateDocker().catch((err) => {
  errorExit(err, 'validate-docker');
});
