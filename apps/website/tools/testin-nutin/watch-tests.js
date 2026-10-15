import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from './core/index.js';
import config from '#root/nutin.config.js';

// Tests import the build output (dist/), so every run rebuilds first.
const COMMAND = 'npm run testin-nutin';

const watched = ['src'];
if (config.testinNutin.includeTools) watched.push('tools');

const watcher = chokidar.watch(watched, {
  ignored: /(^|[/\\])\../,
  persistent: true,
  ignoreInitial: true,
});

let isRunning = false;
let pendingRun = false;
let runTimeout = null;
let lastChangedPath = null;

function runTests() {
  isRunning = true;
  pendingRun = false;

  console.clear();
  print.boldInfo(`\n🔄 File changed: ${path.relative(process.cwd(), lastChangedPath)}\n`);

  exec(COMMAND, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    if (err) print.boldError(`\nTest run failed: ${err.message}`);
    print.boldHead('Watching for test changes...');
    isRunning = false;

    // A change arrived mid-run — run again instead of dropping it.
    if (pendingRun) runTests();
  });
}

watcher.on('error', (err) => {
  print.boldError(`\nWatcher error: ${err.message}`);
});

watcher.on('all', (event, filePath) => {
  if (!['add', 'change', 'unlink'].includes(event)) return;
  lastChangedPath = filePath;

  if (isRunning) {
    pendingRun = true;
    return;
  }

  if (runTimeout) clearTimeout(runTimeout);
  runTimeout = setTimeout(runTests, 100);
});

watcher.on('ready', () => {
  print.boldHead('Watching for test changes...');
});
