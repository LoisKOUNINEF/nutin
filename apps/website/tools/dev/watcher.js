import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from '../utils/index.js'

// Absolute paths — a relative '../../resources' starts with '..', which the
// dotfile-skipping `ignored` regex below also matches at the start of the
// string, silently dropping the whole watch root.
const watcher = chokidar.watch([path.resolve('src'), path.resolve('../../resources')], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

let isBuilding = false;
let pendingRebuild = false;
let buildTimeout = null;
let lastChangedPath = null;

function runBuild() {
  isBuilding = true;
  pendingRebuild = false;

  console.clear();
  print.boldInfo(`\n🔄 File changed: ${path.relative(process.cwd(), lastChangedPath)}\n`);
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

    // A change arrived while this build was running — it was never picked up by
    // any debounce timer (isBuilding used to make those just silently return,
    // dropping the change for good), so build again now instead of missing it.
    if (pendingRebuild) runBuild();
  });
}

watcher.on('error', (err) => {
  print.boldError(`\nWatcher error: ${err.message}`);
});

watcher.on('change', (filePath) => {
  lastChangedPath = filePath;

  if (isBuilding) {
    pendingRebuild = true;
    return;
  }

  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }

  buildTimeout = setTimeout(runBuild, 100);
});

watcher.on('ready', () => {
  print.boldBlue('Watching for changes...');
});
