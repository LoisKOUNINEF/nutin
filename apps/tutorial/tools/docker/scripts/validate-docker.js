import path from 'path';
import { errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
import { validateDockerPorts } from './docker-ports.js';
import { renderFromTemplate } from './render-docker-template.js';

const DOCKER_DIR = path.join(process.cwd(), 'tools', 'docker');
const PLACEHOLDER = '__PORTS_PLACEHOLDER__';

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
  ]).catch((err) => errorExit(err.message));
}

validateDocker().catch((err) => {
  errorExit(err, 'validate-docker');
});
