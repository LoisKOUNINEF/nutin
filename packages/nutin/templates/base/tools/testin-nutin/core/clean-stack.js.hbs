import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// tools/testin-nutin/: its frames are the runner's, not the code under test.
const runnerDir = path.dirname(path.dirname(fileURLToPath(import.meta.url))) + path.sep;
const runnerDirUrl = pathToFileURL(runnerDir).href;

const isFrame = (line) => /^\s+at /.test(line);

function isRunnerFrame(line) {
  if (/\bnode:/.test(line)) return true;
  if (!line.includes(runnerDir) && !line.includes(runnerDirUrl)) return false;
  // testin-nutin's own tests are code under test too.
  return !/\.test\.js:\d+:\d+\)?$/.test(line);
}

/**
 * The stack of an error thrown by a test, hook or test file:
 * the message, then the trace through the test and the code it called.
 */
export function formatError(err) {
  if (!(err instanceof Error) || typeof err.stack !== 'string') return String(err);
  const lines = err.stack.split('\n');
  const firstFrame = lines.findIndex(isFrame);
  if (firstFrame === -1) return err.stack;
  const header = lines.slice(0, firstFrame);
  const frames = lines.slice(firstFrame).filter(line => !isRunnerFrame(line));
  return [...header, ...frames].join('\n');
}
