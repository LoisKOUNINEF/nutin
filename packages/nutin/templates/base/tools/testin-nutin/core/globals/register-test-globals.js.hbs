import { print, addTest } from '../index.js';
import { setupJsdom, teardownJsdom, resetDom, flushPromises } from './jsdom-setup.js';
import { silenceConsole } from './silence-console.js';
import './assertion-lib.js';
import './spyon.js';
import './clock.js';

const verboseEnabled = process.argv.includes('--verbose');

export function registerTestGlobals() {
  let currentSuite = '';
  let currentSuiteHooks = {};
  // 'skip' (describe.skip) or 'only' (describe.only) applies to every test of the suite.
  let currentSuiteMode = 'normal';

  const defineSuite = (name, fn, mode) => {
    // A describe() nested in a .skip or .only one keeps its parent's mode (skip wins over only),
    // and the parent's mode is back for its tests after the nested one.
    const parentMode = currentSuiteMode;
    currentSuite = name;
    currentSuiteMode = [parentMode, mode].includes('skip') ? 'skip'
      : [parentMode, mode].includes('only') ? 'only'
      : 'normal';
    currentSuiteHooks = {
      beforeAll: null,
      beforeEach: null,
      afterEach: null,
      afterAll: null
    };
    if (verboseEnabled) print.boldSuccess('📂 ' + name);
    try {
      fn();
    } finally {
      currentSuiteMode = parentMode;
    }
  };

  global.describe = (name, fn) => defineSuite(name, fn, 'normal');
  global.describe.skip = (name, fn) => defineSuite(name, fn, 'skip');
  global.describe.only = (name, fn) => defineSuite(name, fn, 'only');

  // The suite's hooks object is shared by reference (read when the queue runs),
  // so a hook registered after some it() calls in the same describe() still applies to them.
  const addSuiteTest = (name, fn, { only = false } = {}) => {
    const isSkipped = currentSuiteMode === 'skip';
    addTest({
      suiteName: currentSuite,
      testName: name,
      testFn: isSkipped ? null : fn,
      hooks: currentSuiteHooks,
      isSkipped,
      // In a describe.skip, the skip wins.
      isOnly: !isSkipped && (only || currentSuiteMode === 'only'),
    });
  };

  global.it = (name, fn) => addSuiteTest(name, fn);
  global.it.only = (name, fn) => addSuiteTest(name, fn, { only: true });
  global.it.skip = (name) => {
    addTest({ suiteName: currentSuite, testName: name, isSkipped: true });
  };
  global.it.todo = (s) => {
    addTest({ suiteName: currentSuite, testName: s, isTodo: true });
  };
  // Same function, so test.only / test.skip / test.todo work too.
  global.test = global.it;

  global.beforeAll = (fn) => {
    currentSuiteHooks.beforeAll = fn;
  };
  global.beforeEach = (fn) => {
    currentSuiteHooks.beforeEach = fn;
  };
  global.afterAll = (fn) => {
    currentSuiteHooks.afterAll = fn;
  };
  global.afterEach = (fn) => {
    currentSuiteHooks.afterEach = fn;
  };

  global.setupJsdom = setupJsdom;
  global.teardownJsdom = teardownJsdom;
  global.resetDom = resetDom;
  global.flushPromises = flushPromises;
  global.silenceConsole = silenceConsole;

  global.$ = (selector) => document.querySelector(selector);
  global.$$ = (selector) => [...document.querySelectorAll(selector)];

  // cancelable: true matches a real browser's native click event,
  // so code under test that calls preventDefault() actually sees defaultPrevented.
  global.click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  global.type = (el, text) => { el.value = text; el.dispatchEvent(new window.InputEvent("input", { bubbles: true })); };

}
