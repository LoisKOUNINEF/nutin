#!/usr/bin/env node

import { spawn } from 'child_process';
import { print, runCommand } from '../utils/index.js';

async function startDev() {
  console.clear();
  print.blue('🚀 Starting Dev Environment...\n');

  try {
    await runCommand('npm', ['run', 'build', '--silent']);
  } catch (err) {
    print.boldError(`Dev startup failed: ${err.message}`);
    process.exit(1);
  }

  // detached: true makes each child the leader of its own process group, so its
  // descendants (watcher.js's own `exec('npm run build')` included) can be killed
  // as a group below. Without this, a shutdown that doesn't cleanly propagate
  // SIGINT down the shell layers (backgrounded, launched by a task runner, a
  // closed terminal tab instead of Ctrl-C, ...) leaves them running as orphans —
  // which is exactly how multiple stray watcher.js processes ended up racing each
  // other's builds.
  const serve = spawn(['npm', 'run', 'serve:only', '--silent'].join(' '), { stdio: 'inherit', shell: true, detached: true });
  const watcher = spawn(['node', 'tools/dev/watcher.js', '--silent'].join(' '), { stdio: 'inherit', shell: true, detached: true });

  const children = [serve, watcher];
  let shuttingDown = false;

  function killGroup(child, signal) {
    if (!child.pid) return;
    try {
      process.kill(-child.pid, signal);
    } catch {
      // group already gone
    }
  }

  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    children.forEach((child) => killGroup(child, signal));
    process.exit(0);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  serve.on('error', (err) => {
    print.boldError(`live-server failed to start: ${err.message}`);
    process.exit(1);
  });
  serve.on('close', (code) => {
    if (shuttingDown) return;
    print.error(`live-server exited with code ${code}`);
    shutdown('SIGTERM');
  });
  watcher.on('error', (err) => {
    print.boldError(`watcher failed to start: ${err.message}`);
    process.exit(1);
  });
  watcher.on('close', (code) => {
    if (shuttingDown) return;
    print.error(`watcher exited with code ${code}`);
  });
}

startDev().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  process.exit(1);
});
