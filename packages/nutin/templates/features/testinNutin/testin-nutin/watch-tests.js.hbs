import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from './core/index.js'

const watcher = chokidar.watch(['src', 'test', 'unit', 'e2e'], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

print.boldHead('Watching for test changes...')

watcher.on('change', (filePath) => {
  console.clear();
  print.boldInfo(`\n🔄 File changed: ${path.relative(process.cwd(), filePath)}\n`);

  exec('node --experimental-modules testin-nutin/runner.js', (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
});
