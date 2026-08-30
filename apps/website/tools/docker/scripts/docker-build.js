#!/usr/bin/env node

import path from 'path';
import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { print, runScript } from '../../utils/index.js';

const { name: projectName } = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

runScript(path.join(process.cwd(), 'tools', 'docker', 'scripts', 'validate-docker.js'), 'Validating Docker configuration...');

const repoRoot = path.resolve(process.cwd(), '..', '..');
const args = ['build', '-t', projectName, '-f', 'tools/docker/Dockerfile', repoRoot];
print.boldSection(`Running: docker ${args.join(' ')}`);

const child = spawn('docker', args, { stdio: 'inherit' });
child.on('error', (err) => {
  print.boldError(`Failed to start docker: ${err.message}`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
