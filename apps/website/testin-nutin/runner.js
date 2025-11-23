import { registerTestGlobals, getTestFiles, runQueuedTests, print } from './core/index.js';
import path from 'path';
import config from '#root/testin-nutin.config.js';

registerTestGlobals();

let testFiles = config.origins.flatMap(
  origin => getTestFiles(path.join('../', origin))
);

const args = process.argv.slice(2);
if (args.length) {
  testFiles = testFiles.filter(file => args.some(f => file.includes(f)));
}

async function loadTestFile(file) {
  setupJsdom();
  await import(file);
  teardownJsdom();
}

async function runTests() {
  if (config.verbose) print.head('Test suites :');
  for (const file of testFiles) {
    try {
      await loadTestFile(file);
    } catch (error) {
      print.boldError(`✗ ${file} failed to load:`);
      print.grayError(error.stack);
    }
  }

  await runQueuedTests();
}

runTests();
