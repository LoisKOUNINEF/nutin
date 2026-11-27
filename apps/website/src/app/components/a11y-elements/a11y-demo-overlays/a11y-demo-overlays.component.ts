import type { FloatingCloseReason, FloatingElement } from 'a11y-elements/overlays/floating/element';
import type { NotificationBannerElement, NotificationBannerOptions, NotificationBannerType } from 'a11y-elements/overlays/notification-banner/element';
import type { NotifyOptions, SnackbarElement, SnackbarType } from 'a11y-elements/overlays/snackbar/element';
import { Component, I18nService, Navigation, html } from '../../../../core/index.js';
import { loadConfirmDialog } from '../../../helpers/a11y-elements/load-a11y-elements.helper.js';

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
  'a11y-demo-modal-tooltip',
  'a11y-demo-banner',
  'a11y-demo-popover',
  'a11y-demo-snackbar',
  'a11y-demo-tooltip',
];

const BLOCKING_LOADER_DURATION = 2500;

type SnackbarPosition = NonNullable<NotifyOptions['position']>;
type BannerPosition = NonNullable<NotificationBannerOptions['position']>;

// Overlays are opened/closed through the `open` attribute rather than the
// property, and floating elements shown through `hidden`: it also works before
// the element's chunk has upgraded it (a property set then would shadow the
// class accessor for good). Methods are called optionally for the same reason.
// The types come from the package; these imports are type-only (erased).

export class A11yDemoOverlaysComponent extends Component {
  private overlays: HTMLElement[] = [];
  private blockingLoaderTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

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

    const modal = this.overlay('a11y-demo-modal');
    if (modal) {
      const onChange = (event: Event) => this.onModalChange(modal, event);
      modal.addEventListener('change', onChange);
      this.eventListeners.push([modal, 'change', onChange]);
    }

    // A plain callback field, kept when set before the element is upgraded.
    const help = this.overlay('a11y-demo-floating-help') as FloatingElement | null;
    if (help) help.onClose = (reason: FloatingCloseReason) => this.notify(translate(`floating-closed-${reason}`));
    super.onAfterRender();
  }

  // Portaled overlays live outside this.element, so destroy() wouldn't remove
  // them. Removing one runs its own teardown (hides it, releases focus trap
  // and scroll lock), and a later visit creates fresh ones.
  protected override onBeforeDestroy(): void {
    this.destroyed = true;
    if (this.blockingLoaderTimer) clearTimeout(this.blockingLoaderTimer);
    // Released first, so an onClose run during teardown (the banner's, from
    // dismissAll(); the help launcher's, collapsed on removal) finds no
    // snackbar to notify (no toast, no auto-dismiss timer outliving the page).
    const banner = this.banner();
    const overlays = this.overlays;
    this.overlays = [];
    banner?.dismissAll?.();
    overlays.forEach((overlay) => overlay.remove());
    // confirmDialog() creates its modal in <body>, outside OVERLAY_IDS. Left open,
    // a browser Back keeps it over the next page, which it inerts. Removing it
    // resolves it false; askConfirm's notify() then finds no snackbar.
    document.querySelectorAll('a11y-modal.a11y-confirm').forEach((modal) => modal.remove());
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

  // The modal's switch toggles non-dismissible while it's open: since 0.7.0 the
  // attribute applies live (the × button comes and goes).
  private onModalChange(modal: HTMLElement, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.matches('[data-a11y-demo-non-dismissible]')) modal.toggleAttribute('non-dismissible', input.checked);
  }

  // Resolves true only from the confirm button; every other close is false.
  private async askConfirm(): Promise<void> {
    const { confirmDialog } = await loadConfirmDialog();
    if (this.destroyed) return; // left the page while the chunk loaded
    const confirmed = await confirmDialog({
      title: translate('confirm-title'),
      message: translate('confirm-message'),
      confirmLabel: translate('confirm-confirm'),
      cancelLabel: translate('confirm-cancel'),
      danger: true,
    });
    // After a navigation away, the snackbar is gone and notify() does nothing.
    this.notify(translate(confirmed ? 'confirm-confirmed' : 'confirm-cancelled'), { type: confirmed ? 'success' : 'info' });
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

  // The position and max-stack pickers sit in this.element (not portaled). Read
  // when an item is shown, so the pick needs no state of its own.
  private selectedValue(name: string): string | undefined {
    return this.element.querySelector<HTMLSelectElement>(`select[name="${name}"]`)?.value;
  }

  private selectedPosition<T extends string>(name: string): T | undefined {
    return this.selectedValue(name) as T | undefined;
  }

  // maxStack is sticky on the region: each item shown re-applies the current pick.
  // Lowering it doesn't hide items already showing; extra ones wait in the queue.
  private selectedMaxStack(name: string): number | undefined {
    const value = Number(this.selectedValue(name));
    return value > 0 ? value : undefined;
  }

  // Every toast on the page follows the snackbar's position and max-stack
  // pickers, not only the snackbar section's own: they share one region.
  private notify(message: string, options?: NotifyOptions): void {
    const position = this.selectedPosition<SnackbarPosition>('a11y-demo-snackbar-position');
    const maxStack = this.selectedMaxStack('a11y-demo-snackbar-max-stack');
    (this.overlay('a11y-demo-snackbar') as SnackbarElement | null)?.notify?.(message, { position, maxStack, ...options });
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

  // Called however the toast goes away, timeout included. The toast it shows has
  // no onClose, so it doesn't chain. On leaving the page, the snackbar's removal
  // runs it too, but the snackbar is released by then, so it notifies nothing.
  private showSnackbarWithClose(): void {
    this.notify(translate('snackbar-closable'), {
      type: 'warning',
      onClose: () => this.notify(translate('snackbar-closed')),
    });
  }

  private banner(): NotificationBannerElement | null {
    return this.overlay('a11y-demo-banner') as NotificationBannerElement | null;
  }

  private showBannerItem(message: string, options: NotificationBannerOptions): void {
    const position = this.selectedPosition<BannerPosition>('a11y-demo-banner-position');
    const maxStack = this.selectedMaxStack('a11y-demo-banner-max-stack');
    this.banner()?.show?.(message, { position, maxStack, ...options });
  }

  private showBanner(type: NotificationBannerType): void {
    this.showBannerItem(translate(`banner-${type}`), { type });
  }

  // The action button also dismisses the item, which would call onClose too:
  // each demo sets only one of the two callbacks.
  private showBannerWithAction(): void {
    this.showBannerItem(translate('banner-update'), {
      actionText: translate('banner-reload'),
      onAction: () => this.notify(translate('banner-reloaded'), { type: 'success' }),
    });
  }

  // Called however the item goes away. On leaving the page, dismissAll() runs it
  // too, but the snackbar is released by then, so it notifies nothing.
  private showBannerWithClose(): void {
    this.showBannerItem(translate('banner-cookies'), {
      type: 'warning',
      onClose: () => this.notify(translate('banner-closed')),
    });
  }
}
