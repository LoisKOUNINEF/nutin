let _installed = false;
let _now = 0;                  // virtual clock, ms since epoch
let _idSeq = 1;                // fake timer id counter — starts at 1, never falsy
const _timers = new Map();     // id -> { id, type: 'timeout'|'interval', callback, args, delay, due }
let _originals = null;         // real fns captured at install time
const MAX_LOOP_ITERATIONS = 100000;

function _schedule(type, cb, delay, args) {
  if (typeof cb !== 'function') {
    throw new Error(`${type === 'timeout' ? 'setTimeout' : 'setInterval'} requires a function callback`);
  }
  const id = _idSeq++;
  const safeDelay = Math.max(0, Number(delay) || 0);
  _timers.set(id, { id, type, callback: cb, args, delay: safeDelay, due: _now + safeDelay });
  return id;
}

const fakeSetTimeout = (cb, delay = 0, ...args) => _schedule('timeout', cb, delay, args);
const fakeSetInterval = (cb, delay = 0, ...args) => _schedule('interval', cb, delay, args);
const fakeClearTimeout = (id) => { _timers.delete(id); };
const fakeClearInterval = fakeClearTimeout;

function _makeFakeDate(RealDate) {
  return class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(_now);
      } else {
        super(...args);
      }
    }
    static now() {
      return _now;
    }
  };
}

// Sugar over the fake timers rather than relying on jsdom-setup.js's
// `window.requestAnimationFrame ??= (cb) => setTimeout(cb, 0)` shim, which is
// dead code with `pretendToBeVisual: true` jsdom config
const fakeRequestAnimationFrame = (cb) => fakeSetTimeout(() => cb(_now), 16);
const fakeCancelAnimationFrame = (id) => fakeClearTimeout(id);

function _assertFake(name) {
  if (!_installed) {
    throw new Error(`${name}() requires useFakeTimers() to be called first`);
  }
}

function _earliestDue(predicate) {
  let best = null;
  for (const timer of _timers.values()) {
    if (predicate(timer) && (!best || timer.due < best.due || (timer.due === best.due && timer.id < best.id))) {
      best = timer;
    }
  }
  return best;
}

function _fire(timer) {
  if (timer.type === 'timeout') {
    _timers.delete(timer.id);
    timer.callback(...timer.args);
  } else {
    timer.due += timer.delay;
    timer.callback(...timer.args);
  }
}

global.useFakeTimers = function useFakeTimers() {
  if (_installed) return;

  _originals = {
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    Date: global.Date,
    requestAnimationFrame: global.requestAnimationFrame,
    cancelAnimationFrame: global.cancelAnimationFrame,
    windowSetTimeout: typeof window !== 'undefined' ? window.setTimeout : undefined,
    windowClearTimeout: typeof window !== 'undefined' ? window.clearTimeout : undefined,
    windowSetInterval: typeof window !== 'undefined' ? window.setInterval : undefined,
    windowClearInterval: typeof window !== 'undefined' ? window.clearInterval : undefined,
    windowDate: typeof window !== 'undefined' ? window.Date : undefined,
    windowRequestAnimationFrame: typeof window !== 'undefined' ? window.requestAnimationFrame : undefined,
    windowCancelAnimationFrame: typeof window !== 'undefined' ? window.cancelAnimationFrame : undefined,
  };

  _now = _originals.Date.now();
  _idSeq = 1;
  _timers.clear();

  const FakeDate = _makeFakeDate(_originals.Date);

  global.setTimeout = fakeSetTimeout;
  global.clearTimeout = fakeClearTimeout;
  global.setInterval = fakeSetInterval;
  global.clearInterval = fakeClearInterval;
  global.Date = FakeDate;
  // Compiled app code calls the bare `requestAnimationFrame` identifier, which
  // resolves via normal scope lookup to `global.requestAnimationFrame` — not
  // `window.requestAnimationFrame` — so both must be faked, not just window's.
  global.requestAnimationFrame = fakeRequestAnimationFrame;
  global.cancelAnimationFrame = fakeCancelAnimationFrame;

  if (typeof window !== 'undefined') {
    window.setTimeout = fakeSetTimeout;
    window.clearTimeout = fakeClearTimeout;
    window.setInterval = fakeSetInterval;
    window.clearInterval = fakeClearInterval;
    window.Date = FakeDate;
    window.requestAnimationFrame = fakeRequestAnimationFrame;
    window.cancelAnimationFrame = fakeCancelAnimationFrame;
  }

  _installed = true;
};

global.useRealTimers = function useRealTimers() {
  if (!_installed) return;

  global.setTimeout = _originals.setTimeout;
  global.clearTimeout = _originals.clearTimeout;
  global.setInterval = _originals.setInterval;
  global.clearInterval = _originals.clearInterval;
  global.Date = _originals.Date;
  global.requestAnimationFrame = _originals.requestAnimationFrame;
  global.cancelAnimationFrame = _originals.cancelAnimationFrame;

  if (typeof window !== 'undefined') {
    window.setTimeout = _originals.windowSetTimeout;
    window.clearTimeout = _originals.windowClearTimeout;
    window.setInterval = _originals.windowSetInterval;
    window.clearInterval = _originals.windowClearInterval;
    window.Date = _originals.windowDate;
    window.requestAnimationFrame = _originals.windowRequestAnimationFrame;
    window.cancelAnimationFrame = _originals.windowCancelAnimationFrame;
  }

  _timers.clear();
  _installed = false;
  _originals = null;
};

global.advanceTimersByTime = function advanceTimersByTime(ms) {
  _assertFake('advanceTimersByTime');
  const target = _now + Math.max(0, Number(ms) || 0);
  let iterations = 0;

  for (;;) {
    const next = _earliestDue(timer => timer.due <= target);
    if (!next) break;
    if (++iterations > MAX_LOOP_ITERATIONS) {
      throw new Error(`advanceTimersByTime: exceeded ${MAX_LOOP_ITERATIONS} timer firings — likely an interval rescheduling itself with delay 0`);
    }
    _now = next.due;
    _fire(next);
  }

  _now = target;
};

global.tick = global.advanceTimersByTime;

global.runAllTimers = function runAllTimers() {
  _assertFake('runAllTimers');
  let iterations = 0;

  while (_timers.size > 0) {
    if (++iterations > MAX_LOOP_ITERATIONS) {
      throw new Error(`runAllTimers: aborting after ${MAX_LOOP_ITERATIONS} timers — likely an infinite loop (e.g. an uncleared setInterval)`);
    }
    const next = _earliestDue(() => true);
    _now = Math.max(_now, next.due);
    _fire(next);
  }
};

global.runOnlyPendingTimers = function runOnlyPendingTimers() {
  _assertFake('runOnlyPendingTimers');
  const pendingIds = new Set(_timers.keys());

  for (;;) {
    const next = _earliestDue(timer => pendingIds.has(timer.id));
    if (!next) break;
    pendingIds.delete(next.id);
    _now = Math.max(_now, next.due);
    _fire(next);
  }
};

global.clearAllTimers = function clearAllTimers() {
  _assertFake('clearAllTimers');
  _timers.clear();
};

global.getTimerCount = function getTimerCount() {
  _assertFake('getTimerCount');
  return _timers.size;
};

global.setSystemTime = function setSystemTime(msOrDate) {
  _assertFake('setSystemTime');
  _now = msOrDate instanceof Date ? msOrDate.getTime() : Number(msOrDate);
};
