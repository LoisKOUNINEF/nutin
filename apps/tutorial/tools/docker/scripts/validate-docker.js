import path from 'path';
import { errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
// Imported directly, not via the utils barrel: it validates nutin.config.js "i18n" on load.
import { I18N_ENABLED, DEFAULT_LANGUAGE } from '../../utils/languages.js';
import { validateDockerPorts } from './docker-ports.js';
import { renderFromTemplate } from './render-docker-template.js';
import { markdownSourcesCopy } from './markdown-sources-copy.js';

const DOCKER_DIR = path.join(process.cwd(), 'tools', 'docker');
const PLACEHOLDER = '__PORTS_PLACEHOLDER__';
const ROOT_REDIRECT_PLACEHOLDER = '__ROOT_REDIRECT_PLACEHOLDER__';
const MARKDOWN_SOURCES_PLACEHOLDER = '__MARKDOWN_SOURCES_PLACEHOLDER__';

// Only i18n builds serve every page under a language prefix — without it, "/" is a real page.
function rootRedirect() {
  if (!I18N_ENABLED) return '';

  return `location = / {\n        return 301 /${DEFAULT_LANGUAGE}/$is_args$args;\n    }`;
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

  await renderFromTemplate(DOCKER_DIR, 'nginx.conf.template', 'nginx.conf', [
    [PLACEHOLDER, ports.map((port) => `listen ${port};`).join('\n    ')],
    [ROOT_REDIRECT_PLACEHOLDER, rootRedirect()],
  ]).catch((err) => errorExit(err.message));
}

validateDocker().catch((err) => {
  errorExit(err, 'validate-docker');
});
