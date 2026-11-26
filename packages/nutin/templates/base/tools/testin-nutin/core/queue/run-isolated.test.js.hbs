import fs from 'fs';
import os from 'os';
import path from 'path';
import { startIsolatedFiles } from './run-isolated.js';

// Fixture test files, each run in its own worker as testinNutin.isolate does.
const FIXTURES = {
  'realm.test.js': `
    // A custom element package defined at import, as a static import of one would.
    customElements.define('x-probe', class extends HTMLElement { get upgraded() { return true; } });
    describe('Realm one', () => {
      it('upgrades in the first suite', () => {
        document.body.innerHTML = '<x-probe></x-probe><p id="left-over"></p>';
        expect(document.querySelector('x-probe').upgraded).toBe(true);
      });
    });
    describe('Realm two', () => {
      it('upgrades in a second suite, with the document back as loaded', () => {
        expect(document.createElement('x-probe').upgraded).toBe(true);
        expect(document.getElementById('left-over')).toBe(null);
      });
      // The worker is ended once its tests are done, so this doesn't keep it alive.
      it('leaves an interval running', () => { setInterval(() => {}, 10); });
    });
  `,
  'broken.test.js': `throw new Error('broken fixture');`,
  // Its import never finishes: a top-level await still pending while a timer keeps the worker alive
  // (without one, Node ends the worker with exit code 13 instead).
  'hangs.test.mjs': `setInterval(() => {}, 1000); await new Promise(() => {}); describe('Never', () => { it('runs', () => {}); });`,
  'only.test.js': `
    describe.only('Only', () => { it('runs', () => {}); });
    describe('Plain', () => { it('is left out', () => { throw new Error('ran'); }); });
    describe('Suite', () => {
      let beforeAllCount = 0;
      beforeAll(() => { beforeAllCount++; });
      it('is left out', () => { throw new Error('ran'); });
      it.only('runs after its suite\\'s beforeAll', () => { expect(beforeAllCount).toBe(1); });
    });
    describe.only('Only parent', () => {
      describe.skip('Skipped child', () => { it('child', () => { throw new Error('ran'); }); });
      it('parent test after the child', () => {});
    });
    describe.skip('Skip parent', () => {
      describe.only('Only child', () => { it('child', () => { throw new Error('ran'); }); });
      it('parent test after the child', () => { throw new Error('ran'); });
    });
  `,
};

let dir;
const fixture = (name) => path.join(dir, name);
const statuses = (run) => run.results.map(({ name, status }) => `${name}:${status}`);

// Started together in beforeAll: each worker loads jsdom, which takes most of the time.
let withoutOnly;
let withOnly;
let hanging;

describe('startIsolatedFiles', () => {
  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'testin-nutin-isolated-'));
    Object.entries(FIXTURES).forEach(([name, source]) => fs.writeFileSync(fixture(name), source));
    withoutOnly = startIsolatedFiles(['realm.test.js', 'broken.test.js'].map(fixture));
    withOnly = startIsolatedFiles([fixture('only.test.js')]);
    hanging = startIsolatedFiles([fixture('hangs.test.mjs')], { loadTimeout: 1000 });
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('runs each file in its own window, reports load errors, and ends workers left with timers', async () => {
    const loaded = await withoutOnly.loaded;
    expect(loaded.map(({ hasOnly }) => hasOnly)).toEqual([false, false]);
    expect(loaded[0].loadError).toBe(null);
    expect(loaded[1].loadError).toContain('broken fixture');
    expect(loaded[1].file).toBe(fixture('broken.test.js'));

    const [realm, broken] = await withoutOnly.run(false);
    expect(statuses(realm)).toEqual([
      'upgrades in the first suite:passed',
      'upgrades in a second suite, with the document back as loaded:passed',
      'leaves an interval running:passed',
    ]);
    expect([broken.passed, broken.failed]).toEqual([0, 0]);
    expect(realm.coverage).toEqual([]);
  });

  it('stops a worker whose file doesn\'t finish loading in time, and reports it as a load error', async () => {
    const [loaded] = await hanging.loaded;
    expect(loaded.file).toBe(fixture('hangs.test.mjs'));
    expect(loaded.hasOnly).toBe(false);
    expect(loaded.loadError).toContain('didn\'t finish loading within 1 s');

    const [run] = await hanging.run(false);
    expect([run.passed, run.failed, run.results.length]).toEqual([0, 0, 0]);
  });

  it('applies .only, skip beating only, nested suites included', async () => {
    const [loaded] = await withOnly.loaded;
    expect(loaded.hasOnly).toBe(true);

    const [only] = await withOnly.run(true);
    expect(statuses(only)).toEqual([
      'runs:passed',
      'is left out:skipped',
      'is left out:skipped',
      'runs after its suite\'s beforeAll:passed',
      'child:skipped',
      'parent test after the child:passed',
      'child:skipped',
      'parent test after the child:skipped',
    ]);
    expect(only.results.map(({ explicit }) => explicit)).toEqual([undefined, false, false, undefined, true, undefined, true, true]);
  });
});
