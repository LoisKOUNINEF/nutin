import { registerPipes } from '#root/dist/src/core/services/pipe-registry/pipes.js';
import { AppPipeRegistry } from '#root/dist/src/core/index.js';

describe('pipes (registerPipes)', () => {
  beforeAll(() => {
    // AppPipeRegistry is a process-wide singleton shared by every suite in the
    // run - if an earlier suite (e.g. pipe-registry.test.js) already re-registered
    // the app's pipes, this call is a legitimate no-op that logs a "already exists"
    // warning per pipe. Silence that expected noise rather than letting it leak.
    silenceConsole('warn', () => registerPipes());
  });

  it('currency formats a number as USD/en-US by default', () => {
    const expected = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5);
    expect(AppPipeRegistry.apply('currency', 1234.5)).toBe(expected);
  });

  it('currency accepts a custom currency and locale via args', () => {
    const expected = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1000);
    expect(AppPipeRegistry.apply('currency', 1000, ['EUR', 'de-DE'])).toBe(expected);
  });

  it('date formats using the "long" format by default', () => {
    const value = '2024-03-15T00:00:00Z';
    const expected = new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    expect(AppPipeRegistry.apply('date', value, ['en-US'])).toBe(expected);
  });

  it('date formats using the "short" format when requested', () => {
    const value = '2024-03-15T00:00:00Z';
    const expected = new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'short'])).toBe(expected);
  });

  it('date formats using the "time" format when requested', () => {
    const value = '2024-03-15T14:30:00Z';
    const expected = new Date(value).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'time'])).toBe(expected);
  });

  it('date falls back to the "long" format for an unrecognized format name', () => {
    const value = '2024-03-15T00:00:00Z';
    const expected = new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'nonsense'])).toBe(expected);
  });

  it('date includes hour/minute in short/long formats when the time flag is set', () => {
    const value = '2024-03-15T14:30:00Z';
    const expected = new Date(value).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'long', true])).toBe(expected);
  });

  it('date warns and returns the raw stringified value for an invalid date', () => {
    const warnSpy = spyOn(console, 'warn');
    warnSpy.andCallFake(() => {});

    const result = AppPipeRegistry.apply('date', 'not-a-date', ['en-US']);

    expect(result).toBe('not-a-date');
    expect(warnSpy.callCount).toBe(1);
    warnSpy.restore();
  });

  it('number defaults to 0 decimal places', () => {
    expect(AppPipeRegistry.apply('number', 3.14159)).toBe('3');
  });

  it('number respects an explicit decimals arg', () => {
    expect(AppPipeRegistry.apply('number', 3.14159, ['2'])).toBe('3.14');
  });

  it('uppercase converts to upper case', () => {
    expect(AppPipeRegistry.apply('uppercase', 'hello')).toBe('HELLO');
  });

  it('lowercase converts to lower case', () => {
    expect(AppPipeRegistry.apply('lowercase', 'HELLO')).toBe('hello');
  });

  it('capitalize uppercases only the first letter and lowercases the rest', () => {
    expect(AppPipeRegistry.apply('capitalize', 'HELLO world')).toBe('Hello world');
  });

  it('capitalizeAll capitalizes the first letter of every word', () => {
    expect(AppPipeRegistry.apply('capitalizeAll', 'hello world')).toBe('Hello World');
  });

  it('capitalizeAll capitalizes after separators like comma and period', () => {
    expect(AppPipeRegistry.apply('capitalizeAll', 'hello, world. goodbye')).toBe('Hello, World. Goodbye');
  });

  it('capitalizeAll does not capitalize a letter immediately following an apostrophe', () => {
    expect(AppPipeRegistry.apply('capitalizeAll', "o'brien's house")).toBe("O'brien's House");
  });

  it('truncate leaves a string shorter than the given length unchanged', () => {
    expect(AppPipeRegistry.apply('truncate', 'Hi', ['5'])).toBe('Hi');
  });

  it('truncate cuts a longer string and appends the default suffix', () => {
    expect(AppPipeRegistry.apply('truncate', 'Hello World', ['5'])).toBe('Hello...');
  });

  it('truncate accepts a custom suffix', () => {
    expect(AppPipeRegistry.apply('truncate', 'Hello World', ['5', '---'])).toBe('Hello---');
  });

  it('default returns the value unchanged when it is truthy', () => {
    expect(AppPipeRegistry.apply('default', 'value', ['N/A'])).toBe('value');
  });

  it('default falls back to the given default when the value is falsy', () => {
    expect(AppPipeRegistry.apply('default', '', ['N/A'])).toBe('N/A');
    expect(AppPipeRegistry.apply('default', 0, ['N/A'])).toBe('N/A');
  });

  it('json pretty-prints a plain value', () => {
    expect(AppPipeRegistry.apply('json', { a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('json falls back to String(value) when JSON.stringify throws (e.g. a circular reference)', () => {
    const circular = {};
    circular.self = circular;
    expect(AppPipeRegistry.apply('json', circular)).toBe(String(circular));
  });
});
