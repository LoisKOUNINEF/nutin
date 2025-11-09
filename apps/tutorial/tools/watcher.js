import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import { print } from './utils/index.js'

const watcher = chokidar.watch(['src'], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

let isBuilding = false;

let buildTimeout = null;

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

    const command = filePath.includes('.scss') ? 'npm run build-static' : 'npm run build';
    
    exec(command, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      
      print.boldSuccess('\n✅ Build completed!');
      print.boldHead('\nWaiting for changes...\n');
      
      isBuilding = false;
    });
  }, 100);
});

watcher.on('ready', () => {
  print.boldHead('\n👀 Watching for changes...\n');
});
