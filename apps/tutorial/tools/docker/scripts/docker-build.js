#!/usr/bin/env node

import path from 'path';
import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { print, runScript, errorExit } from '../../utils/index.js';
import { BUILD_FLAGS, parseDockerFlags, buildCommand, imageName, helpText } from './docker-args.js';

const USAGE = 'npm run docker:build -- [flags]';

let flags;
try {
  flags = parseDockerFlags(process.argv.slice(2), BUILD_FLAGS);
} catch (err) {
  errorExit(err.message, 'docker:build');
}

if (flags.help) {
  console.info(helpText(BUILD_FLAGS, USAGE));
  process.exit(0);
}

const { name: projectName } = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

runScript(path.join(process.cwd(), 'tools', 'docker', 'scripts', 'validate-docker.js'), 'Validating Docker configuration...');

const args = buildCommand(flags, { image: imageName(projectName), context: '.' });
print.boldSection(`Running: docker ${args.join(' ')}`);

const child = spawn('docker', args, { stdio: 'inherit' });
child.on('error', (err) => {
  print.boldError(`Failed to start docker: ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
