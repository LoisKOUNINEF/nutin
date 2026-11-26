// ANSI styles, only when the stream is a terminal: piped output and CI logs get plain text.
// NO_COLOR (https://no-color.org) turns them off; FORCE_COLOR wins over both: "0" off, any other value on.
// The dev watcher and the test watcher set FORCE_COLOR for the builds they run.
const STYLES = {
  green: '32',
  red: '31',
  blue: '34',
  yellow: '33',
  cyan: '36',
  purple: '35',
  gray: '90',
  boldGreen: '1;32',
  boldRed: '1;31',
  boldBlue: '1;34',
  boldYellow: '1;33',
  boldCyan: '1;36',
  boldPurple: '1;35',
  boldGray: '1;90',
};

export function useColor(stream, env = process.env) {
  // FORCE_COLOR=0 (or false) turns them off, as in Node and supports-color; any other value on.
  if (env.FORCE_COLOR !== undefined) return env.FORCE_COLOR !== '0' && env.FORCE_COLOR !== 'false';
  if (env.NO_COLOR !== undefined && env.NO_COLOR !== '') return false;
  return Boolean(stream?.isTTY);
}

function paint(style, s, stream) {
  return useColor(stream) ? `\x1b[${STYLES[style]}m${s}\x1b[0m` : String(s);
}

// For text built inline; styled for stdout.
export const chalk = Object.fromEntries(Object.keys(STYLES).map((style) => [style, (s) => paint(style, s, process.stdout)]));

const out = (style, method = 'info') => (s) => console[method](paint(style, s, process.stdout));
const err = (style, method = 'error') => (s) => console[method](paint(style, s, process.stderr));

export const print = {
  head: out('purple'),
  boldHead: out('boldPurple'),
  section: out('yellow'),
  boldSection: out('boldYellow'),
  info: out('green'),
  boldInfo: out('boldGreen'),
  success: out('cyan', 'log'),
  boldSuccess: out('boldCyan', 'log'),
  gray: out('gray'),
  boldGray: out('boldGray'),
  blue: out('blue'),
  boldBlue: out('boldBlue'),
  error: err('red'),
  boldError: err('boldRed'),
  grayError: err('gray'),
  warn: err('yellow', 'warn'),
  boldWarn: err('boldYellow', 'warn'),
  debug: out('gray', 'debug'),
};
