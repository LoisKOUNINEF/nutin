import Queue from './queue.js';
import { printStart, printSummary, printResults } from './print.js';

const testQueue = new Queue();
let passed = 0;
let failed = 0;
let elapsedTime;

export function addTest(test) {
  testQueue.enqueue(test);
}

export async function runQueuedTests() {
  printStart();
  const startTime = performance.now();
  const testAmount = testQueue.length;
  const results = [];
  let previousSuite = null;
  let previousSuiteAfterAll = null;
  let test;
  
  for (let i = 0; i < testAmount; i++) {
    try {
      test = testQueue.deque();

      if (test.suiteName !== previousSuite) {
        teardownJsdom();
        if (previousSuiteAfterAll) {
          await previousSuiteAfterAll();
        }
        setupJsdom();
        if (test.beforeAll) {
          await test.beforeAll();
        }
        previousSuite = test.suiteName;
        previousSuiteAfterAll = test.afterAll;
      }

      if (test.beforeEach) await test.beforeEach();
      await test.testFn();
      if (test.afterEach) await test.afterEach();

      passed++;
      results.push({ 
        suiteName: test.suiteName, 
        status: 'passed', 
        name: test.testName 
      });
    } catch (err) {
      failed++;
      results.push({ 
        suiteName: test.suiteName, 
        status: 'failed', 
        name: test.testName, 
        error: err.stack
      });
    }
  }
  
  const endTime = performance.now();
  elapsedTime = (endTime - startTime);
  printResults(results);
  printSummary(passed, failed, elapsedTime);
}
