import { DomHelper } from './dom.helper.js';

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

export interface PreservedState {
  focus: FocusState | null;
  scroll: ScrollState[];
  parking: HTMLElement | null;
}

// Keeps reused children's DOM state across their parent's innerHTML reassignment.
// Where Element.moveBefore() exists, children are parked outside the parent so
// they never leave the document. Otherwise they are detached, and focus,
// selection and scroll are restored once they're back in place.
export class PreservationHelper {
  public static preserve(elements: HTMLElement[]): PreservedState {
    // Parked elements keep their focus and scroll; only detached ones need restoring.
    const parking = this.park(elements);
    if (parking) return { focus: null, scroll: [], parking };

    return { focus: this.captureFocus(elements), scroll: this.captureScroll(elements), parking: null };
  }

  public static restore(state: PreservedState): void {
    state.parking?.remove();
    state.scroll.forEach(({ element, top, left }) => {
      if (!element.isConnected) return;
      if (element.scrollTop !== top) element.scrollTop = top;
      if (element.scrollLeft !== left) element.scrollLeft = left;
    });
    this.restoreFocus(state.focus);
  }

  private static captureFocus(elements: HTMLElement[]): FocusState | null {
    const active = document.activeElement;
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

  private static captureScroll(elements: HTMLElement[]): ScrollState[] {
    const scrolled: ScrollState[] = [];
    elements.forEach(root => {
      [root, ...Array.from(root.querySelectorAll('*'))].forEach(element => {
        if (element.scrollTop || element.scrollLeft) {
          scrolled.push({ element, top: element.scrollTop, left: element.scrollLeft });
        }
      });
    });
    return scrolled;
  }

  private static park(elements: HTMLElement[]): HTMLElement | null {
    const body = document.body;
    const connected = elements.filter(element => element.isConnected);
    if (!body || !connected.length || !DomHelper.canMoveBefore(body, connected[0]!)) return null;

    const parking = document.createElement('div');
    body.appendChild(parking);
    DomHelper.prepareMoveTarget(parking, connected[0]!);
    connected.forEach(element => DomHelper.moveBefore(parking, element, null));
    return parking;
  }

  private static restoreFocus(focus: FocusState | null): void {
    if (!focus || !focus.element.isConnected) return;
    const { element, selection } = focus;

    if (document.activeElement !== element) element.focus({ preventScroll: true });
    if (selection && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      element.setSelectionRange(...selection);
    }
  }
}
