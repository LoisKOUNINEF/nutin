import path from 'path';
import { Worker } from 'node:worker_threads';
import { formatError } from '../clean-stack.js';

const WORKER_ENTRY = new URL('./isolated-file.js', import.meta.url);

// How long a worker may take to import its file, in ms (testinNutin.isolate.loadTimeout, in seconds).
// One that never finishes (a top-level await still pending, on a request or a timer that keeps the worker alive)
// would hold every other file's run, which waits for them all to load.
export const LOAD_TIMEOUT = 30_000;

const emptyRun = () => ({ results: [], todo: 0, skipped: 0, passed: 0, failed: 0, coverage: [] });

/**
 * Starts one worker per test file of testinNutin.isolate (see isolated-file.js):
 * each imports its file, then waits for run(). Every worker starts at once, since each one
 * must have imported its file before the run knows whether a .only applies.
 * - loaded: resolves to [{ file, hasOnly, loadError }], loadError being null or a trace.
 * - run(onlyActive): runs their tests, and resolves to their results.
 * coverageDirs: the dirs whose coverage the workers collect, or null for none.
 * loadTimeout: ms a worker may take to import its file; past it, it's stopped and its file
 * reported as one that failed to load.
 */
export function startIsolatedFiles(files, { coverageDirs = null, loadTimeout = LOAD_TIMEOUT } = {}) {
  const workers = files.map((file) => startWorker(file, coverageDirs, loadTimeout));

  return {
    loaded: Promise.all(workers.map((worker) => worker.loaded)),
    run: (onlyActive) => Promise.all(workers.map((worker) => worker.run(onlyActive))),
  };
}

function startWorker(file, coverageDirs, loadTimeout) {
  const displayFile = path.relative(process.cwd(), file);
  // Forwarded so that --verbose applies in the worker too.
  const worker = new Worker(WORKER_ENTRY, {
    workerData: { file, coverageDirs },
    argv: process.argv.slice(2),
  });

  let state = 'loading';
  let finished = null;
  let resolveLoaded;
  let resolveDone;
  const loaded = new Promise((resolve) => { resolveLoaded = resolve; });
  const done = new Promise((resolve) => { resolveDone = resolve; });

  const fail = (error) => {
    if (state === 'loading') {
      // Reported as a file that failed to load, like an in-process one.
      resolveLoaded({ file, hasOnly: false, loadError: error });
      resolveDone(emptyRun());
    } else if (state !== 'done') {
      resolveDone({
        ...emptyRun(),
        failed: 1,
        results: [{ suiteName: displayFile, status: 'failed', name: 'worker', error }],
      });
    }
    state = 'done';
  };

  const loadTimer = setTimeout(() => {
    if (state !== 'loading') return;
    fail(`It didn't finish loading within ${loadTimeout / 1000} s (a top-level await still pending?), so its worker was stopped. To give it longer, raise testinNutin.isolate.loadTimeout in nutin.config.js.`);
    worker.terminate();
  }, loadTimeout);
  // Never what keeps the runner alive.
  loadTimer.unref();

  worker.on('message', (message) => {
    if (message.type === 'loaded') {
      // Too late: the load timeout already reported it.
      if (state !== 'loading') return;
      clearTimeout(loadTimer);
      state = 'loaded';
      resolveLoaded({ file, hasOnly: message.hasOnly, loadError: message.loadError });
    } else if (message.type === 'done') {
      // Kept until the worker exits: what its tests printed is relayed until then,
      // and belongs before the report.
      const { type, ...run } = message;
      finished = run;
    }
  });
  worker.on('error', (err) => fail(formatError(err)));
  worker.on('exit', (code) => {
    clearTimeout(loadTimer);
    if (finished) {
      state = 'done';
      resolveDone(finished);
    } else {
      fail(`The worker stopped (exit code ${code}) before its tests finished.`);
    }
  });

  return {
    loaded,
    run: (onlyActive) => {
      if (state === 'loaded') {
        state = 'running';
        worker.postMessage({ type: 'run', onlyActive });
      }
      return done;
    },
  };
}
