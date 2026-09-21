#!/usr/bin/env node

import { readFileSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { print, errorExit } from '../../utils/index.js';
import nutinConfig from '../../../nutin.config.js';
import { validateDockerPorts } from './docker-ports.js';

const { name: projectName } = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

let ports;
try {
  ports = validateDockerPorts(nutinConfig.dockerPorts);
} catch (err) {
  errorExit(err.message);
}

const portArgs = ports.flatMap((port) => ['-p', `${port}:${port}`]);
const args = ['run', ...portArgs, `${projectName}:latest`];
print.boldSection(`Running: docker ${args.join(' ')}`);

const child = spawn('docker', args, { stdio: 'inherit' });
child.on('error', (err) => {
  print.boldError(`Failed to start docker: ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
