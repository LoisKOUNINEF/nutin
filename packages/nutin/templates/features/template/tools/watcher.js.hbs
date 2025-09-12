import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from './utils/index.js'

const watcher = chokidar.watch(['src'], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

let isBuilding = false;

watcher.on('change', (filePath) => {
  if (isBuilding) return;
  isBuilding = true;

  console.clear();
  print.boldInfo(`\n🔄 File changed: ${path.relative(process.cwd(), filePath)}\n`);
  print.info('\nRebuilding...')

  exec('npm run build', (err, stdout, stderr) => {
    if (stderr) process.stderr.write(stderr);
    print.boldHead('\nWaiting for changes...');
  });

  isBuilding = false;
});
