export function createMockMethod() {
  const calls = [];
  const fn = (...args) => {
    calls.push(args);
    if (fn.__mockReturn !== undefined) return fn.__mockReturn;
    if (fn.__mockReturnFn) return fn.__mockReturnFn(...args);
  };
  fn.calls = calls;
  fn.mockReturnValue = (value) => { fn.__mockReturn = value; };
  fn.mockImplementation = (implFn) => { fn.__mockReturnFn = implFn; };
  fn.mockReset = () => {
    calls.length = 0;
    delete fn.__mockReturn;
    delete fn.__mockReturnFn;
  };
  return fn;
}