import { print, addTest } from '../index.js';
import { setupJsdom, teardownJsdom, resetDom, flushPromises } from './jsdom-setup.js';
import { silenceConsole } from './silence-console.js';
import './assertion-lib.js';
import './spyon.js';
import './clock.js';
import config from '#root/nutin.config.js';

export function registerTestGlobals() {
  let currentSuite = '';
  let currentSuiteHooks = {};

  global.describe = (name, fn) => {
    currentSuite = name;
    currentSuiteHooks = {
      beforeAll: null,
      beforeEach: null,
      afterEach: null,
      afterAll: null
    };
    if (config.testinNutin.verbose) print.boldSuccess('📂 ' + name);
    fn();
  };

  global.it = (name, fn) => {
    addTest({ 
      suiteName: currentSuite, 
      testName: name, 
      testFn: fn,
      beforeEach: currentSuiteHooks.beforeEach,
      beforeAll: currentSuiteHooks.beforeAll,
      afterEach: currentSuiteHooks.afterEach,
      afterAll: currentSuiteHooks.afterAll
    });
  };
  global.it.todo = (s) => {
    addTest({ suiteName: currentSuite, testName: s, isTodo: true });
  };

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

  // cancelable: true matches a real browser's native click event, so code
  // under test that calls preventDefault() actually sees defaultPrevented.
  global.click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  global.type = (el, text) => { el.value = text; el.dispatchEvent(new window.InputEvent("input", { bubbles: true })); };

}
