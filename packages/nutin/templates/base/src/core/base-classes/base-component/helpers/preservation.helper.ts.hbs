import * as SafeDom from './safe-dom.helper.js';
import * as DomHelper from './dom.helper.js';

type SelectionDirection = 'forward' | 'backward' | 'none';

interface FocusState {
  element: HTMLElement;
  selection: [number, number, SelectionDirection] | null;
}

interface ScrollState {
  element: Element;
  top: number;
  left: number;
}

interface AnimationState {
  element: Element;
  name: string;
  currentTime: CSSNumberish;
  paused: boolean;
}

interface SelectionState {
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
}

export interface PreservedState {
  focus: FocusState | null;
  scroll: ScrollState[];
  animations: AnimationState[];
  selection: SelectionState | null;
  popovers: HTMLElement[];
  parking: HTMLElement | null;
}

// Keeps reused children's DOM state across their parent's innerHTML reassignment.
// Where Element.moveBefore() exists, children are parked outside the parent so they never leave the document.
// Otherwise (Safari) they are detached:
// - focus, caret, text selection, scroll, CSS animation progress and open popovers are
// - restored once they're back in place.
// - Iframes, custom element callbacks and transitions can't be: only moveBefore() keeps those.
export function preserve(elements: HTMLElement[]): PreservedState {
  // No kept children (most renders, and every first render): nothing to capture. This also keeps
  // document.getSelection() and the other reads out of renders that keep nothing, like SSR's.
  if (!elements.length) return untouched(null);
  // Parked elements keep all their state; only detached ones need restoring.
  const parking = park(elements);
  if (parking) return untouched(parking);

  const focus = captureFocus(elements);
  return {
    focus,
    scroll: captureScroll(elements),
    animations: captureAnimations(elements),
    // A text field's own selection is in `focus`; the document's would point next to it.
    selection: focus?.selection ? null : captureSelection(elements),
    popovers: capturePopovers(elements),
    parking: null,
  };
}

function untouched(parking: HTMLElement | null): PreservedState {
  return { focus: null, scroll: [], animations: [], selection: null, popovers: [], parking };
}

export function restore(state: PreservedState): void {
  state.parking?.remove();
  state.scroll.forEach(({ element, top, left }) => {
    if (!element.isConnected) return;
    const current = SafeDom.scrollOf(element);
    if (current.top !== top) SafeDom.assign(element, 'scrollTop', top);
    if (current.left !== left) SafeDom.assign(element, 'scrollLeft', left);
  });
  restoreAnimations(state.animations);
  // Before focus: showing a popover can move focus into it (autofocus).
  restorePopovers(state.popovers);
  restoreFocus(state.focus);
  // After focus: focusing a contenteditable moves the caret to its start.
  restoreSelection(state.selection);
}

function captureFocus(elements: HTMLElement[]): FocusState | null {
  const active = SafeDom.prop<Element | null>(document, 'activeElement');
  if (!(active instanceof HTMLElement)) return null;
  if (!elements.some(element => element.contains(active))) return null;

  const hasSelection = (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)
    && active.selectionStart !== null
    && active.selectionEnd !== null;

  return {
    element: active,
    selection: hasSelection
      ? [active.selectionStart!, active.selectionEnd!, active.selectionDirection ?? 'none']
      : null,
  };
}

function captureScroll(elements: HTMLElement[]): ScrollState[] {
  const scrolled: ScrollState[] = [];
  elements.forEach(root => {
    [root, ...SafeDom.querySelectorAllOf(root, '*')].forEach(element => {
      const { top, left } = SafeDom.scrollOf(element);
      if (top || left) scrolled.push({ element, top, left });
    });
  });
  return scrolled;
}

// Re-inserted elements get new CSSAnimation objects that start from 0;
// their progress is copied over by animation name. Transitions aren't recreated at all.
function captureAnimations(elements: HTMLElement[]): AnimationState[] {
  const captured: AnimationState[] = [];
  elements.forEach(root => {
    if (typeof root.getAnimations !== 'function') return;
    root.getAnimations({ subtree: true }).forEach(animation => {
      const effect = animation.effect as KeyframeEffect | null;
      const element = effect?.target;
      if (!('animationName' in animation) || !effect || !element || effect.pseudoElement) return;
      if (animation.playState === 'idle' || animation.currentTime === null) return;
      captured.push({
        element,
        name: (animation as CSSAnimation).animationName,
        currentTime: animation.currentTime,
        paused: animation.playState === 'paused',
      });
    });
  });
  return captured;
}

function restoreAnimations(animations: AnimationState[]): void {
  // Same element and name: matched in order, for an element running one animation twice.
  const used = new Set<Animation>();
  animations.forEach(({ element, name, currentTime, paused }) => {
    if (!element.isConnected) return;
    const match = element.getAnimations().find(animation =>
      !used.has(animation) && (animation as Partial<CSSAnimation>).animationName === name
    );
    if (!match) return;
    used.add(match);
    match.currentTime = currentTime;
    if (paused) match.pause();
  });
}

// A selection in plain or contenteditable text is dropped when its nodes leave the document.
function captureSelection(elements: HTMLElement[]): SelectionState | null {
  const selection = SafeDom.invoke<Selection | null>(document, 'getSelection');
  if (!selection || !selection.rangeCount) return null;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  const isKept = (node: Node | null): node is Node => !!node && elements.some(element => element.contains(node));
  if (!isKept(anchorNode) || !isKept(focusNode)) return null;
  return { anchorNode, anchorOffset, focusNode, focusOffset };
}

function restoreSelection(state: SelectionState | null): void {
  if (!state || !state.anchorNode.isConnected || !state.focusNode.isConnected) return;
  const selection = SafeDom.invoke<Selection | null>(document, 'getSelection');
  try {
    selection?.setBaseAndExtent(state.anchorNode, state.anchorOffset, state.focusNode, state.focusOffset);
  } catch {
    // An offset past the end of a node whose content changed in the meantime.
  }
}

// A popover closes when it leaves the document.
function capturePopovers(elements: HTMLElement[]): HTMLElement[] {
  try {
    return elements.flatMap(root => [root, ...SafeDom.querySelectorAllOf<HTMLElement>(root, '[popover]')])
      .filter(element => element.matches(':popover-open'));
  } catch {
    // An engine without popovers doesn't know the :popover-open selector.
    return [];
  }
}

function restorePopovers(popovers: HTMLElement[]): void {
  popovers.forEach(popover => {
    if (!popover.isConnected) return;
    try {
      if (!popover.matches(':popover-open')) popover.showPopover();
    } catch {
      // No longer a popover (its attribute was removed), or showing it was refused.
    }
  });
}

function park(elements: HTMLElement[]): HTMLElement | null {
  const body = SafeDom.prop<HTMLElement | null>(document, 'body');
  const connected = elements.filter(element => element.isConnected);
  if (!body || !connected.length || !DomHelper.canMoveBefore(body, connected[0]!)) return null;

  const parking = SafeDom.createElementIn(document, 'div');
  body.appendChild(parking);
  DomHelper.prepareMoveTarget(parking, connected[0]!);
  connected.forEach(element => DomHelper.moveBefore(parking, element, null));
  return parking;
}

function restoreFocus(focus: FocusState | null): void {
  if (!focus || !focus.element.isConnected) return;
  const { element, selection } = focus;

  if (SafeDom.prop<Element | null>(document, 'activeElement') !== element) element.focus({ preventScroll: true });
  if (selection && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    element.setSelectionRange(...selection);
  }
}
