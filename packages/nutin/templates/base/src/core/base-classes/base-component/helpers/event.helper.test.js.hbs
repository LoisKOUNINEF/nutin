import * as EventHelper from '#root/dist/src/core/base-classes/base-component/helpers/event.helper.js';
import * as DomHelper from '#root/dist/src/core/base-classes/base-component/helpers/dom.helper.js';

describe('EventHelper', () => {
  let container;
  let eventListeners;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventListeners = [];
  });

  afterEach(() => {
    container.remove();
    container = null;
  });

  it('binds a handler resolved from data-event and calls it with `this` set to the component', () => {
    container.innerHTML = '<button data-event="click:handleClick"></button>';
    const button = container.querySelector('button');

    let calledWith = null;
    const component = {
      handleClick(...args) {
        calledWith = { self: this, args };
      },
    };

    EventHelper.bindEvents(component, container, eventListeners);
    click(button);

    expect(calledWith.self).toBe(component);
    expect(calledWith.args.length).toBe(0);
  });

  it('resolves comma-separated raw args via TokenHelper before invoking the handler', () => {
    container.innerHTML = '<button data-event="click:handleClick:1,\'hi\'" id="btn"></button>';
    const button = container.querySelector('button');

    let received = null;
    const component = {
      handleClick(...args) { received = args; },
    };

    EventHelper.bindEvents(component, container, eventListeners);
    click(button);

    expect(received[0]).toBe(1);
    expect(received[1]).toBe('hi');
  });

  it('does nothing when the handler name is missing', () => {
    container.innerHTML = '<button data-event="click:"></button>';
    const component = {};
    EventHelper.bindEvents(component, container, eventListeners);
    expect(eventListeners.length).toBe(0);
  });

  it('binds nothing and warns when the referenced handler does not exist or is not a function', () => {
    container.innerHTML = '<button data-event="click:missingHandler"></button><a data-event="click:typo"></a>';
    const component = { missingHandler: 'not-a-function' };
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      EventHelper.bindEvents(component, container, eventListeners);
      expect(eventListeners.length).toBe(0);
      expect(warnSpy.callCount).toBe(2);
      expect(warnSpy.calls[1][0]).toContain('has no method "typo"');
    } finally {
      warnSpy.restore();
    }
  });

  it('keeps commas inside quoted literal args', () => {
    container.innerHTML = `<button data-event="click:handleClick:'a,b',2,&quot;c,d&quot;"></button>`;
    const button = container.querySelector('button');

    let received = null;
    const component = {
      handleClick(...args) { received = args; },
    };

    EventHelper.bindEvents(component, container, eventListeners);
    click(button);

    expect(received).toEqual(['a,b', 2, 'c,d']);
  });

  it('tracks each bound listener in the eventListeners array', () => {
    container.innerHTML = '<button data-event="click:handleClick"></button>';
    const component = { handleClick() {} };

    EventHelper.bindEvents(component, container, eventListeners);

    expect(eventListeners.length).toBe(1);
    expect(eventListeners[0][1]).toBe('click');
  });

  it('skips data-event elements inside a nested component root, which binds its own', () => {
    container.innerHTML = '<button class="own" data-event="click:toggle"></button><div class="child"><button class="nested" data-event="click:toggle"></button></div>';
    DomHelper.markComponentRoot(container.querySelector('.child'));
    let calls = 0;
    const component = { toggle() { calls++; } };

    EventHelper.bindEvents(component, container, eventListeners);
    click(container.querySelector('.nested'));
    expect(calls).toBe(0);

    click(container.querySelector('.own'));
    expect(calls).toBe(1);
  });

  it('cancels link navigation, with or without args', () => {
    container.innerHTML = '<a href="/x" data-event="click:go"></a><a href="/y" data-event="click:go:1"></a>';
    const component = { go() {} };
    EventHelper.bindEvents(component, container, eventListeners);

    container.querySelectorAll('a').forEach((a) => {
      const ev = new window.MouseEvent('click', { bubbles: true, cancelable: true });
      a.dispatchEvent(ev);
      expect(ev.defaultPrevented).toBe(true);
    });
  });

  it('cancels form submission from a submit event or a submit button click', () => {
    container.innerHTML = '<form data-event="submit:save"><button type="submit" data-event="click:save"></button></form>';
    const component = { save() {} };
    EventHelper.bindEvents(component, container, eventListeners);

    const submit = new window.Event('submit', { bubbles: true, cancelable: true });
    container.querySelector('form').dispatchEvent(submit);
    const buttonClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    container.querySelector('button').dispatchEvent(buttonClick);

    expect(submit.defaultPrevented).toBe(true);
    expect(buttonClick.defaultPrevented).toBe(true);
  });

  it('keeps the default of other events, args or not (typing, checking a box)', () => {
    container.innerHTML = '<input class="text" data-event="keydown:onKey:@key"><input class="box" type="checkbox" data-event="click:onToggle:@checked">';
    let checked = null;
    const component = { onKey() {}, onToggle(value) { checked = value; } };
    EventHelper.bindEvents(component, container, eventListeners);

    const keydown = new window.KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    container.querySelector('.text').dispatchEvent(keydown);
    const box = container.querySelector('.box');
    const boxClick = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    box.dispatchEvent(boxClick);

    expect(keydown.defaultPrevented).toBe(false);
    expect(boxClick.defaultPrevented).toBe(false);
    expect(checked).toBe(true);
    expect(box.checked).toBe(true);
  });

  it('destroyEvents removes every tracked listener', () => {
    container.innerHTML = '<button data-event="click:handleClick"></button>';
    const button = container.querySelector('button');
    let callCount = 0;
    const component = { handleClick() { callCount++; } };

    EventHelper.bindEvents(component, container, eventListeners);
    EventHelper.destroyEvents(eventListeners);

    click(button);
    expect(callCount).toBe(0);
  });
});
