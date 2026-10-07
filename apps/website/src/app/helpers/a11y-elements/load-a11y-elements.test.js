import { loadA11yCardLink, loadA11yDrawer, loadA11yDropdown, loadA11yElements, loadA11yFloating } from '#root/dist/src/app/helpers/a11y-elements/load-a11y-elements.helper.js';

describe('loadA11yElements', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('loadA11yElements resolves to the entry registering every element', async () => {
    const all = await loadA11yElements();
    expect(typeof all.SwitchElement).toBe('function');
    expect(typeof all.ModalElement).toBe('function');
    expect(typeof all.FloatingElement).toBe('function');
    expect(typeof all.CardLinkElement).toBe('function');
  });

  it('loadA11yDropdown, loadA11yDrawer, loadA11yFloating and loadA11yCardLink each resolve to their own element', async () => {
    expect(typeof (await loadA11yDropdown()).DropdownElement).toBe('function');
    expect(typeof (await loadA11yDrawer()).DrawerElement).toBe('function');
    expect(typeof (await loadA11yFloating()).FloatingElement).toBe('function');
    expect(typeof (await loadA11yCardLink()).CardLinkElement).toBe('function');
  });

  it('loads each module once, however many times it is called', async () => {
    expect(await loadA11yDropdown()).toBe(await loadA11yDropdown());
    expect(await loadA11yElements()).toBe(await loadA11yElements());
  });
});
