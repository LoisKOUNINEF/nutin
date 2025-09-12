global.spyOn = (obj, methodName) => {
  const originalFn = obj[methodName];

  const calls = [];
  const spy = function (...args) {
    calls.push(args);
    return originalFn.apply(this, args);
  };

  spy.calls = calls;

  obj[methodName] = spy;

  return {
    restore() {
      obj[methodName] = originalFn;
    },
    get calls() {
      return calls;
    }
  };
};
