import { print, chalk, useColor } from './print.js';

describe('print', () => {
  // Colours depend on the terminal: forced here, so the assertions don't depend on how tests run.
  let savedForceColor;
  let infoSpy;
  let logSpy;
  let errorSpy;
  let warnSpy;
  let debugSpy;

  beforeEach(() => {
    savedForceColor = process.env.FORCE_COLOR;
    process.env.FORCE_COLOR = '1';
    infoSpy = spyOn(console, 'info').andCallFake(() => {});
    logSpy = spyOn(console, 'log').andCallFake(() => {});
    errorSpy = spyOn(console, 'error').andCallFake(() => {});
    warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    debugSpy = spyOn(console, 'debug').andCallFake(() => {});
  });

  afterEach(() => {
    if (savedForceColor === undefined) delete process.env.FORCE_COLOR;
    else process.env.FORCE_COLOR = savedForceColor;
    infoSpy.restore();
    logSpy.restore();
    errorSpy.restore();
    warnSpy.restore();
    debugSpy.restore();
  });

  it('info() writes to console.info, colorized green', () => {
    print.info('hello');
    expect(infoSpy.callCount).toBe(1);
    expect(infoSpy.lastCall).toEqual([chalk.green('hello')]);
  });

  it('success() writes to console.log, colorized cyan', () => {
    print.success('done');
    expect(logSpy.callCount).toBe(1);
    expect(logSpy.lastCall).toEqual([chalk.cyan('done')]);
  });

  it('error() writes to console.error, colorized red', () => {
    print.error('oops');
    expect(errorSpy.callCount).toBe(1);
    expect(errorSpy.lastCall).toEqual([chalk.red('oops')]);
  });

  it('warn() writes to console.warn, colorized yellow', () => {
    print.warn('careful');
    expect(warnSpy.callCount).toBe(1);
    expect(warnSpy.lastCall).toEqual([chalk.yellow('careful')]);
  });

  it('debug() writes to console.debug, colorized gray', () => {
    print.debug('trace');
    expect(debugSpy.callCount).toBe(1);
    expect(debugSpy.lastCall).toEqual([chalk.gray('trace')]);
  });

  it('chalk wraps text in the matching ANSI escape codes', () => {
    expect(chalk.red('x')).toBe('\x1b[31mx\x1b[0m');
    expect(chalk.boldGreen('x')).toBe('\x1b[1;32mx\x1b[0m');
  });

  it('useColor: on for a terminal, off when piped, NO_COLOR off, FORCE_COLOR on, FORCE_COLOR=0 off', () => {
    const tty = { isTTY: true };
    const pipe = { isTTY: false };

    expect(useColor(tty, {})).toBe(true);
    expect(useColor(pipe, {})).toBe(false);
    expect(useColor(tty, { NO_COLOR: '1' })).toBe(false);
    expect(useColor(tty, { NO_COLOR: '' })).toBe(true);
    expect(useColor(pipe, { FORCE_COLOR: '1' })).toBe(true);
    expect(useColor(tty, { FORCE_COLOR: '0' })).toBe(false);
    expect(useColor(tty, { FORCE_COLOR: 'false' })).toBe(false);
    expect(useColor(pipe, { FORCE_COLOR: '0' })).toBe(false);
    expect(useColor(pipe, { FORCE_COLOR: '0', NO_COLOR: '' })).toBe(false);
    // FORCE_COLOR wins over NO_COLOR.
    expect(useColor(pipe, { FORCE_COLOR: '1', NO_COLOR: '1' })).toBe(true);
  });

  it('prints plain text when colours are off', () => {
    process.env.FORCE_COLOR = '0';
    const savedNoColor = process.env.NO_COLOR;
    process.env.NO_COLOR = '1';
    try {
      print.info('plain');
      expect(infoSpy.lastCall).toEqual(['plain']);
    } finally {
      if (savedNoColor === undefined) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = savedNoColor;
    }
  });
});
