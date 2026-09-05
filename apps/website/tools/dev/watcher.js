import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from '../utils/index.js'

const watcher = chokidar.watch(['src', '../../docs'], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

let isBuilding = false;
let buildTimeout = null;

watcher.on('error', (err) => {
  print.boldError(`\nWatcher error: ${err.message}`);
});

watcher.on('change', (filePath) => {
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  
  buildTimeout = setTimeout(() => {
    if (isBuilding) return;
    isBuilding = true;

    console.clear();
    print.boldInfo(`\n🔄 File changed: ${path.relative(process.cwd(), filePath)}\n`);
    print.info('\nRebuilding...');

    const command = 'npm run build --silent';

    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) {
        if (err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
          print.boldError(`\nBuild output exceeded the buffer size — raise maxBuffer in tools/dev/watcher.js.`);
        } else {
          print.boldError(`\nBuild failed: ${err.message}`);
        }
      } else {
        print.boldBlue('Watching for changes...');
      }
      isBuilding = false;
    });
  }, 100);
});

watcher.on('ready', () => {
  print.boldBlue('Watching for changes...');
});
