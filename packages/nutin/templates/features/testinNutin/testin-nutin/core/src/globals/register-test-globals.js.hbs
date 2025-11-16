import { print, addTest } from '../../index.js';
import config from '#root/testin-nutin.config.js';
import { setupJsdom, teardownJsdom, resetDom, flushPromises } from './jsdom-setup.js';
import './assertion-lib.js';
import './spyon.js';

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
    if (config.verbose) print.boldSuccess('📂 ' + name);
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

  global.$ = (selector) => document.querySelector(selector);
  global.$$ = (selector) => [...document.querySelectorAll(selector)];

  global.click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  global.type = (el, text) => { el.value = text; el.dispatchEvent(new window.InputEvent("input", { bubbles: true })); };

}
