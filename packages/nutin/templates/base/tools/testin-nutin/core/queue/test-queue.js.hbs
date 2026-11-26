import path from 'path';
import Queue from './queue.js';
import { printStart, printSummary, printResults, restoreRealConsole, formatError } from '../index.js';
import { setupJsdom, teardownJsdom, restoreDocument } from '../globals/jsdom-setup.js';

const testQueue = new Queue();
let onlyQueued = false;
let currentTestFile = '';

export function setCurrentTestFile(file) {
  currentTestFile = file ? path.relative(process.cwd(), file) : '';
}

export function addTest(test) {
  if (test.isOnly) onlyQueued = true;
  testQueue.enqueue({ ...test, file: currentTestFile });
}

// Whether a queued test is marked it.only / test.only, or is in a describe.only.
export function hasOnlyTests() {
  return onlyQueued;
}

/**
 * Runs every queued test and returns the results, without printing them.
 * - onlyActive: some test of the run is marked .only, so the others are skipped.
 * - windowPerSuite: each suite gets a fresh jsdom window.
 *   When false, the suites sharethe window already set up (an isolated file's):
 *   each one after the first gets the document back as it was loaded (restoreDocument()).
 */
export async function executeQueue({ queue = testQueue, onlyActive = false, windowPerSuite = true } = {}) {
  const testAmount = queue.length;
  const results = [];
  let todo = 0;
  let skipped = 0;
  let passed = 0;
  let failed = 0;
  let previousSuiteKey = null;
  let previousSuite = null;
  let previousSuiteAfterAll = null;
  let test;

  const runAfterAll = async (suiteName, afterAllFn) => {
    if (!afterAllFn) return;
    try {
      await afterAllFn();
    } catch (err) {
      failed++;
      results.push({
        suiteName,
        status: 'failed',
        name: 'afterAll',
        error: formatError(err)
      });
    }
  };

  const suiteKey = (t) => `${t.file}::${t.suiteName}`;

  for (let i = 0; i < testAmount; i++) {
    test = queue.deque();

    // Before the suite change below:
    // a suite with only todo or skipped tests gets no window and runs no hooks.
    if (test.isTodo) {
      todo++;
      results.push({
        suiteName: test.suiteName,
        status: 'todo',
        name: test.testName,
        file: test.file
      });
      continue;
    }

    if (test.isSkipped || (onlyActive && !test.isOnly)) {
      skipped++;
      results.push({
        suiteName: test.suiteName,
        status: 'skipped',
        name: test.testName,
        file: test.file,
        // false: left out by another test's .only, not skipped by its own code.
        explicit: Boolean(test.isSkipped),
      });
      continue;
    }

    if (suiteKey(test) !== previousSuiteKey) {
      await runAfterAll(previousSuite, previousSuiteAfterAll);
      if (windowPerSuite && previousSuiteKey !== null) teardownJsdom();

      try {
        if (windowPerSuite) setupJsdom();
        else if (previousSuiteKey !== null) restoreDocument();
      } catch (err) {
        failed++;
        results.push({
          suiteName: test.suiteName,
          status: 'failed',
          name: 'setupJsdom',
          error: formatError(err)
        });
        previousSuiteKey = suiteKey(test);
        previousSuite = test.suiteName;
        previousSuiteAfterAll = null;
        continue;
      }

      previousSuiteKey = suiteKey(test);
      previousSuite = test.suiteName;
      previousSuiteAfterAll = test.hooks?.afterAll;
      if (test.hooks?.beforeAll) {
        try {
          await test.hooks.beforeAll();
        } catch (err) {
          failed++;
          results.push({
            suiteName: test.suiteName,
            status: 'failed',
            name: 'beforeAll',
            error: formatError(err)
          });
        }
      }
    }

    let testError = null;
    try {
      if (test.hooks?.beforeEach) await test.hooks.beforeEach();
      await test.testFn();
    } catch (err) {
      testError = err;
    }

    let afterEachError = null;
    try {
      if (test.hooks?.afterEach) await test.hooks.afterEach();
    } catch (err) {
      afterEachError = err;
    }

    if (testError) {
      failed++;
      results.push({
        suiteName: test.suiteName,
        status: 'failed',
        name: test.testName,
        error: formatError(testError)
      });
    } else {
      passed++;
      results.push({
        suiteName: test.suiteName,
        status: 'passed',
        name: test.testName
      });
    }

    if (afterEachError) {
      failed++;
      results.push({
        suiteName: test.suiteName,
        status: 'failed',
        name: `${test.testName} (afterEach)`,
        error: formatError(afterEachError)
      });
    }
  }

  if (previousSuiteKey !== null) {
    await runAfterAll(previousSuite, previousSuiteAfterAll);
    if (windowPerSuite) teardownJsdom();
  }

  return { results, todo, skipped, passed, failed };
}

/**
 * Runs the queued tests, adds the runs done elsewhere, then prints the report.
 */
export async function runQueuedTests({ onlyActive = false, extraRuns = [] } = {}) {
  printStart();
  const runs = [await executeQueue({ onlyActive }), ...(await extraRuns)];
  const total = (key) => runs.reduce((sum, run) => sum + run[key], 0);
  const results = runs.flatMap((run) => run.results);
  const todo = total('todo');
  const skipped = total('skipped');
  const passed = total('passed');
  const failed = total('failed');

  // Since the process started (performance's time origin):
  // Node startup, discovery and the test files' imports count too, not only running the queued tests.
  const elapsedTime = performance.now();
  // A console method a test left stubbed would silence the report (see real-console.js).
  restoreRealConsole();
  printResults(results);
  printSummary({ todo, skipped, passed, failed, time: elapsedTime, onlyActive });

  return { todo, skipped, passed, failed, elapsedTime };
}
