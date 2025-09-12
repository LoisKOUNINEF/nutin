import { setupJsdomEnvironment, registerTestGlobals, getTestFiles, runQueuedTests, print } from './core/index.js';

setupJsdomEnvironment();
registerTestGlobals();

let testFiles = [
  // Uncomment to test toolkit core logic
  // ...getTestFiles('../src/core'),

  // Uncomment to test built-in libs
  // ...getTestFiles('../src/libs'),

  // Uncomment to test globals (describe, it) & assertions (expect)
  // ...getTestFiles('core/tests'),

  // actual application code
  ...getTestFiles('../src/app')
];

const args = process.argv.slice(2);
if (args.length) {
  testFiles = testFiles.filter(file => args.some(f => file.includes(f)));
}

async function runTests() {
  print.head('Test suites :');
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
