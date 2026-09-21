import { EventHelper } from '#root/dist/src/core/base-classes/base-component/helpers/event.helper.js';

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

  it('does nothing when the referenced handler does not exist or is not a function', () => {
    container.innerHTML = '<button data-event="click:missingHandler"></button>';
    const component = { missingHandler: 'not-a-function' };
    EventHelper.bindEvents(component, container, eventListeners);
    expect(eventListeners.length).toBe(0);
  });

  it('tracks each bound listener in the eventListeners array', () => {
    container.innerHTML = '<button data-event="click:handleClick"></button>';
    const component = { handleClick() {} };

    EventHelper.bindEvents(component, container, eventListeners);

    expect(eventListeners.length).toBe(1);
    expect(eventListeners[0][1]).toBe('click');
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
