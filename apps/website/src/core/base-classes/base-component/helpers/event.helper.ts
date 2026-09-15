import { BaseComponent } from '../base-component.js';
import { TokenHelper } from './token.helper.js';

export class EventHelper {
  public static bindEvents(
    component: BaseComponent,
    element: HTMLElement,
    eventListeners: Array<[EventTarget, string, EventListener]>
  ): void {
    element.querySelectorAll('[data-event]').forEach(el => {
      const [eventName, handlerName, ...argParts] = el.getAttribute('data-event')!.split(':');
      const argsString = argParts.length ? argParts.join(':') : '';

      if (!handlerName || !eventName) return;

      const handler = (component as any)[handlerName];

      if (typeof handler === 'function') {
        const rawArgs = argsString ? argsString.split(',') : [];
        const boundHandler = this.createBoundHandler(el, component, handler, rawArgs);
        this.addEvent(el, eventName, boundHandler, eventListeners);
      }
    });
  }

  public static destroyEvents(
    eventListeners: Array<[EventTarget, string, EventListener]>
  ): void {
    eventListeners.forEach(([target, event, listener]) => {
      target.removeEventListener(event, listener);
    });
  }

  private static createBoundHandler(
    el: Element,
    component: BaseComponent,
    handler: (...args: any[]) => void,
    rawArgs: string[]
  ): EventListener {
    return (event: Event) => {
      if (this.isModifiedAnchorClick(el, event)) return;

      const resolvedArgs = rawArgs.map(arg => TokenHelper.resolve(arg.trim(), el, event));

      handler.call(component, ...resolvedArgs);
    };
  }

  // Lets a real <a href> fall through to native browser behavior (open in new tab, etc.)
  // on a modified or non-primary click, instead of always intercepting via preventDefault.
  private static isModifiedAnchorClick(el: Element, event: Event): boolean {
    if (event.type !== 'click' || el.tagName !== 'A' || !el.getAttribute('href')) return false;

    const mouseEvent = event as MouseEvent;
    return mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.shiftKey || mouseEvent.altKey || mouseEvent.button !== 0;
  }

  private static addEvent(
    target: EventTarget,
    event: string,
    listener: EventListener,
    eventListeners: Array<[EventTarget, string, EventListener]>
  ): void {
    target.addEventListener(event, listener);
    eventListeners.push([target, event, listener]);
  }
}
