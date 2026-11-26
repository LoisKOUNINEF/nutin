// Runs one test file of testinNutin.isolate in its own worker (started by run-isolated.js):
// its own module graph, and one jsdom window for its import and all its suites.
// A custom element package defined while it runs is then defined in the window its tests use.
import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'url';
import {
  registerTestGlobals, setCurrentTestFile, setupJsdom, teardownJsdom, executeQueue,
  hasOnlyTests, startCoverage, stopCoverage, formatError,
} from '../index.js';

const { file, coverageDirs } = workerData;

if (coverageDirs) await startCoverage();

registerTestGlobals();
setupJsdom();
setCurrentTestFile(file);

let loadError = null;
try {
  await import(pathToFileURL(file).href);
} catch (err) {
  loadError = formatError(err);
}

// Whether a .only applies is known once every file of the run is imported.
parentPort.postMessage({ type: 'loaded', hasOnly: hasOnlyTests(), loadError });
const { onlyActive } = await new Promise((resolve) => parentPort.once('message', resolve));

const run = await executeQueue({ onlyActive, windowPerSuite: false });
teardownJsdom();
const coverage = coverageDirs ? await stopCoverage(coverageDirs) : [];

parentPort.postMessage({ type: 'done', ...run, coverage });
// Ends the worker even with timers its tests left running (which would fire once jsdom is
// gone). Unlike terminate(), what the tests printed is flushed first.
process.exit(0);
