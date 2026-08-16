import { createMockMethod } from './create-mock-method.js';

describe('createMockMethod', () => {
  it('records every call', () => {
    const fn = createMockMethod();
    fn(1, 2);
    fn('a');

    expect(fn.calls).toEqual([[1, 2], ['a']]);
  });

  it('returns undefined by default', () => {
    const fn = createMockMethod();
    expect(fn()).toBe(undefined);
  });

  it('mockReturnValue makes every call return a fixed value', () => {
    const fn = createMockMethod();
    fn.mockReturnValue(42);

    expect(fn()).toBe(42);
    expect(fn('ignored arg')).toBe(42);
  });

  it('mockImplementation delegates to the given function', () => {
    const fn = createMockMethod();
    fn.mockImplementation((a, b) => a + b);

    expect(fn(2, 3)).toBe(5);
  });

  it('mockReset clears recorded calls and configured behavior', () => {
    const fn = createMockMethod();
    fn.mockReturnValue(42);
    fn(1);

    fn.mockReset();

    expect(fn.calls).toEqual([]);
    expect(fn()).toBe(undefined);
  });
});
