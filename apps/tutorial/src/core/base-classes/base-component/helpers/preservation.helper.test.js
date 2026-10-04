import { PreservationHelper } from '#root/dist/src/core/base-classes/base-component/helpers/preservation.helper.js';

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
});
