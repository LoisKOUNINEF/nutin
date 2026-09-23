import { Component, I18nService, Navigation } from '../../../../core/index.js';

// Every overlay portals itself to <body> as soon as its CDN bundle defines it
// — possibly during this component's own render, before data-i18n/data-event
// hydration runs. So text inside an overlay is interpolated here, clicks
// inside one are handled by delegation (see onAfterRender), and overlays are
// looked up by id in the whole document rather than in this.element.
const t = (key: string) => I18nService.translate(`a11y-demo-overlays.${key}`);

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

const OVERLAY_IDS = [
  'a11y-demo-modal',
  'a11y-demo-drawer-left',
  'a11y-demo-drawer-right',
  'a11y-demo-emergency',
  'a11y-demo-blocking-loader',
  'a11y-demo-dropdown',
  'a11y-demo-context-menu',
  'a11y-demo-popover',
  'a11y-demo-tooltip',
  'a11y-demo-snackbar',
  'a11y-demo-banner',
];

const BLOCKING_LOADER_DURATION = 2500;

// Structural types for the a11y-elements APIs used here: the elements come
// from zero-build CDN bundles, so there are no package types to import.
// Overlays are opened/closed through the `open` attribute rather than the
// property: it also works before the element's bundle has upgraded it (a
// property set then would shadow the class accessor for good).
type Snackbar = HTMLElement & {
  notify(message: string, options?: { type?: string; actionText?: string; onAction?: () => void }): void;
};
type NotificationBanner = HTMLElement & {
  show(message: string, options?: { type?: string }): void;
  dismissAll(): void;
};

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
    (this.overlay('a11y-demo-banner') as NotificationBanner | null)?.dismissAll?.();
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
      overlay.removeAttribute('open');
      return;
    }

    const item = target.closest('[role="menuitem"]');
    if (item && item.getAttribute('aria-disabled') !== 'true') this.notify(`${t('menu-selected')} ${item.textContent?.trim() ?? ''}`);
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

  private openBlockingLoader(): void {
    this.openOverlay('a11y-demo-blocking-loader');
    if (this.blockingLoaderTimer) clearTimeout(this.blockingLoaderTimer);
    this.blockingLoaderTimer = setTimeout(() => {
      this.blockingLoaderTimer = null;
      this.overlay('a11y-demo-blocking-loader')?.removeAttribute('open');
    }, BLOCKING_LOADER_DURATION);
  }

  private notify(message: string, options?: Parameters<Snackbar['notify']>[1]): void {
    (this.overlay('a11y-demo-snackbar') as Snackbar | null)?.notify?.(message, options);
  }

  private showSnackbar(type: string): void {
    this.notify(t(`snackbar-${type}`), { type });
  }

  private showSnackbarWithAction(): void {
    this.notify(t('snackbar-deleted'), {
      actionText: t('snackbar-undo'),
      onAction: () => this.notify(t('snackbar-restored'), { type: 'success' }),
    });
  }

  private showBanner(type: string): void {
    (this.overlay('a11y-demo-banner') as NotificationBanner | null)?.show?.(t(`banner-${type}`), { type });
  }
}
