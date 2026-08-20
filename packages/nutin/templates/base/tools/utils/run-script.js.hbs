import { resolve } from 'path';
import { spawnSync } from 'child_process';
import process from 'process';
import { print } from './index.js';

export function runScript(path, message) {
  if (!message) print.boldSection(`Running ${path}...`);
  else print.boldSection(`${message}`);

  const args = [resolve(path), '--silent'];

  const result = spawnSync('node', args,
    { 
      stdio: 'inherit',
      env: { ...process.env }, 
    }
  );

  if (result.error) {
    print.boldError(`\nScript ${path} could not be started: ${result.error.message}`);
    process.exit(1);
  }

  if (result.signal) {
    print.boldError(`\nScript ${path} was terminated by signal ${result.signal}.`);
    process.exit(1);
  }

  if (result.status !== 0) {
    print.boldError(`\nScript ${path} failed.`);
    process.exit(result.status ?? 1);
  }
}
