global.expect = (actual) => {
  const expectObj = {
    toBe(expected) {
      if (actual != expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toEqual(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toContain(substring) {
      if (!actual.includes(substring)) {
        throw new Error(`Expected '${actual}' to contain '${substring}'`);
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
    toHaveBeenCalledWith(...expectedArgs) {
      const matched = actual?.calls?.some(args =>
        args.length === expectedArgs.length &&
        args.every((arg, i) => arg === expectedArgs[i])
      );
      if (!matched) {
        throw new Error(`Expected function to have been called with ${JSON.stringify(expectedArgs)}, but it was not`);
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
    }
  };

  // 'not' variants
  expectObj.not = {
    toBe(expected) {
      if (actual == expected) {
        throw new Error(`Expected ${actual} not to be ${expected}`);
      }
    },
    toEqual(expected) {
      if (actual === expected) {
        throw new Error(`Expected ${actual} not to be ${expected}`);
      }
    },
    toContain(substring) {
      if (actual.includes(substring)) {
        throw new Error(`Expected '${actual}' not to contain '${substring}'`);
      }
    },
    toBeDefined() {
      if (actual !== null && actual !== undefined) {
        throw new Error(`Expected value to be undefined, but got ${actual}`);
      }
    },
    toBeUndefined() {
      if (actual === null || actual === undefined) {
        throw new Error(`Expected value to be defined, but got ${actual}`);
      }
    },
    toBeInstanceOf(constructor) {
      if (actual instanceof constructor) {
        throw new Error(`Expected ${actual} not to be instance of ${constructor.name}`);
      }
    },
    toHaveBeenCalled() {
      if (actual?.calls && actual.calls.length > 0) {
        throw new Error(`Expected function not to have been called, but it was`);
      }
    },
    toHaveBeenCalledWith(...expectedArgs) {
      const matched = actual?.calls?.some(args =>
        args.length === expectedArgs.length &&
        args.every((arg, i) => arg === expectedArgs[i])
      );
      if (matched) {
        throw new Error(`Expected function not to have been called with ${JSON.stringify(expectedArgs)}, but it was`);
      }
    },
    toBeLessThan(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} not to be less than ${expected}`)
      }
    },
    toBeGreaterThan(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} not to be greater than ${expected}`)
      }
    }
  };

  return expectObj;
};
