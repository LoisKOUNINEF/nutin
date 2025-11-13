global.spyOn = (obj, methodName) => {
  if (!obj || typeof methodName !== 'string') {
    throw new Error('spyOn requires an object and a method name');
  }

  const originalFn = obj[methodName];

  if (typeof originalFn !== 'function') {
    throw new Error(`Cannot spy on ${methodName} – not a function`);
  }

  const calls = [];

  function spyFunction(...args) {
    calls.push(args.slice());
    if (spyFunction._fake) {
      return spyFunction._fake.apply(this, args);
    }
    if (spyFunction._hasReturn) {
      return spyFunction._returnValue;
    }
    return originalFn.apply(this, args);
  }

  spyFunction._isSpy = true;
  spyFunction._fake = null;
  spyFunction._hasReturn = false;
  spyFunction._returnValue = undefined;

  obj[methodName] = spyFunction;

  const handle = {
    restore() {
      if (obj[methodName] === spyFunction) {
        obj[methodName] = originalFn;
      }
    },
    get calls() {
      return calls;
    },
    get callCount() {
      return calls.length;
    },
    get lastCall() {
      return calls.length ? calls[calls.length - 1] : undefined;
    },
    andCallFake(fn) {
      spyFunction._fake = fn;
      spyFunction._hasReturn = false;
    },
    andReturn(value) {
      spyFunction._returnValue = value;
      spyFunction._hasReturn = true;
      spyFunction._fake = null;
    }
  };

  return handle;
};
