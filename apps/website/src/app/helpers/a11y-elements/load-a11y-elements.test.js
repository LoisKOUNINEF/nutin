import { loadA11yDrawer, loadA11yDropdown, loadA11yElements } from '#root/dist/src/app/helpers/a11y-elements/load-a11y-elements.helper.js';

const DIST = 'https://cdn.jsdelivr.net/npm/a11y-elements@0.2.0/dist';

const stylesheets = () => [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.getAttribute('href'));
const scripts = () => [...document.head.querySelectorAll('script[type="module"]')].map((script) => script.getAttribute('src'));

describe('loadA11yElements', () => {
  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('loadA11yElements injects the stylesheet and every component and overlay bundle', () => {
    loadA11yElements();
    expect(stylesheets()).toEqual([`${DIST}/a11y.css`]);
    expect(scripts().length).toBe(25);
    expect(scripts()).toContain(`${DIST}/browser/components/switch/define.js`);
    expect(scripts()).toContain(`${DIST}/browser/overlays/modal/define.js`);
  });

  it('loadA11yDropdown only injects the stylesheet and the dropdown bundle', () => {
    loadA11yDropdown();
    expect(stylesheets()).toEqual([`${DIST}/a11y.css`]);
    expect(scripts()).toEqual([`${DIST}/browser/overlays/dropdown/define.js`]);
  });

  it('loadA11yDrawer only injects the stylesheet and the drawer bundle', () => {
    loadA11yDrawer();
    expect(stylesheets()).toEqual([`${DIST}/a11y.css`]);
    expect(scripts()).toEqual([`${DIST}/browser/overlays/drawer/define.js`]);
  });

  it('never injects the same tag twice', () => {
    loadA11yDropdown();
    loadA11yDrawer();
    loadA11yElements();
    loadA11yElements();
    expect(stylesheets().length).toBe(1);
    expect(scripts().length).toBe(25);
  });
});
