#!/usr/bin/env node

import { readFileSync } from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { print, errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
import { validateDockerPorts } from './docker-ports.js';
import { RUN_FLAGS, parseDockerFlags, runCommand, imageName, containerName, helpText } from './docker-args.js';

const USAGE = 'npm run docker:run -- [flags]';

let flags;
try {
  flags = parseDockerFlags(process.argv.slice(2), RUN_FLAGS);
} catch (err) {
  errorExit(err.message, 'docker:run');
}

if (flags.help) {
  console.info(helpText(RUN_FLAGS, USAGE));
  process.exit(0);
}

const { name: projectName } = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

let command;
try {
  const ports = validateDockerPorts(nutinConfig.dockerPorts);
  command = { ...runCommand(flags, { image: imageName(projectName), container: containerName(projectName), ports }), ports };
} catch (err) {
  errorExit(err.message, 'docker:run');
}

const { args, name, rm, ports } = command;

// Docker's own error for a taken name is a long "Conflict..." line: say what to do instead.
// Exit status 0 means the container exists; anything else (none, no docker) is left to docker run.
if (spawnSync('docker', ['container', 'inspect', name], { stdio: 'ignore' }).status === 0) {
  errorExit(`A container named "${name}" already exists: stop it (docker stop ${name}) and remove it (docker rm ${name}), or pass --name <other>.`, 'docker:run');
}

print.boldSection(`Running: docker ${args.join(' ')}`);

const child = spawn('docker', args, { stdio: 'inherit' });
child.on('error', (err) => {
  print.boldError(`Failed to start docker: ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => {
  if (code === 0 && flags.detach) {
    print.info(`\nContainer "${name}" is running in the background, on port${ports.length > 1 ? 's' : ''} ${ports.join(', ')}.`);
    print.gray(`  Logs: docker logs -f ${name}`);
    print.gray(`  Stop: docker stop ${name}${rm ? '' : ` && docker rm ${name}`}`);
  }
  process.exit(code ?? 1);
});
