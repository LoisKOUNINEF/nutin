export function silenceConsole(methodOrMethods, fn) {
  const methods = Array.isArray(methodOrMethods) ? methodOrMethods : [methodOrMethods];
  const spies = methods.map((method) => spyOn(console, method).andCallFake(() => {}));
  const restore = () => spies.forEach((spy) => spy.restore());

  let result;
  try {
    result = fn();
  } catch (err) {
    restore();
    throw err;
  }

  if (result && typeof result.then === 'function') {
    return result.then(
      (value) => { restore(); return value; },
      (err) => { restore(); throw err; }
    );
  }

  restore();
  return result;
}
