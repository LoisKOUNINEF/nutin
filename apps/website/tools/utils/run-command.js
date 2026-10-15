import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';

// Windows needs a shell to launch .cmd shims (npm, tsc, ...); a single pre-quoted command
// string avoids Node's deprecated args-array-with-shell form. Elsewhere no shell is
// involved, so arguments containing spaces or shell characters are passed through as-is.
function quoteForCmd(arg) {
  return /[\s"&|<>^]/.test(arg) ? `"${arg.replace(/"/g, '""')}"` : arg;
}

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = isWindows
      ? spawn([command, ...args].map(quoteForCmd).join(' '), { stdio: 'inherit', shell: true, ...options })
      : spawn(command, args, { stdio: 'inherit', ...options });

    child.on('error', (err) => reject(err));

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

// Like runCommand(), but collects the child's stdout and stderr (interleaved, in arrival order)
// instead of printing them, and resolves with its exit code rather than rejecting: for a caller
// that rewrites the output, e.g. compile-ts mapping tsc errors back to source files.
export function captureCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const stdio = ['inherit', 'pipe', 'pipe'];
    const child = isWindows
      ? spawn([command, ...args].map(quoteForCmd).join(' '), { stdio, shell: true, ...options })
      : spawn(command, args, { stdio, ...options });

    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => resolve({ code, output }));
  });
}
