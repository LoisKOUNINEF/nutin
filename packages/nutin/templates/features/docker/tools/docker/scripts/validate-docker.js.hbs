import fs from 'fs';
import path from 'path';
import { errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
import { validateDockerPorts } from './docker-ports.js';
import { renderFromTemplate } from './render-docker-template.js';
import { markdownSourcesCopy } from './markdown-sources-copy.js';
import { localeRedirects } from './locale-redirects.js';

const DOCKER_DIR = path.join(process.cwd(), 'tools', 'docker');
const PLACEHOLDER = '__PORTS_PLACEHOLDER__';
const ROOT_REDIRECT_PLACEHOLDER = '__ROOT_REDIRECT_PLACEHOLDER__';
const MARKDOWN_SOURCES_PLACEHOLDER = '__MARKDOWN_SOURCES_PLACEHOLDER__';

function rootRedirect() {
  if (!nutinConfig.i18n) return '';

  const languagesConfigPath = path.join(process.cwd(), 'config', 'languages.json');
  const { languages, defaultLanguage } = JSON.parse(fs.readFileSync(languagesConfigPath, 'utf-8'));
  return localeRedirects({ i18n: true, languages, defaultLanguage });
}

async function validateDocker() {
  let ports;
  try {
    ports = validateDockerPorts(nutinConfig.dockerPorts);
  } catch (err) {
    errorExit(err.message);
  }

  let markdownCopy;
  try {
    markdownCopy = markdownSourcesCopy(nutinConfig.markdownSources?.sourceFolders);
  } catch (err) {
    errorExit(err.message);
  }

  await renderFromTemplate(DOCKER_DIR, 'Dockerfile.template', 'Dockerfile', [
    [PLACEHOLDER, ports.join(' ')],
    ['__PRIMARY_PORT_PLACEHOLDER__', String(ports[0])],
    [MARKDOWN_SOURCES_PLACEHOLDER, markdownCopy],
  ]).catch((err) => errorExit(err.message));

  let redirects;
  try {
    redirects = rootRedirect();
  } catch (err) {
    errorExit(err.message);
  }

  await renderFromTemplate(DOCKER_DIR, 'nginx.conf.template', 'nginx.conf', [
    [PLACEHOLDER, ports.map((port) => `listen ${port};`).join('\n    ')],
    [ROOT_REDIRECT_PLACEHOLDER, redirects],
  ]).catch((err) => errorExit(err.message));
}

validateDocker().catch((err) => {
  errorExit(err, 'validate-docker');
});
