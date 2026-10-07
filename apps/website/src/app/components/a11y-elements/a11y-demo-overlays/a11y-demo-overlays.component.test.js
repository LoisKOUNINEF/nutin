import { A11yDemoOverlaysComponent } from '#root/dist/src/app/components/a11y-elements/a11y-demo-overlays/a11y-demo-overlays.component.js';
import { I18nService, Navigation } from '#root/dist/src/core/index.js';

const t = (key) => I18nService.translate(`a11y-demo-overlays.${key}`);

const OVERLAYS = [
  'a11y-blocking-loader', 'a11y-context-menu', 'a11y-drawer', 'a11y-dropdown', 'a11y-emergency-dialog', 'a11y-floating',
  'a11y-modal', 'a11y-notification-banner', 'a11y-popover', 'a11y-snackbar', 'a11y-tooltip',
];

function mount() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new A11yDemoOverlaysComponent(target);
  component.render();
  return component;
}

describe('A11yDemoOverlaysComponent', () => {
  beforeAll(() => {
    setupJsdom();
  });

  it('showcases every overlay', () => {
    const component = mount();
    for (const tag of OVERLAYS) {
      expect(document.querySelector(tag)).toBeTruthy();
    }
    component.destroy();
  });

  it('opens an overlay through its open attribute and closes it from a [data-a11y-demo-close] child', () => {
    const component = mount();
    const emergency = document.getElementById('a11y-demo-emergency');

    component.element.querySelector('[data-event="click:openOverlay:a11y-demo-emergency"]').click();
    expect(emergency.hasAttribute('open')).toBe(true);

    emergency.querySelector('[data-a11y-demo-close]').click();
    expect(emergency.hasAttribute('open')).toBe(false);
    component.destroy();
  });

  it('toggles the popover from its anchor', () => {
    const component = mount();
    const popover = document.getElementById('a11y-demo-popover');
    const anchor = document.getElementById('a11y-demo-popover-anchor');

    anchor.click();
    expect(popover.hasAttribute('open')).toBe(true);
    anchor.click();
    expect(popover.hasAttribute('open')).toBe(false);
    component.destroy();
  });

  it('removes overlays portaled to <body> when destroyed', () => {
    const component = mount();
    // What a11y-elements does on connect once its bundle is loaded.
    const modal = document.getElementById('a11y-demo-modal');
    const snackbar = document.getElementById('a11y-demo-snackbar');
    document.body.appendChild(modal);
    document.body.appendChild(snackbar);

    component.destroy();
    expect(document.getElementById('a11y-demo-modal')).toBeFalsy();
    expect(document.getElementById('a11y-demo-snackbar')).toBeFalsy();
    expect(document.querySelector('a11y-drawer')).toBeFalsy();
  });

  it('closes the blocking loader after its demo duration', () => {
    useFakeTimers();
    try {
      const component = mount();
      const loader = document.getElementById('a11y-demo-blocking-loader');

      component.element.querySelector('[data-event="click:openBlockingLoader"]').click();
      expect(loader.hasAttribute('open')).toBe(true);

      advanceTimersByTime(2500);
      expect(loader.hasAttribute('open')).toBe(false);
      component.destroy();
    } finally {
      useRealTimers();
    }
  });

  it('routes its back link through the SPA router', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    const component = mount();
    try {
      component.element.querySelector('.a11y-demo__back').click();
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.lastCall[0]).toBe('/a11y-elements');
    component.destroy();
  });

  it('shows each snackbar variant, including the undo action', () => {
    const component = mount();
    const calls = [];
    // The elements aren't defined under jsdom, so stand in for the upgraded element's API.
    document.getElementById('a11y-demo-snackbar').notify = (message, options) => calls.push([message, options]);

    ['info', 'success', 'error'].forEach((type) => component.element.querySelector(`[data-event="click:showSnackbar:${type}"]`).click());
    expect(calls.map(([message, options]) => [message, options.type])).toEqual([
      [t('snackbar-info'), 'info'],
      [t('snackbar-success'), 'success'],
      [t('snackbar-error'), 'error'],
    ]);

    component.element.querySelector('[data-event="click:showSnackbarWithAction"]').click();
    const [message, options] = calls[3];
    expect(message).toBe(t('snackbar-deleted'));
    expect(options.actionText).toBe(t('snackbar-undo'));

    options.onAction();
    expect(calls[4]).toEqual([t('snackbar-restored'), { type: 'success' }]);
    component.destroy();
  });

  it('shows each banner variant and dismisses them all on destroy', () => {
    const component = mount();
    const banner = document.getElementById('a11y-demo-banner');
    const shown = [];
    let dismissed = 0;
    banner.show = (message, options) => shown.push([message, options.type]);
    banner.dismissAll = () => { dismissed += 1; };

    ['info', 'success', 'error'].forEach((type) => component.element.querySelector(`[data-event="click:showBanner:${type}"]`).click());
    expect(shown).toEqual([[t('banner-info'), 'info'], [t('banner-success'), 'success'], [t('banner-error'), 'error']]);

    component.destroy();
    expect(dismissed).toBe(1);
  });

  it('notifies the selected menu item, but not a disabled one', () => {
    const component = mount();
    const calls = [];
    document.getElementById('a11y-demo-snackbar').notify = (message) => calls.push(message);
    const items = [...document.getElementById('a11y-demo-dropdown').querySelectorAll('[role="menuitem"]')];
    const enabled = items.find((item) => item.getAttribute('aria-disabled') !== 'true');
    const disabled = items.find((item) => item.getAttribute('aria-disabled') === 'true');

    enabled.click();
    disabled.click();
    document.getElementById('a11y-demo-dropdown').click();
    expect(calls).toEqual([`${t('menu-selected')} ${enabled.textContent.trim()}`]);
    component.destroy();
  });

  it('shows each hidden floating example and collapses the help panel from its close button', () => {
    const component = mount();
    const ids = ['a11y-demo-floating-menu', 'a11y-demo-floating-bubble', 'a11y-demo-floating-help'];
    expect(ids.every((id) => document.getElementById(id).hidden)).toBe(true);

    ids.forEach((id) => component.element.querySelector(`[data-event="click:showFloating:${id}"]`).click());
    expect(ids.some((id) => document.getElementById(id).hidden)).toBe(false);

    const help = document.getElementById('a11y-demo-floating-help');
    let collapsed = 0;
    // The elements aren't defined under jsdom, so stand in for the upgraded element's API.
    help.collapse = () => collapsed++;
    help.querySelector('[data-a11y-demo-close]').click();
    expect(collapsed).toBe(1);
    expect(help.hasAttribute('hidden')).toBe(false);
    component.destroy();
  });

  it('removes floating elements moved to <body> when destroyed', () => {
    const component = mount();
    // What <a11y-floating> does on connect: it moves into a body-level stack.
    const stack = document.createElement('div');
    stack.className = 'a11y-floating-stack';
    document.body.appendChild(stack);
    stack.appendChild(document.getElementById('a11y-demo-floating-help'));

    component.destroy();
    expect(document.querySelector('a11y-floating')).toBeFalsy();
    stack.remove();
  });

  it('restarts the blocking loader timer when reopened before it closes', () => {
    useFakeTimers();
    try {
      const component = mount();
      const loader = document.getElementById('a11y-demo-blocking-loader');
      const button = component.element.querySelector('[data-event="click:openBlockingLoader"]');

      button.click();
      advanceTimersByTime(2000);
      button.click();
      advanceTimersByTime(2000);
      expect(loader.hasAttribute('open')).toBe(true);
      advanceTimersByTime(500);
      expect(loader.hasAttribute('open')).toBe(false);

      button.click();
      component.destroy();
    } finally {
      useRealTimers();
    }
  });
});
