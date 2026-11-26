import { exit } from 'process';
import { print } from './print.js';

// An expected failure (a config mistake, a missing file, a tool that already printed its report):
// errorExit() shows its message only. Any other Error is a bug, and keeps its stack.
export class UserError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'UserError';
  }
}

// "--debug" on the build: every error's stack.
// argv is read too: a check that runs while builder.js's imports load comes before builder.js sets it.
export function isDebug(env = process.env, argv = process.argv) {
  return env.NUTIN_DEBUG === '1' || argv.includes('--debug');
}

// A string or a UserError: the message only.
// Another Error: also its stack, without the first line, which repeats the message.
export function errorExit(err, origin = '') {
  const message = err?.message || String(err);
  print.boldError(`\n${origin ? `${origin} - ` : ''}Error: ${message}`);
  if (err instanceof Error && (!(err instanceof UserError) || isDebug())) {
    const frames = (err.stack ?? '').split('\n').slice(1).join('\n');
    if (frames) print.grayError(frames);
  }
  exit(1);
}
