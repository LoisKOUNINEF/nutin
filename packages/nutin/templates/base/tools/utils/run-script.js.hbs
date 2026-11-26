import { resolve, relative } from 'path';
import { spawnSync } from 'child_process';
import process from 'process';
import { print } from './print.js';

export function runScript(path, message) {
  if (!message) print.boldSection(`Running ${path}...`);
  else print.boldSection(`${message}`);

  const args = [resolve(path), '--silent'];

  const result = spawnSync(process.execPath, args,
    { 
      stdio: 'inherit',
      env: { ...process.env }, 
    }
  );

  if (result.error) {
    print.boldError(`\n"${relative(process.cwd(), resolve(path))}" could not be started: ${result.error.message}.`);
    process.exit(1);
  }

  if (result.signal) {
    print.boldError(`\n"${relative(process.cwd(), resolve(path))}" was stopped by ${result.signal}.`);
    process.exit(1);
  }

  // The script has already printed why (errorExit): only say which one stopped the build.
  if (result.status !== 0) {
    print.gray(`"${relative(process.cwd(), resolve(path))}" failed.`);
    process.exit(result.status ?? 1);
  }
}
