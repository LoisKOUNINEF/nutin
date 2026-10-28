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

  it('currency formats a number as USD in the page\'s language by default', () => {
    const expected = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(1234.5);
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

  it('date reads the time flag from template strings: "true" adds the time, "false" does not', () => {
    const value = '2024-03-15T14:30:00Z';
    const dateOnly = new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const withTime = new Date(value).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'long', 'false'])).toBe(dateOnly);
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'long', 'true'])).toBe(withTime);
  });

  it('date and currency default to the page\'s <html lang>, not the browser\'s language', () => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = 'fr';
    const value = new Date(2026, 9, 28);
    try {
      const date = value.toLocaleString('fr', { year: 'numeric', month: 'long', day: 'numeric' });
      const price = new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' }).format(10);
      expect(AppPipeRegistry.apply('date', value)).toBe(date);
      // From a template, a skipped locale arrives as '' (date:,short).
      expect(AppPipeRegistry.apply('date', value, ['', 'long'])).toBe(date);
      expect(AppPipeRegistry.apply('currency', 10, ['EUR'])).toBe(price);
    } finally {
      html.lang = previous;
    }
  });

  it('date falls back to "en" when the page has no lang', () => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = '';
    const value = new Date(2026, 9, 28);
    try {
      expect(AppPipeRegistry.apply('date', value)).toBe(value.toLocaleString('en', { year: 'numeric', month: 'long', day: 'numeric' }));
    } finally {
      html.lang = previous;
    }
  });

  it('date "numeric" follows the locale\'s order without a pattern', () => {
    const value = new Date(2026, 9, 28);
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'numeric'])).toBe('10/28/2026');
    expect(AppPipeRegistry.apply('date', value, ['fr-FR', 'numeric'])).toBe('28/10/2026');
  });

  it('date "numeric" formats a YYYY/YY/MM/DD pattern, zero-padded, with any separator', () => {
    const value = new Date(2026, 2, 5);
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'numeric', 'false', 'DD/MM/YYYY'])).toBe('05/03/2026');
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'numeric', 'false', 'DD/MM/YY'])).toBe('05/03/26');
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'numeric', 'false', 'YYYY-MM-DD'])).toBe('2026-03-05');
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'numeric', 'false', 'DD.MM.YYYY'])).toBe('05.03.2026');
  });

  it('date "numeric" with a pattern appends the locale\'s time when the time flag is set', () => {
    const value = new Date(2026, 9, 28, 9, 5);
    const time = value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    expect(AppPipeRegistry.apply('date', value, ['en-GB', 'numeric', 'true', 'YYYY-MM-DD'])).toBe(`2026-10-28, ${time}`);
  });

  it('date "numeric" ignores a pattern without any token and uses the locale\'s order', () => {
    const value = new Date(2026, 9, 28);
    expect(AppPipeRegistry.apply('date', value, ['en-US', 'numeric', 'false', 'nonsense'])).toBe('10/28/2026');
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
