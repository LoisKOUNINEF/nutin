import type { FloatingElement } from 'a11y-elements/overlays/floating/element';
import type { NotificationBannerElement, NotificationBannerType } from 'a11y-elements/overlays/notification-banner/element';
import type { NotifyOptions, SnackbarElement, SnackbarType } from 'a11y-elements/overlays/snackbar/element';
import { Component, I18nService, Navigation, html } from '../../../../core/index.js';

// Every overlay portals itself to <body> as soon as its chunk defines it
// — possibly during this component's own render, before data-i18n/data-event
// hydration runs. So text inside an overlay is interpolated here, clicks
// inside one are handled by delegation (see onAfterRender), and overlays are
// looked up by id in the whole document rather than in this.element.
const translate = (key: string) => I18nService.translate(`a11y-demo-overlays.${key}`);

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

// In page order.
const OVERLAY_IDS = [
  'a11y-demo-blocking-loader',
  'a11y-demo-context-menu',
  'a11y-demo-drawer-left',
  'a11y-demo-drawer-right',
  'a11y-demo-dropdown',
  'a11y-demo-emergency',
  'a11y-demo-floating-menu',
  'a11y-demo-floating-bubble',
  'a11y-demo-floating-help',
  'a11y-demo-modal',
  'a11y-demo-banner',
  'a11y-demo-popover',
  'a11y-demo-snackbar',
  'a11y-demo-tooltip',
];

const BLOCKING_LOADER_DURATION = 2500;

// Overlays are opened/closed through the `open` attribute rather than the
// property, and floating elements shown through `hidden`: it also works before
// the element's chunk has upgraded it (a property set then would shadow the
// class accessor for good). Methods are called optionally for the same reason.
// The types come from the package; these imports are type-only (erased).

export class A11yDemoOverlaysComponent extends Component {
  private overlays: HTMLElement[] = [];
  private blockingLoaderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  protected override onAfterRender(): void {
    this.overlays = OVERLAY_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    for (const overlay of this.overlays) {
      const onClick = (event: Event) => this.onOverlayClick(overlay, event);
      overlay.addEventListener('click', onClick);
      this.eventListeners.push([overlay, 'click', onClick]);
    }
    super.onAfterRender();
  }

  // Portaled overlays live outside this.element, so destroy() wouldn't remove
  // them. Removing one runs its own teardown (hides it, releases focus trap
  // and scroll lock), and a later visit creates fresh ones.
  protected override onBeforeDestroy(): void {
    if (this.blockingLoaderTimer) clearTimeout(this.blockingLoaderTimer);
    (this.overlay('a11y-demo-banner') as NotificationBannerElement | null)?.dismissAll?.();
    this.overlays.forEach((overlay) => overlay.remove());
    this.overlays = [];
    super.onBeforeDestroy();
  }

  private overlay(id: string): HTMLElement | null {
    return this.overlays.find((el) => el.id === id) ?? null;
  }

  private onOverlayClick(overlay: HTMLElement, event: Event): void {
    const target = event.target as HTMLElement;

    if (target.closest('[data-a11y-demo-close]')) {
      // <a11y-floating> has no `open`: its panel collapses instead.
      if (overlay.localName === 'a11y-floating') (overlay as FloatingElement).collapse?.();
      else overlay.removeAttribute('open');
      return;
    }

    const item = target.closest('[role="menuitem"]');
    if (item && item.getAttribute('aria-disabled') !== 'true') this.notify(`${translate('menu-selected')} ${item.textContent?.trim() ?? ''}`);
  }

  private _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }

  private openOverlay(id: string): void {
    this.overlay(id)?.setAttribute('open', '');
  }

  private toggleOverlay(id: string): void {
    this.overlay(id)?.toggleAttribute('open');
  }

  // Visible by default, so the demo ones start `hidden`.
  private showFloating(id: string): void {
    this.overlay(id)?.removeAttribute('hidden');
  }

  private openBlockingLoader(): void {
    this.openOverlay('a11y-demo-blocking-loader');
    if (this.blockingLoaderTimer) clearTimeout(this.blockingLoaderTimer);
    this.blockingLoaderTimer = setTimeout(() => {
      this.blockingLoaderTimer = null;
      this.overlay('a11y-demo-blocking-loader')?.removeAttribute('open');
    }, BLOCKING_LOADER_DURATION);
  }

  private notify(message: string, options?: NotifyOptions): void {
    (this.overlay('a11y-demo-snackbar') as SnackbarElement | null)?.notify?.(message, options);
  }

  private showSnackbar(type: SnackbarType): void {
    this.notify(translate(`snackbar-${type}`), { type });
  }

  private showSnackbarWithAction(): void {
    this.notify(translate('snackbar-deleted'), {
      actionText: translate('snackbar-undo'),
      onAction: () => this.notify(translate('snackbar-restored'), { type: 'success' }),
    });
  }

  private showBanner(type: NotificationBannerType): void {
    (this.overlay('a11y-demo-banner') as NotificationBannerElement | null)?.show?.(translate(`banner-${type}`), { type });
  }
}
