import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ssrDir = path.dirname(fileURLToPath(import.meta.url));

// A stand-in for the app bundle that reads DOM getters off their prototypes as it loads, as
// clobbering-proof sanitizers do (a11y-elements' sanitize.js). Its one route key carries what
// those getters saw, so the test can check them through getAppRoutePaths()' return value.
const FIXTURE_BUNDLE = `
const getter = (proto, name) => {
  const get = Object.getOwnPropertyDescriptor(proto, name).get;
  return (node) => get.call(node);
};
const elementChildren = getter(Element.prototype, 'children');
const fragmentChildren = getter(DocumentFragment.prototype, 'children');
const elementLocalName = getter(Element.prototype, 'localName');
const nodeChildNodes = getter(Node.prototype, 'childNodes');
const nodeType = getter(Node.prototype, 'nodeType');
const templateContent = getter(HTMLTemplateElement.prototype, 'content');

const holder = document.createElement('template');
holder.innerHTML = '<p>hi</p><b>!</b>';
const content = templateContent(holder);
const seen = [
  nodeChildNodes(content).length,
  fragmentChildren(content).length,
  elementChildren(document.body).length,
  elementLocalName(fragmentChildren(content)[0]),
  nodeType(nodeChildNodes(content)[0]),
].join(',');

export const appRoutes = { ['/' + seen]: {} };
`;

// Runs in a child process: installGlobals() replaces window/document/fetch/navigator on
// globalThis, which would break the jsdom globals the rest of the suite shares.
function runNode(script) {
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('getAppRoutePaths (SSR prerender with load-time prototype getter lookups)', () => {
  let tmpDir;
  let bundleUrl;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-ssr-render-'));
    const bundlePath = path.join(tmpDir, 'ssr-bundle.mjs');
    fs.writeFileSync(bundlePath, FIXTURE_BUNDLE);
    bundleUrl = pathToFileURL(bundlePath).href;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('imports the bundle, and the prototype getters see the real nodes', () => {
    const renderUrl = pathToFileURL(path.join(ssrDir, 'ssr-render.js')).href;
    const output = runNode(`
      const { getAppRoutePaths } = await import(${JSON.stringify(renderUrl)});
      const paths = await getAppRoutePaths(${JSON.stringify(bundleUrl)}, 'en', 'http://localhost/');
      console.log(JSON.stringify(paths));
    `);

    expect(JSON.parse(output.trim().split('\n').pop())).toEqual(['/2,2,0,p,1']);
  });

  it('the bundle crashes on a bare linkedom window (the fixture reproduces the bug)', () => {
    let error;
    try {
      runNode(`
        import { parseHTML } from 'linkedom';
        const { window } = parseHTML('<!doctype html><html><body></body></html>');
        for (const key of ['window', 'document', 'Node', 'Element', 'DocumentFragment', 'HTMLTemplateElement']) {
          globalThis[key] = key === 'window' ? window : window[key];
        }
        await import(${JSON.stringify(bundleUrl)});
      `);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.stderr).toContain("Cannot read properties of undefined (reading 'get')");
  });
});
