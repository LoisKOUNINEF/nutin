import { A11yDemoOverlaysComponent } from '#root/dist/src/app/components/a11y-elements/a11y-demo-overlays/a11y-demo-overlays.component.js';

const OVERLAYS = [
  'a11y-modal', 'a11y-drawer', 'a11y-emergency-dialog', 'a11y-blocking-loader', 'a11y-dropdown',
  'a11y-context-menu', 'a11y-popover', 'a11y-tooltip', 'a11y-snackbar', 'a11y-notification-banner',
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
});
