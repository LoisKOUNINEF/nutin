import * as PreservationHelper from '#root/dist/src/core/base-classes/base-component/helpers/preservation.helper.js';

describe('PreservationHelper', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    container = null;
  });

  it('restores focus and caret on an element that was detached and reattached', () => {
    const child = document.createElement('div');
    child.innerHTML = '<input value="hello">';
    container.appendChild(child);
    const input = child.querySelector('input');
    input.focus();
    input.setSelectionRange(1, 3);

    const state = PreservationHelper.preserve([child]);
    child.remove();
    container.appendChild(child);
    input.blur();
    PreservationHelper.restore(state);

    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(3);
  });

  it('ignores focus outside the preserved elements', () => {
    const child = document.createElement('div');
    const outside = document.createElement('input');
    container.append(child, outside);
    outside.focus();

    const state = PreservationHelper.preserve([child]);

    expect(state.focus).toBe(null);
  });

  it('does not restore focus on an element that is no longer in the document', () => {
    const child = document.createElement('div');
    child.innerHTML = '<input>';
    container.appendChild(child);
    child.querySelector('input').focus();

    const state = PreservationHelper.preserve([child]);
    child.remove();
    PreservationHelper.restore(state);

    expect(document.activeElement).not.toBe(child.querySelector('input'));
  });

  it('preserves nothing for no elements, without reading the document (SSR has no getSelection)', () => {
    const proto = Document.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'getSelection');
    let state;
    try {
      delete proto.getSelection;
      state = PreservationHelper.preserve([]);
      PreservationHelper.restore(state);
    } finally {
      Object.defineProperty(proto, 'getSelection', descriptor);
    }

    expect(state).toEqual({ focus: null, scroll: [], animations: [], selection: null, popovers: [], parking: null });
  });

  it('still captures the selection when there are elements to preserve', () => {
    const proto = Document.prototype;
    const original = proto.getSelection;
    let calls = 0;
    proto.getSelection = function (...args) {
      calls++;
      return original.apply(this, args);
    };
    try {
      const child = document.createElement('div');
      container.appendChild(child);
      PreservationHelper.preserve([]);
      PreservationHelper.preserve([child]);
    } finally {
      proto.getSelection = original;
    }

    expect(calls).toBe(1);
  });

  it('does not park anything when Element.moveBefore is unavailable', () => {
    const child = document.createElement('div');
    container.appendChild(child);

    const state = PreservationHelper.preserve([child]);

    expect(state.parking).toBe(null);
    expect(child.parentElement).toBe(container);
  });

  it('parks connected elements outside their parent with moveBefore and removes the parking spot on restore', () => {
    Element.prototype.moveBefore = function (node, child) {
      this.insertBefore(node, child);
    };

    try {
      const child = document.createElement('div');
      container.appendChild(child);

      const state = PreservationHelper.preserve([child]);

      expect(state.parking.contains(child)).toBe(true);
      expect(container.contains(child)).toBe(false);
      expect(document.body.contains(state.parking)).toBe(true);

      container.appendChild(child);
      PreservationHelper.restore(state);

      expect(document.body.contains(state.parking)).toBe(false);
    } finally {
      delete Element.prototype.moveBefore;
    }
  });

  it('restores the scroll position of a detached element and its descendants', () => {
    const child = document.createElement('div');
    child.innerHTML = '<div class="list"></div>';
    container.appendChild(child);
    const list = child.querySelector('.list');
    // jsdom doesn't lay out, so scroll offsets are made writable by hand.
    [child, list].forEach(element => {
      Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });
      Object.defineProperty(element, 'scrollLeft', { value: 0, writable: true });
    });
    child.scrollLeft = 5;
    list.scrollTop = 40;

    const state = PreservationHelper.preserve([child]);
    child.remove();
    child.scrollLeft = 0;
    list.scrollTop = 0;
    container.appendChild(child);
    PreservationHelper.restore(state);

    expect(state.scroll.length).toBe(2);
    expect(child.scrollLeft).toBe(5);
    expect(child.scrollTop).toBe(0);
    expect(list.scrollTop).toBe(40);
    expect(list.scrollLeft).toBe(0);
  });

  it('does not restore the scroll position of an element that is no longer in the document', () => {
    const child = document.createElement('div');
    container.appendChild(child);
    Object.defineProperty(child, 'scrollTop', { value: 30, writable: true });

    const state = PreservationHelper.preserve([child]);
    child.remove();
    child.scrollTop = 0;
    PreservationHelper.restore(state);

    expect(child.scrollTop).toBe(0);
  });

  it('restores focus without a selection on a focused element that is not a text field', () => {
    const child = document.createElement('div');
    child.innerHTML = '<button>ok</button>';
    container.appendChild(child);
    const button = child.querySelector('button');
    button.focus();

    const state = PreservationHelper.preserve([child]);
    child.remove();
    container.appendChild(child);
    PreservationHelper.restore(state);

    expect(state.focus.selection).toBe(null);
    expect(document.activeElement).toBe(button);
  });

  it('does not refocus an element that kept its focus', () => {
    const child = document.createElement('div');
    child.innerHTML = '<input value="hello">';
    container.appendChild(child);
    const input = child.querySelector('input');
    input.focus();
    let focusCalls = 0;
    input.focus = () => { focusCalls++; };

    const state = PreservationHelper.preserve([child]);
    PreservationHelper.restore(state);

    expect(focusCalls).toBe(0);
  });

  it('does not park anything when none of the elements are in the document', () => {
    Element.prototype.moveBefore = function (node, child) {
      this.insertBefore(node, child);
    };

    try {
      const child = document.createElement('div');

      const state = PreservationHelper.preserve([child]);

      expect(state.parking).toBe(null);
    } finally {
      delete Element.prototype.moveBefore;
    }
  });
  it('parks without capturing anything else when moveBefore is available', () => {
    Element.prototype.moveBefore = function (node, child) {
      this.insertBefore(node, child);
    };

    let state;
    try {
      const child = document.createElement('div');
      container.appendChild(child);

      state = PreservationHelper.preserve([child]);

      expect(state.animations).toEqual([]);
      expect(state.selection).toBe(null);
      expect(state.popovers).toEqual([]);
    } finally {
      state?.parking?.remove();
      delete Element.prototype.moveBefore;
    }
  });

  // jsdom has no Web Animations API: fake CSSAnimation objects stand in for the browser's.
  function fakeAnimation(target, animationName, currentTime, playState = 'running') {
    return {
      animationName,
      currentTime,
      playState,
      effect: { target, pseudoElement: null },
      pauseCalls: 0,
      pause() { this.pauseCalls++; },
    };
  }

  it('carries CSS animation progress over to the animations recreated on re-insertion', () => {
    const child = document.createElement('div');
    child.innerHTML = '<span></span>';
    container.appendChild(child);
    const span = child.querySelector('span');
    const before = [
      fakeAnimation(child, 'spin', 1200),
      fakeAnimation(span, 'pulse', 300, 'paused'),
      // Its animation-name changed in the meantime: nothing to carry it over to.
      fakeAnimation(span, 'fade', 800),
      fakeAnimation(span, 'idle-one', null, 'idle'),
      { currentTime: 50, playState: 'running', effect: { target: span, pseudoElement: null } },
    ];
    const after = {
      spin: fakeAnimation(child, 'spin', 0),
      pulse: fakeAnimation(span, 'pulse', 0),
      other: fakeAnimation(span, 'other', 0),
    };
    child.getAnimations = (options) => options?.subtree ? before : [after.spin];
    span.getAnimations = () => [after.other, after.pulse];

    const state = PreservationHelper.preserve([child]);
    child.remove();
    container.appendChild(child);
    PreservationHelper.restore(state);

    expect(state.animations.length).toBe(3);
    expect(after.spin.currentTime).toBe(1200);
    expect(after.spin.pauseCalls).toBe(0);
    expect(after.pulse.currentTime).toBe(300);
    expect(after.pulse.pauseCalls).toBe(1);
    expect(after.other.currentTime).toBe(0);
  });

  it('skips pseudo-element animations and animations of elements no longer in the document', () => {
    const child = document.createElement('div');
    container.appendChild(child);
    const pseudo = fakeAnimation(child, 'glow', 100);
    pseudo.effect.pseudoElement = '::before';
    const recreated = fakeAnimation(child, 'spin', 0);
    child.getAnimations = (options) => options?.subtree ? [pseudo, fakeAnimation(child, 'spin', 500)] : [recreated];

    const state = PreservationHelper.preserve([child]);
    child.remove();
    PreservationHelper.restore(state);

    expect(state.animations.length).toBe(1);
    expect(recreated.currentTime).toBe(0);
  });

  it('captures no animations where the Web Animations API is missing', () => {
    const child = document.createElement('div');
    container.appendChild(child);

    const state = PreservationHelper.preserve([child]);

    expect(state.animations).toEqual([]);
  });

  it('restores a text selection inside a detached element', () => {
    const child = document.createElement('div');
    child.innerHTML = '<p>hello world</p>';
    container.appendChild(child);
    const text = child.querySelector('p').firstChild;
    document.getSelection().setBaseAndExtent(text, 2, text, 7);

    const state = PreservationHelper.preserve([child]);
    child.remove();
    container.appendChild(child);
    document.getSelection().removeAllRanges();
    PreservationHelper.restore(state);

    const selection = document.getSelection();
    expect(selection.anchorNode).toBe(text);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(text);
    expect(selection.focusOffset).toBe(7);
    selection.removeAllRanges();
  });

  it('ignores a text selection that reaches outside the preserved elements', () => {
    const child = document.createElement('div');
    child.textContent = 'inside';
    const outside = document.createElement('p');
    outside.textContent = 'outside';
    container.append(child, outside);
    document.getSelection().setBaseAndExtent(child.firstChild, 1, outside.firstChild, 3);

    const state = PreservationHelper.preserve([child]);

    expect(state.selection).toBe(null);
    document.getSelection().removeAllRanges();
  });

  it('leaves a focused text field\'s selection to the focus state', () => {
    const child = document.createElement('div');
    child.innerHTML = '<input value="hello">';
    container.appendChild(child);
    const input = child.querySelector('input');
    input.focus();
    input.setSelectionRange(1, 3);
    document.getSelection().setBaseAndExtent(child, 0, child, 1);

    const state = PreservationHelper.preserve([child]);

    expect(state.focus.selection).toEqual([1, 3, input.selectionDirection]);
    expect(state.selection).toBe(null);
    document.getSelection().removeAllRanges();
  });

  it('does not restore a text selection whose nodes are no longer in the document', () => {
    const child = document.createElement('div');
    child.textContent = 'hello';
    container.appendChild(child);
    document.getSelection().setBaseAndExtent(child.firstChild, 0, child.firstChild, 3);

    const text = child.firstChild;

    const state = PreservationHelper.preserve([child]);
    child.remove();
    PreservationHelper.restore(state);

    // The range was moved to where the element was, and stays there.
    expect(document.getSelection().anchorNode).not.toBe(text);
    document.getSelection().removeAllRanges();
  });

  it('swallows a selection offset that no longer fits its node', () => {
    const child = document.createElement('div');
    child.textContent = 'hello';
    container.appendChild(child);
    const text = child.firstChild;
    document.getSelection().setBaseAndExtent(text, 1, text, 5);

    const state = PreservationHelper.preserve([child]);
    text.data = 'hi';

    expect(() => PreservationHelper.restore(state)).not.toThrow();
    document.getSelection().removeAllRanges();
  });

  // jsdom doesn't implement popovers: :popover-open and showPopover() are stubbed per element.
  function fakePopover(element, open) {
    element.setAttribute('popover', '');
    element.showCalls = 0;
    element.matches = (selector) => selector === ':popover-open' ? open : HTMLElement.prototype.matches.call(element, selector);
    element.showPopover = () => { element.showCalls++; open = true; };
    return { close: () => { open = false; } };
  }

  it('reopens popovers that were open before the element was detached', () => {
    const child = document.createElement('div');
    child.innerHTML = '<div class="open"></div><div class="closed"></div>';
    container.appendChild(child);
    const open = child.querySelector('.open');
    const closed = child.querySelector('.closed');
    const openPopover = fakePopover(open, true);
    fakePopover(closed, false);

    const state = PreservationHelper.preserve([child]);
    child.remove();
    openPopover.close();
    container.appendChild(child);
    PreservationHelper.restore(state);

    expect(state.popovers).toEqual([open]);
    expect(open.showCalls).toBe(1);
    expect(closed.showCalls).toBe(0);
  });

  it('does not reopen a popover that is still open or no longer in the document', () => {
    const child = document.createElement('div');
    child.innerHTML = '<div class="a"></div>';
    container.appendChild(child);
    const stillOpen = child.querySelector('.a');
    fakePopover(stillOpen, true);
    const gone = document.createElement('div');
    container.appendChild(gone);
    const gonePopover = fakePopover(gone, true);

    const state = PreservationHelper.preserve([child, gone]);
    gone.remove();
    gonePopover.close();
    PreservationHelper.restore(state);

    expect(stillOpen.showCalls).toBe(0);
    expect(gone.showCalls).toBe(0);
  });

  it('swallows a popover that refuses to show again', () => {
    const child = document.createElement('div');
    container.appendChild(child);
    const popover = fakePopover(child, true);

    const state = PreservationHelper.preserve([child]);
    popover.close();
    child.showPopover = () => { throw new Error('NotSupportedError'); };

    expect(() => PreservationHelper.restore(state)).not.toThrow();
  });

  it('captures no popovers where :popover-open is an unknown selector', () => {
    const child = document.createElement('div');
    child.setAttribute('popover', '');
    container.appendChild(child);
    child.matches = () => { throw new SyntaxError('unknown pseudo-class'); };

    const state = PreservationHelper.preserve([child]);

    expect(state.popovers).toEqual([]);
  });
});
