#!/usr/bin/env node

import { print, runCommand } from '../utils/index.js';

async function startDev() {
  try {
    console.clear();
    print.boldHead('🚀 Starting Dev Environment...');

    await runCommand('npm', ['run', 'build']);

    const serve = await runCommand('npm', ['run', 'serve:only']);
    const watcher = await runCommand('node', ['tools/dev/watcher.js']);

    print.boldSuccess('\nDev server and watcher running!\n');

    serve.on('close', (code) => {
      print.error(`live-server exited with code ${code}`);
      process.exit(code);
    });
    watcher.on('close', (code) => {
      print.error(`watcher exited with code ${code}`);
    });
  } catch (err) {
    print.boldError(`Dev startup failed: ${err.message}`);
  }
}

startDev().catch((err) => {
  print.boldError(`Unexpected error: ${err.message}`);
  exit(1);
});
