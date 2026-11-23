import path from 'path';
import { errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
// Imported directly, not via the utils barrel: it validates nutin.config.js "i18n" on load.
import { I18N_ENABLED, LANGUAGES, DEFAULT_LANGUAGE } from '../../utils/languages.js';
import { validateDockerPorts } from './docker-ports.js';
import { renderFromTemplate } from './render-docker-template.js';
import { markdownSourcesCopy } from './markdown-sources-copy.js';
import { localeRedirects } from './locale-redirects.js';

const DOCKER_DIR = path.join(process.cwd(), 'tools', 'docker');
const PLACEHOLDER = '__PORTS_PLACEHOLDER__';
const ROOT_REDIRECT_PLACEHOLDER = '__ROOT_REDIRECT_PLACEHOLDER__';
const MARKDOWN_SOURCES_PLACEHOLDER = '__MARKDOWN_SOURCES_PLACEHOLDER__';

function rootRedirect() {
  return localeRedirects({ i18n: I18N_ENABLED, languages: LANGUAGES, defaultLanguage: DEFAULT_LANGUAGE });
}

async function validateDocker() {
  let ports;
  try {
    ports = validateDockerPorts(nutinConfig.dockerPorts);
  } catch (err) {
    errorExit(err.message);
  }

  // Website: the monorepo Dockerfile.template copies resources/ itself and has no
  // markdown placeholder, so the (outside-the-project) markdown folders are only
  // resolved into COPY lines when a template actually asks for them.
  const dockerTemplate = fs.readFileSync(path.join(DOCKER_DIR, 'Dockerfile.template'), 'utf-8');
  let markdownCopy = '';
  if (dockerTemplate.includes(MARKDOWN_SOURCES_PLACEHOLDER)) {
    try {
      markdownCopy = markdownSourcesCopy(nutinConfig.markdownSources?.sourceFolders);
    } catch (err) {
      errorExit(err.message);
    }
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
