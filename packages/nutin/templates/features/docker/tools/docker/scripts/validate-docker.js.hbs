import path from 'path';
import { errorExit, isDryRun } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
// Imported directly, not via the utils barrel: it validates nutin.config.js "i18n" on load.
import { I18N_ENABLED, LANGUAGES, DEFAULT_LANGUAGE } from '../../utils/languages.js';
import { validateDockerPorts } from './docker-ports.js';
import { renderTemplate, renderFromTemplate } from './render-docker-template.js';
import { markdownSourcesCopy } from './markdown-sources-copy.js';
import { localeRedirects } from './locale-redirects.js';

const DOCKER_DIR = path.join(process.cwd(), 'tools', 'docker');
const PLACEHOLDER = '__PORTS_PLACEHOLDER__';
const ROOT_REDIRECT_PLACEHOLDER = '__ROOT_REDIRECT_PLACEHOLDER__';
const MARKDOWN_SOURCES_PLACEHOLDER = '__MARKDOWN_SOURCES_PLACEHOLDER__';

// docker:build --dry-run (NUTIN_DRY_RUN): everything is checked, but Dockerfile and nginx.conf aren't rewritten.
const DRY_RUN = isDryRun();

function render(templateName, outputName, replacements) {
  return DRY_RUN
    ? renderTemplate(DOCKER_DIR, templateName, replacements)
    : renderFromTemplate(DOCKER_DIR, templateName, outputName, replacements);
}

function rootRedirect() {
  return localeRedirects({ i18n: I18N_ENABLED, languages: LANGUAGES, defaultLanguage: DEFAULT_LANGUAGE });
}

async function validateDocker() {
  let ports;
  try {
    ports = validateDockerPorts(nutinConfig.dockerPorts);
  } catch (err) {
    errorExit(err.message, 'validate-docker');
  }

  let markdownCopy;
  try {
    markdownCopy = markdownSourcesCopy(nutinConfig.markdownSources?.sourceFolders);
  } catch (err) {
    errorExit(err.message, 'validate-docker');
  }

  await render('Dockerfile.template', 'Dockerfile', [
    [PLACEHOLDER, ports.join(' ')],
    ['__PRIMARY_PORT_PLACEHOLDER__', String(ports[0])],
    [MARKDOWN_SOURCES_PLACEHOLDER, markdownCopy],
  ]).catch((err) => errorExit(err.message, 'validate-docker'));

  let redirects;
  try {
    redirects = rootRedirect();
  } catch (err) {
    errorExit(err.message, 'validate-docker');
  }

  await render('nginx.conf.template', 'nginx.conf', [
    [PLACEHOLDER, ports.map((port) => `listen ${port};`).join('\n    ')],
    [ROOT_REDIRECT_PLACEHOLDER, redirects],
  ]).catch((err) => errorExit(err.message, 'validate-docker'));
}

validateDocker().catch((err) => {
  errorExit(err, 'validate-docker');
});
