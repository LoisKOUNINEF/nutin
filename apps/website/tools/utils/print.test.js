import { print, chalk } from './print.js';

describe('print', () => {
  let infoSpy;
  let logSpy;
  let errorSpy;
  let warnSpy;
  let debugSpy;

  beforeEach(() => {
    infoSpy = spyOn(console, 'info').andCallFake(() => {});
    logSpy = spyOn(console, 'log').andCallFake(() => {});
    errorSpy = spyOn(console, 'error').andCallFake(() => {});
    warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    debugSpy = spyOn(console, 'debug').andCallFake(() => {});
  });

  afterEach(() => {
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
});
