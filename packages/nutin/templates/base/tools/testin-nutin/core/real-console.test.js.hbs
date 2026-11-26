import { restoreRealConsole } from './real-console.js';

describe('restoreRealConsole', () => {
  it('puts back the console methods a test left stubbed', () => {
    const realError = console.error;
    const realWarn = console.warn;
    const errorSpy = spyOn(console, 'error').andCallFake(() => {});
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      restoreRealConsole();
      expect(console.error).toBe(realError);
      expect(console.warn).toBe(realWarn);
    } finally {
      errorSpy.restore();
      warnSpy.restore();
    }
  });
});
