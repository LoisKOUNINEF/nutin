import { resolve } from 'path';
import { spawnSync } from 'child_process';
import process from 'process';
import { print } from './index.js';

export function runScript(path, message) {
  print.boldSection(message);

  const args = [resolve(path)];

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
