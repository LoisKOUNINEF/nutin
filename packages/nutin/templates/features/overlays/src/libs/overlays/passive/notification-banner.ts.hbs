import { Lifecycle } from '../../../core/index.js';
import { SecurityHelper } from '../../../core/base-classes/base-component/helpers/security.helper.js';
import { PassiveOverlayRuntime, PassiveOverlayItem } from '../core/passive-overlay-runtime.js';

export type NotificationBannerOptions = {
  type?: 'info' | 'success' | 'error';
  position?: 'top' | 'bottom';
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
};

type NotificationBannerItem = PassiveOverlayItem & {
  type?: 'info' | 'success' | 'error';
  onClose?: () => void;
};

class NotificationBanner extends PassiveOverlayRuntime<NotificationBannerItem> {
  private _topContainer: HTMLElement;
  private _bottomContainer: HTMLElement;
  private _active: Array<{ el: HTMLElement; onClose?: () => void }> = [];

  constructor() {
    super();
    this.element.classList.add('notification-banner-region');

    this._topContainer = document.createElement('div');
    this._topContainer.className = 'notification-banner-region__top';

    this._bottomContainer = document.createElement('div');
    this._bottomContainer.className = 'notification-banner-region__bottom';

    this.element.appendChild(this._topContainer);
    this.element.appendChild(this._bottomContainer);

    // Unlike Snackbar (page-agnostic — a toast finishes its own timer regardless
    // of navigation), a banner is tied to the page that raised it: it must not
    // outlive that page, so any navigation force-dismisses whatever is showing.
    Lifecycle.onViewUnmount(() => this._dismissForNavigation());
  }

  public show(message: string, options: NotificationBannerOptions = {}): void {
    this.enqueue({
      message,
      type: options.type,
      position: options.position,
      actionText: options.actionText,
      onAction: options.onAction,
      onClose: options.onClose,
    });
  }

  protected _showItem(item: NotificationBannerItem): void {
    const type = item.type ?? 'info';
    const position = item.position ?? 'top';
    const container = position === 'top' ? this._topContainer : this._bottomContainer;

    const message = SecurityHelper.sanitizeTemplate(item.message);
    const actionText = item.actionText
      ? SecurityHelper.sanitizeTemplate(item.actionText)
      : undefined;

    const el = document.createElement('div');
    el.className = `app-notification-banner app-notification-banner--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    el.innerHTML = `
      <span class="app-notification-banner__message">${message}</span>
      <span class="app-notification-banner__actions">
        ${actionText ? `<button type="button" class="app-notification-banner__action">${actionText}</button>` : ''}
        <button type="button" class="app-notification-banner__close" aria-label="Dismiss">&times;</button>
      </span>
    `;

    container.appendChild(el);

    const entry = { el, onClose: item.onClose };
    this._active.push(entry);

    const dismiss = () => {
      el.remove();
      this._active = this._active.filter(a => a !== entry);
      item.onClose?.();
      this._onItemDismissed();
    };

    if (actionText && item.onAction) {
      const actionBtn = el.querySelector<HTMLButtonElement>('.app-notification-banner__action');
      actionBtn?.addEventListener('click', () => {
        item.onAction?.();
        dismiss();
      });
    }

    el.querySelector<HTMLButtonElement>('.app-notification-banner__close')?.addEventListener('click', dismiss);
  }

  private _dismissForNavigation(): void {
    this._queue = [];
    const toClose = this._active;
    this._active = [];
    this._activeCount = 0;
    toClose.forEach(({ el, onClose }) => {
      el.remove();
      onClose?.();
    });
  }
}

const notificationBanner = new NotificationBanner();

export function showNotificationBanner(message: string, options: NotificationBannerOptions = {}): void {
  notificationBanner.show(message, options);
}
