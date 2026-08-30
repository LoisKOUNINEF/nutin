class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

global.AssertionError = AssertionError;

global.expect = (actual) => {
  const expectObj = {
    toBe(expected) {
      if (actual !== expected) {
        throw new AssertionError(`Expected ${actual} to be strictly equal to ${expected}`);
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
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`);
      }
    },
    toContain(substring) {
      if (!actual.includes(substring)) {
        throw new AssertionError(`Expected '${actual}' to contain '${substring}'`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(`Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new AssertionError(`Expected ${actual} to be falsy`);
      }
    },
    toBeDefined() {
      if (actual === null || actual === undefined) {
        throw new AssertionError(`Expected value to be defined, but got ${actual}`);
      }
    },
    toBeUndefined() {
      if (actual !== null && actual !== undefined) {
        throw new AssertionError(`Expected value to be undefined, but got ${actual}`);
      }
    },
    toBeInstanceOf(constructor) {
      if (!(actual instanceof constructor)) {
        throw new AssertionError(`Expected ${actual} to be instance of ${constructor.name}`);
      }
    },
    toHaveBeenCalled() {
      if (!actual?.calls || actual.calls.length === 0) {
        throw new AssertionError(`Expected function to have been called, but it was not`);
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
        throw new AssertionError(
          `Expected function to have been called with ${JSON.stringify(expectedArgs)}, but it was not.\n` +
          `Actual calls:\n${JSON.stringify(actual?.calls, null, 2)}`
        );
      }
    },
    toBeLessThan(expected) {
      if (actual > expected) {
        throw new AssertionError(`Expected ${actual} to be less than ${expected}`)
      }
    },
    toBeGreaterThan(expected) {
      if (actual < expected) {
        throw new AssertionError(`Expected ${actual} to be greater than ${expected}`)
      }
    },
    toThrow(expectedMessage) {
      const checkMessage = (err) => {
        if (expectedMessage && !err.message.includes(expectedMessage)) {
          throw new AssertionError(`Expected error message to include "${expectedMessage}", but got "${err.message}"`);
        }
      };

      let result;
      try {
        result = actual();
      } catch (err) {
        checkMessage(err);
        return;
      }

      // actual() returned a promise (async function) — it can only reject
      // asynchronously, so return a promise the caller must await instead of
      // throwing synchronously.
      if (result && typeof result.then === 'function') {
        return result.then(
          () => { throw new AssertionError(`Expected function to throw, but it did not`); },
          (err) => { checkMessage(err); }
        );
      }

      throw new AssertionError(`Expected function to throw, but it did not`);
    },
  };

  // 'not' variants
  expectObj.not = {};
  for (const [name, fn] of Object.entries(expectObj)) {
    if (name === 'not') continue;
    if (typeof fn !== 'function') continue;

    expectObj.not[name] = (...args) => {
      const settle = (err) => {
        if (err) {
          if (err instanceof AssertionError) return;
          throw err;
        }
        throw new AssertionError(`Expected NOT: ${name}(${JSON.stringify(args)})`);
      };

      let result;
      try {
        result = fn(...args);
      } catch (err) {
        return settle(err);
      }

      // Only toThrow(), given an async function, can return a promise here —
      // every other matcher (and toThrow given a sync function) is synchronous.
      if (result && typeof result.then === 'function') {
        return result.then(() => settle(), (err) => settle(err));
      }

      return settle();
    };
  }
  return expectObj;
};
