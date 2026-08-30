describe('clock (fake timers)', () => {
  afterEach(() => {
    useRealTimers();
  });

  it('should fake setTimeout and fire it on advanceTimersByTime', () => {
    useFakeTimers();
    let called = false;
    setTimeout(() => { called = true; }, 1000);

    expect(called).toBeFalsy();
    advanceTimersByTime(999);
    expect(called).toBeFalsy();
    advanceTimersByTime(1);
    expect(called).toBeTruthy();
  });

  it('should fire multiple timers in deadline order', () => {
    useFakeTimers();
    const order = [];
    setTimeout(() => order.push('b'), 200);
    setTimeout(() => order.push('a'), 100);
    setTimeout(() => order.push('c'), 300);

    advanceTimersByTime(300);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('should fire setInterval repeatedly on a single advance', () => {
    useFakeTimers();
    let count = 0;
    const id = setInterval(() => { count++; }, 10);

    advanceTimersByTime(105);
    expect(count).toEqual(10);
    clearInterval(id);
  });

  it('should chase timers scheduled from within a firing timer via runAllTimers', () => {
    useFakeTimers();
    const order = [];
    setTimeout(() => {
      order.push('first');
      setTimeout(() => order.push('nested'), 10);
    }, 10);

    runAllTimers();
    expect(order).toEqual(['first', 'nested']);
    expect(getTimerCount()).toEqual(0);
  });

  it('should bail out of an infinite setInterval loop in runAllTimers', () => {
    useFakeTimers();
    setInterval(() => {}, 0);
    const throwing = () => runAllTimers();

    expect(throwing).toThrow();
  });

  it('should only fire snapshot-pending timers with runOnlyPendingTimers', () => {
    useFakeTimers();
    let outer = 0;
    let inner = 0;
    setTimeout(() => {
      outer++;
      setTimeout(() => { inner++; }, 0);
    }, 0);

    runOnlyPendingTimers();
    expect(outer).toEqual(1);
    expect(inner).toEqual(0);
  });

  it('should clear all pending timers without firing them', () => {
    useFakeTimers();
    let called = false;
    setTimeout(() => { called = true; }, 10);

    expect(getTimerCount()).toEqual(1);
    clearAllTimers();
    expect(getTimerCount()).toEqual(0);
    advanceTimersByTime(1000);
    expect(called).toBeFalsy();
  });

  it('should reflect fake time in Date.now() and new Date()', () => {
    useFakeTimers();
    setSystemTime(1000000);

    expect(Date.now()).toEqual(1000000);
    expect(new Date().getTime()).toEqual(1000000);
    advanceTimersByTime(500);
    expect(Date.now()).toEqual(1000500);
  });

  it('should still construct explicit Date args normally under fake time', () => {
    useFakeTimers();
    setSystemTime(1000000);
    const explicit = new Date(2020, 0, 1);

    expect(explicit.getFullYear()).toEqual(2020);
  });

  it('should restore real timers after useRealTimers()', async () => {
    useFakeTimers();
    useRealTimers();

    await new Promise(resolve => {
      setTimeout(resolve, 5);
    });
    expect(true).toBeTruthy();
  });

  it('should throw a clear error when used without useFakeTimers()', () => {
    const throwing = () => advanceTimersByTime(100);
    expect(throwing).toThrow('useFakeTimers');
  });
});
