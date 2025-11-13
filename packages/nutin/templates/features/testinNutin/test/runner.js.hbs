import { setupJsdomEnvironment, registerTestGlobals, getTestFiles, runQueuedTests, print } from './core/index.js';
import config from '#root/test.config.js';

setupJsdomEnvironment();
registerTestGlobals();

let testFiles = config.origins.flatMap(
  origin => getTestFiles(`../${origin}`)
);

const args = process.argv.slice(2);
if (args.length) {
  testFiles = testFiles.filter(file => args.some(f => file.includes(f)));
}

async function runTests() {
  if (config.verbose) print.head('Test suites :');
  for (const file of testFiles) {
    try {
      await import(file);
    } catch (error) {
      print.boldError(`✗ ${file} failed to load:`);
      print.grayError(error.stack);
    }
  }

  await runQueuedTests();
}

runTests();
