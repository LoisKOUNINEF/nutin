import { resolve } from 'path';
import { spawnSync } from 'child_process';
import process from 'process';
import { print, isVerbose } from './index.js';

export function runScript(path, message) {
  const hasNewline = isVerbose ? '\n' : '';
  if (!message) print.boldSection(`${hasNewline}Running ${path}...`);
  else print.boldSection(`${hasNewline}${message}`);

  const args = [resolve(path), '--silent'];

  const result = spawnSync('node', args,
    { 
      stdio: 'inherit',
      env: { ...process.env }, 
    }
  );

  if (result.status !== 0) {
    print.boldError(`\nScript ${path} failed.`);
    process.exit(result.status ?? 1);
  }
}
