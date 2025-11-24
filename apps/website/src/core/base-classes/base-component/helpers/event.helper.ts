import { BaseComponent } from '../base-component.js';
import { TokenHelper } from './token.helper.js';

export class EventHelper {
  public static bindEvents(
    component: BaseComponent, 
    element: HTMLElement, 
    eventListeners: Array<[string, EventListener]>
  ): void {
    element.querySelectorAll('[data-event]').forEach(el => {
      const parts = el.getAttribute('data-event')!.split(':');
      const [eventName, handlerName, argsString] = parts;

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
    element: HTMLElement, 
    eventListeners: Array<[string, EventListener]>
  ): void {
    eventListeners.forEach(([event, listener]) => {
      element.removeEventListener(event, listener);
    });
  }

  private static createBoundHandler(
    el: Element, 
    component: BaseComponent, 
    handler: (...args: any[]) => void, 
    rawArgs: string[]
  ): EventListener {
    return (event: Event) => {
      const resolvedArgs = rawArgs.map(arg => TokenHelper.resolve(arg.trim(), el, event));

      handler.call(component, ...resolvedArgs);
    };
  }

  private static addEvent(
    target: EventTarget, 
    event: string, 
    listener: EventListener, 
    eventListeners: Array<[string, EventListener]>
  ): void {
    target.addEventListener(event, listener);
    eventListeners.push([event, listener]);
  }
}
