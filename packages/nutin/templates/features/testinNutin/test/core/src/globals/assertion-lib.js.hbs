global.expect = (actual) => {
  const expectObj = {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be strictly equal to ${expected}`);
      }
    },
    toEqual(expected) {
      const deepEqual = (a, b) => {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (Array.isArray(a) && Array.isArray(b)) {
          return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
        }
        if (a && b && typeof a === 'object') {
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          if (keysA.length !== keysB.length) return false;
          return keysA.every(k => deepEqual(a[k], b[k]));
        }
        return false;
      };

      if (!deepEqual(actual, expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`);
      }
    },
    toContain(substring) {
      if (!actual.includes(substring)) {
        throw new Error(`Expected '${actual}' to contain '${substring}'`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`);
      }
    },
    toBeDefined() {
      if (actual === null || actual === undefined) {
        throw new Error(`Expected value to be defined, but got ${actual}`);
      }
    },
    toBeUndefined() {
      if (actual !== null && actual !== undefined) {
        throw new Error(`Expected value to be undefined, but got ${actual}`);
      }
    },
    toBeInstanceOf(constructor) {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected ${actual} to be instance of ${constructor.name}`);
      }
    },
    toHaveBeenCalled() {
      if (!actual?.calls || actual.calls.length === 0) {
        throw new Error(`Expected function to have been called, but it was not`);
      }
    },
    toHaveBeenCalledWith(...expectedArgs)  {
      const deepEqual = (a, b) => {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;

        if (Array.isArray(a) && Array.isArray(b)) {
          return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
        }

        if (a && b && typeof a === 'object') {
          const keysA = Object.keys(a);
          const keysB = Object.keys(b);
          if (keysA.length !== keysB.length) return false;
          return keysA.every(k => deepEqual(a[k], b[k]));
        }

        return false;
      };

      const matched = actual?.calls?.some(args =>
        args.length === expectedArgs.length &&
        args.every((arg, i) => deepEqual(arg, expectedArgs[i]))
      );

      if (!matched) {
        throw new Error(
          `Expected function to have been called with ${JSON.stringify(expectedArgs)}, but it was not.\n` +
          `Actual calls:\n${JSON.stringify(actual?.calls, null, 2)}`
        );
      }
    },
    toBeLessThan(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`)
      }
    },
    toBeGreaterThan(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`)
      }
    },
    toThrow(expectedMessage) {
      let threw = false;
      try {
        actual();
      } catch (err) {
        threw = true;
        if (expectedMessage && !err.message.includes(expectedMessage)) {
          throw new Error(`Expected error message to include "${expectedMessage}", but got "${err.message}"`);
        }
      }
      if (!threw) {
        throw new Error(`Expected function to throw, but it did not`);
      }
    },
  };

  // 'not' variants
  expectObj.not = {};
  for (const [name, fn] of Object.entries(expectObj)) {
    if (name === 'not') continue;
    if (typeof fn !== 'function') continue;

    expectObj.not[name] = (...args) => {
      try {
        fn(...args);
      } catch {
        return;
      }
      throw new Error(`Expected NOT: ${name}(${JSON.stringify(args)})`);
    };
  }
  return expectObj;
};
