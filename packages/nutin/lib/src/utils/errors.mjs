import { print } from './print.mjs';

// An expected failure (bad input, a project in the wrong state, a command that failed):
// shown as its message and an optional hint, without a stack.
// Any other error is a bug, and keeps its stack.
export class UserError extends Error {
  constructor(message, { hint, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'UserError';
    this.hint = hint;
  }
}

// --debug (or NUTIN_DEBUG=1, which it sets): stacks for every error, and the CLI's detail lines.
export function isDebug(env = process.env) {
  return env.NUTIN_DEBUG === '1';
}

// The stack without its first line, which repeats the message.
function stackFrames(error) {
  return (error.stack ?? '').split('\n').slice(1).join('\n');
}

/**
 * Prints a failed command's error and returns the exit code to use: 130 for a prompt closed with
 * Ctrl+C (inquirer's ExitPromptError), 1 otherwise.
 */
export function reportError(context, error) {
  if (error?.name === 'ExitPromptError') {
    print.gray('\nCancelled.');
    return 130;
  }

  const message = error instanceof Error ? error.message : String(error);
  print.boldError(`\n❌ ${context}: ${message}`);
  if (error?.hint) print.gray(error.hint);

  const expected = error instanceof UserError;
  if (error instanceof Error && (!expected || isDebug())) {
    const frames = stackFrames(error);
    if (frames) print.grayError(frames);
  }
  return 1;
}
