import path from 'path';
import Queue from './queue.js';
import { printStart, printSummary, printResults } from '../index.js';
import { setupJsdom, teardownJsdom } from '../globals/jsdom-setup.js';

const testQueue = new Queue();
let todo = 0;
let passed = 0;
let failed = 0;
let elapsedTime;
let currentTestFile = '';

export function setCurrentTestFile(file) {
  currentTestFile = file ? path.relative(process.cwd(), file) : '';
}

export function addTest(test) {
  testQueue.enqueue({ ...test, file: currentTestFile });
}

export async function runQueuedTests() {
  printStart();
  const startTime = performance.now();
  const testAmount = testQueue.length;
  const results = [];
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
        error: err.stack
      });
    }
  };

  const suiteKey = (t) => `${t.file}::${t.suiteName}`;

  for (let i = 0; i < testAmount; i++) {
    test = testQueue.deque();

    if (suiteKey(test) !== previousSuiteKey) {
      await runAfterAll(previousSuite, previousSuiteAfterAll);
      if (previousSuiteKey !== null) teardownJsdom();

      try {
        setupJsdom();
      } catch (err) {
        failed++;
        results.push({
          suiteName: test.suiteName,
          status: 'failed',
          name: 'setupJsdom',
          error: err.stack
        });
        previousSuiteKey = suiteKey(test);
        previousSuite = test.suiteName;
        previousSuiteAfterAll = null;
        continue;
      }

      previousSuiteKey = suiteKey(test);
      previousSuite = test.suiteName;
      previousSuiteAfterAll = test.afterAll;
      if (test.beforeAll) {
        try {
          await test.beforeAll();
        } catch (err) {
          failed++;
          results.push({
            suiteName: test.suiteName,
            status: 'failed',
            name: 'beforeAll',
            error: err.stack
          });
        }
      }
    }

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

    let testError = null;
    try {
      if (test.beforeEach) await test.beforeEach();
      await test.testFn();
    } catch (err) {
      testError = err;
    }

    let afterEachError = null;
    try {
      if (test.afterEach) await test.afterEach();
    } catch (err) {
      afterEachError = err;
    }

    if (testError) {
      failed++;
      results.push({
        suiteName: test.suiteName,
        status: 'failed',
        name: test.testName,
        error: testError.stack
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
        error: afterEachError.stack
      });
    }
  }

  if (previousSuiteKey !== null) {
    await runAfterAll(previousSuite, previousSuiteAfterAll);
    teardownJsdom();
  }

  const endTime = performance.now();
  elapsedTime = (endTime - startTime);
  printResults(results);
  printSummary(todo, passed, failed, elapsedTime);

  return { todo, passed, failed, elapsedTime };
}
