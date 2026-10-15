import type { BaseComponent } from '../base-component.js';
import * as DomHelper from './dom.helper.js';
import * as TokenHelper from './token.helper.js';

export function bindEvents(
  component: BaseComponent,
  element: HTMLElement,
  eventListeners: Array<[EventTarget, string, EventListener]>
): void {
  element.querySelectorAll('[data-event]').forEach(el => {
    // A nested component binds its own data-event elements to its own methods.
    if (DomHelper.isInsideNestedComponent(el, element)) return;

    const [eventName, handlerName, ...argParts] = el.getAttribute('data-event')!.split(':');
    const argsString = argParts.length ? argParts.join(':') : '';

    if (!handlerName || !eventName) return;

    const handler = (component as any)[handlerName];

    if (typeof handler !== 'function') {
      // TypeScript builds already fail on a handler the class doesn't have (see handler-refs.js).
      console.warn(`data-event="${el.getAttribute('data-event')}": ${component.constructor.name} has no method "${handlerName}".`);
      return;
    }

    const rawArgs = argsString ? splitArgs(argsString) : [];
    const boundHandler = createBoundHandler(el, component, handler, rawArgs);
    addEvent(el, eventName, boundHandler, eventListeners);
  });
}

// Splits data-event args on commas, except inside a quoted literal ('a,b' or "a,b").
function splitArgs(argsString: string): string[] {
  const args: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (const ch of argsString) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ',') {
      args.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  args.push(current);
  return args;
}

export function destroyEvents(
  eventListeners: Array<[EventTarget, string, EventListener]>
): void {
  eventListeners.forEach(([target, event, listener]) => {
    target.removeEventListener(event, listener);
  });
}

function createBoundHandler(
  el: Element,
  component: BaseComponent,
  handler: (...args: any[]) => void,
  rawArgs: string[]
): EventListener {
  return (event: Event) => {
    if (isModifiedAnchorClick(el, event)) return;
    if (isNavigationDefault(el, event)) event.preventDefault();

    const resolvedArgs = rawArgs.map(arg => TokenHelper.resolve(arg.trim(), el, event));

    handler.call(component, ...resolvedArgs);
  };
}

// Lets a real <a href> fall through to native browser behavior (open in new tab, etc.)
// on a modified or non-primary click, instead of always intercepting via preventDefault.
function isModifiedAnchorClick(el: Element, event: Event): boolean {
  if (event.type !== 'click' || el.tagName !== 'A' || !el.getAttribute('href')) return false;

  const mouseEvent = event as MouseEvent;
  return mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.shiftKey || mouseEvent.altKey || mouseEvent.button !== 0;
}

// Only the defaults that would leave the page are cancelled: following a link and
// submitting a form. Everything else (typing, checking a box, ...) keeps its default.
function isNavigationDefault(el: Element, event: Event): boolean {
  if (event.type === 'submit') return true;
  if (event.type !== 'click') return false;
  if (el.tagName === 'A') return el.hasAttribute('href');
  return (el instanceof HTMLButtonElement || el instanceof HTMLInputElement)
    && el.type === 'submit'
    && el.form !== null;
}

function addEvent(
  target: EventTarget,
  event: string,
  listener: EventListener,
  eventListeners: Array<[EventTarget, string, EventListener]>
): void {
  target.addEventListener(event, listener);
  eventListeners.push([target, event, listener]);
}
