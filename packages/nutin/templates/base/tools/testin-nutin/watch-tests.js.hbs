import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from './core/index.js'

const watcher = chokidar.watch(['src', 'test', 'unit', 'e2e'], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

print.boldHead('Watching for test changes...')

watcher.on('error', (err) => {
  print.boldError(`\nWatcher error: ${err.message}`);
});

let isRunning = false;
let runTimeout = null;

watcher.on('change', (filePath) => {
  if (runTimeout) clearTimeout(runTimeout);

  runTimeout = setTimeout(() => {
    if (isRunning) return;
    isRunning = true;

    console.clear();
    print.boldInfo(`\n🔄 File changed: ${path.relative(process.cwd(), filePath)}\n`);

    exec('node --experimental-modules testin-nutin/runner.js', { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) print.boldError(`\nTest run failed: ${err.message}`);
      isRunning = false;
    });
  }, 100);
});
