import { LinkHelper } from './link.helper.js';

export interface IFocusableConfig {
  labelKey?: string;
  href?: string;
  target?: string;
  download?: string;
  callback?: () => void;
  ariaLabel?: string;
  templateFn?: (data: any) => string;
}

export class FocusableHelper {
  static isActionMode(config: IFocusableConfig): boolean {
    return !!config.callback && !config.href;
  }

  static isLinkMode(config: IFocusableConfig): boolean {
    return !!config.href;
  }

  static resolveAriaLabel(config: IFocusableConfig): string {
    const base = config.ariaLabel || config.href || '';
    if (config.target && FocusableHelper.isLinkMode(config)) {
      return LinkHelper.appendNewTabSuffix(base);
    }
    return base;
  }

  static applySemantics(element: HTMLElement, config: IFocusableConfig): void {
    const label = FocusableHelper.resolveAriaLabel(config);

    if (FocusableHelper.isActionMode(config)) {
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      if (label) element.setAttribute('aria-label', label);
    }

    if (FocusableHelper.isLinkMode(config)) {
      const el = element as HTMLAnchorElement;
      el.href = config.href!;
      if (config.target) LinkHelper.applyExternalTarget(el, config.target);
      if (config.download) el.download = config.download;
      if (label) el.setAttribute('aria-label', label);
    }
  }

  static applyEventListeners(
    element: HTMLElement,
    config: IFocusableConfig,
    eventListeners: Array<[EventTarget, string, EventListener]>,
  ): void {
    if (FocusableHelper.isActionMode(config)) {
      const click: EventListener = () => config.callback!();
      const keydown: EventListener = (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') {
          ke.preventDefault();
          config.callback!();
        }
      };
      element.addEventListener('click', click);
      element.addEventListener('keydown', keydown);
      eventListeners.push(
        [element, 'click', click],
        [element, 'keydown', keydown],
      );
    }

    if (FocusableHelper.isLinkMode(config)) {
      const spaceHandler = LinkHelper.makeInternalAnchorSpaceHandler(config.href!, () => element.click());
      if (spaceHandler) {
        element.addEventListener('keydown', spaceHandler);
        eventListeners.push([element, 'keydown', spaceHandler]);
      }

      if (config.callback) {
        const click: EventListener = () => config.callback!();
        element.addEventListener('click', click);
        eventListeners.push([element, 'click', click]);
      }
    }
  }
}
