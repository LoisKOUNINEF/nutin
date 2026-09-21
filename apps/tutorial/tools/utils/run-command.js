import { spawn } from 'child_process';

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn([command, ...args].join(' '), { stdio: 'inherit', shell: true, ...options });

    child.on('error', (err) => reject(err));

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
