import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { formatError } from './clean-stack.js';

const runnerDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runnerUrl = (file) => pathToFileURL(path.join(runnerDir, file)).href;
const appFile = pathToFileURL(path.join(runnerDir, '..', '..', 'dist', 'src', 'app', 'foo.test.js')).href;

const withStack = (stack) => {
  const err = new Error('boom');
  err.stack = stack;
  return err;
};

describe('formatError', () => {
  it('drops testin-nutin frames and keeps the code under test', () => {
    const err = withStack([
      'AssertionError: Expected 1 to be strictly equal to 2',
      `    at Object.toBe (${runnerUrl('core/globals/assertion-lib.js')}:14:15)`,
      `    at Object.testFn (${appFile}:5:20)`,
      `    at runQueuedTests (${runnerUrl('core/queue/test-queue.js')}:102:24)`,
      `    at async runTests (${runnerUrl('runner.js')}:98:7)`,
    ].join('\n'));
    expect(formatError(err)).toBe([
      'AssertionError: Expected 1 to be strictly equal to 2',
      `    at Object.testFn (${appFile}:5:20)`,
    ].join('\n'));
  });

  it('drops runner frames given as plain paths', () => {
    const err = withStack([
      'Error: boom',
      `    at ${path.join(runnerDir, 'runner.js')}:98:7`,
      `    at ${appFile}:5:20`,
    ].join('\n'));
    expect(formatError(err)).toBe(`Error: boom\n    at ${appFile}:5:20`);
  });

  it('drops Node internal frames', () => {
    const err = withStack([
      'Error: boom',
      `    at Object.testFn (${appFile}:5:20)`,
      '    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)',
      '    at ModuleJob.run (node:internal/modules/esm/module_job:271:25)',
    ].join('\n'));
    expect(formatError(err)).toBe(`Error: boom\n    at Object.testFn (${appFile}:5:20)`);
  });

  it('keeps the frames of testin-nutin\'s own tests', () => {
    const ownTest = `    at Object.testFn (${runnerUrl('core/real-console.test.js')}:11:7)`;
    const err = withStack([
      'Error: boom',
      ownTest,
      `    at runQueuedTests (${runnerUrl('core/queue/test-queue.js')}:102:24)`,
    ].join('\n'));
    expect(formatError(err)).toBe(`Error: boom\n${ownTest}`);
  });

  it('keeps only the message when every frame is the runner\'s', () => {
    const err = withStack([
      'Error: first line',
      'second line',
      `    at runQueuedTests (${runnerUrl('core/queue/test-queue.js')}:102:24)`,
    ].join('\n'));
    expect(formatError(err)).toBe('Error: first line\nsecond line');
  });

  it('returns a stack without frames as is', () => {
    expect(formatError(withStack('Error: boom'))).toBe('Error: boom');
  });

  it('turns a thrown non-Error into a string', () => {
    expect(formatError('nope')).toBe('nope');
    expect(formatError(undefined)).toBe('undefined');
    expect(formatError({ stack: 42 })).toBe('[object Object]');
  });
});
