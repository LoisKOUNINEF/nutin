import Queue from './queue.js';
import { executeQueue } from './test-queue.js';

// Fake tests run through their own queue, not the run's: the shared window is kept
// (windowPerSuite: false), so this suite's own jsdom stays in place.
function queueOf(tests) {
  const queue = new Queue();
  tests.forEach((test) => queue.enqueue({ file: 'fake.test.js', hooks: {}, ...test }));
  return queue;
}

const run = (tests, onlyActive = false) => executeQueue({ queue: queueOf(tests), onlyActive, windowPerSuite: false });
const statuses = ({ results }) => results.map(({ name, status }) => `${name}:${status}`);

describe('executeQueue', () => {
  it('skips an isSkipped test without running it', async () => {
    const calls = [];
    const outcome = await run([
      { suiteName: 'S', testName: 'a', testFn: () => calls.push('a') },
      { suiteName: 'S', testName: 'b', isSkipped: true },
    ]);
    expect(calls).toEqual(['a']);
    expect(statuses(outcome)).toEqual(['a:passed', 'b:skipped']);
    expect(outcome.results[1].explicit).toBe(true);
    expect([outcome.passed, outcome.skipped, outcome.failed]).toEqual([1, 1, 0]);
  });

  it('runs no hooks for a suite whose tests are all skipped or todo', async () => {
    const calls = [];
    const hooks = {
      beforeAll: () => calls.push('beforeAll'),
      beforeEach: () => calls.push('beforeEach'),
      afterEach: () => calls.push('afterEach'),
      afterAll: () => calls.push('afterAll'),
    };
    const outcome = await run([
      { suiteName: 'S', testName: 'a', isSkipped: true, hooks },
      { suiteName: 'S', testName: 'b', isTodo: true, hooks },
    ]);
    expect(calls).toEqual([]);
    expect([outcome.skipped, outcome.todo]).toEqual([1, 1]);
  });

  it('still runs a suite\'s hooks for its tests after a skipped first one', async () => {
    const calls = [];
    const hooks = {
      beforeAll: () => calls.push('beforeAll'),
      afterAll: () => calls.push('afterAll'),
    };
    await run([
      { suiteName: 'S', testName: 'a', isSkipped: true, hooks },
      { suiteName: 'S', testName: 'b', testFn: () => calls.push('b'), hooks },
    ]);
    expect(calls).toEqual(['beforeAll', 'b', 'afterAll']);
  });

  it('closes the previous suite before the next one when skipped tests sit between them', async () => {
    const calls = [];
    await run([
      { suiteName: 'A', testName: 'a', testFn: () => calls.push('a'), hooks: { afterAll: () => calls.push('A afterAll') } },
      { suiteName: 'B', testName: 'b1', isSkipped: true },
      { suiteName: 'B', testName: 'b2', testFn: () => calls.push('b2'), hooks: { beforeAll: () => calls.push('B beforeAll') } },
    ]);
    expect(calls).toEqual(['a', 'A afterAll', 'B beforeAll', 'b2']);
  });

  it('with onlyActive, runs only the tests marked isOnly and counts the rest as skipped', async () => {
    const calls = [];
    const outcome = await run([
      { suiteName: 'S', testName: 'a', testFn: () => calls.push('a') },
      { suiteName: 'S', testName: 'b', testFn: () => calls.push('b'), isOnly: true },
      { suiteName: 'T', testName: 'c', testFn: () => calls.push('c') },
    ], true);
    expect(calls).toEqual(['b']);
    expect(statuses(outcome)).toEqual(['a:skipped', 'b:passed', 'c:skipped']);
    expect(outcome.results[0].explicit).toBe(false);
    expect([outcome.passed, outcome.skipped]).toEqual([1, 2]);
  });

  it('ignores isOnly when onlyActive is off', async () => {
    const outcome = await run([
      { suiteName: 'S', testName: 'a', testFn: () => {} },
      { suiteName: 'S', testName: 'b', testFn: () => {}, isOnly: true },
    ]);
    expect(outcome.passed).toBe(2);
  });

  it('gives the next suite the loaded document back when windowPerSuite is off', async () => {
    const window = global.window;
    let loadedBody;
    let bodyInSecondSuite;
    await run([
      { suiteName: 'A', testName: 'a', testFn: () => { loadedBody = document.body.innerHTML; document.body.innerHTML = '<p>left over</p>'; } },
      { suiteName: 'B', testName: 'b', testFn: () => { bodyInSecondSuite = document.body.innerHTML; } },
    ]);
    expect(global.window).toBe(window);
    expect(bodyInSecondSuite).toBe(loadedBody);
    expect(bodyInSecondSuite).not.toContain('left over');
  });
});

describe('test globals', () => {
  it('test is it, with its skip, only and todo', () => {
    expect(test).toBe(it);
    expect(typeof test.skip).toBe('function');
    expect(typeof test.only).toBe('function');
    expect(typeof test.todo).toBe('function');
    expect(typeof describe.skip).toBe('function');
    expect(typeof describe.only).toBe('function');
  });
});
