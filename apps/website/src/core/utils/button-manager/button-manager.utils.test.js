import { ButtonManager } from '#root/dist/src/core/index.js';

describe('ButtonManager', () => {
  it('should initialize with default options', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    
    expect(manager.component).toBe(mockComponent);
    expect(manager.buttons.length).toBe(0);
    expect(manager.containerOptions.containerClassName).toBe('dynamic-buttons');
  });

  it('should initialize with custom options', () => {
    const mockComponent = {};
    const buttons = [{ i18nKey: 'test' }];
    const options = { 
      containerClassName: 'custom-container',
      buttonClassName: 'custom-button'
    };
    
    const manager = new ButtonManager(mockComponent, buttons, options);
    
    expect(manager.buttons.length).toBe(1);
    expect(manager.containerOptions.containerClassName).toBe('custom-container');
    expect(manager.containerOptions.buttonClassName).toBe('custom-button');
  });

  it('should return null for empty buttons array', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent, []);
    
    const container = manager.createButtonContainer();
    expect(container).toBeUndefined();
  });

  it('should return null for undefined buttons', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    
    const container = manager.createButtonContainer();
    expect(container).toBeUndefined();
  });

  it('should create container with correct class name', () => {
    const mockComponent = {};
    const buttons = [{ i18nKey: 'test' }];
    const manager = new ButtonManager(mockComponent, buttons);
    
    const container = manager.createButtonContainer();
    
    expect(container).toBeDefined();
    expect(container.className).toBe('dynamic-buttons');
  });

  it('should create container with custom class name', () => {
    const mockComponent = {};
    const buttons = [{ i18nKey: 'test' }];
    const options = { containerClassName: 'my-buttons' };
    const manager = new ButtonManager(mockComponent, buttons, options);
    
    const container = manager.createButtonContainer();
    
    expect(container.className).toBe('my-buttons');
  });

  it('should create correct number of buttons', () => {
    const mockComponent = {};
    const buttons = [
      { i18nKey: 'button1' },
      { i18nKey: 'button2' },
      { i18nKey: 'button3' }
    ];
    const manager = new ButtonManager(mockComponent, buttons);
    
    const container = manager.createButtonContainer();
    
    expect(container.children.length).toBe(3);
  });

  it('should create button with i18nKey as text', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    const btn = { i18nKey: 'save' };
    
    const button = manager.createButton(btn, 0);
    
    expect(button.getAttribute('data-i18n')).toBe('save');
  });

  it('should prioritize textContent over i18nKey', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    const btn = { 
      i18nKey: 'save',
      textContent: 'Save Document'
    };
    
    const button = manager.createButton(btn, 0);
    
    expect(button.textContent).toBe('Save Document');
    expect(button.getAttribute('data-i18n')).toBe('save');
  });

  it('should set button className correctly', () => {
    const mockComponent = {};    
    const manager = new ButtonManager(mockComponent, []);
    const btn = { 
      i18nKey: 'save',
      className: 'btn-primary'
    };
    
    const button = manager.createButton(btn, 0);
    
    expect(button.className).toBe('btn-primary');
  });

  it('should set data-event attribute correctly', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    const btn = { i18nKey: 'save' };
    
    const button = manager.createButton(btn, 2);
    
    expect(button.getAttribute('data-event')).toBe('click:onButtonClick_2');
  });

  it('should bind callback method to component', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    const btn = { 
      i18nKey: 'test',
      callback: () => 'called'
    };
    
    manager.bindButtonCallback(btn, 1);
    
    expect(typeof mockComponent.onButtonClick_1).toBe('function')
  });

  it('should execute callback when bound method is called', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    let callbackExecuted = false;
    const btn = { 
      i18nKey: 'test',
      callback: () => { callbackExecuted = true; }
    };
    
    manager.bindButtonCallback(btn, 0);
    mockComponent.onButtonClick_0();
    
    expect(callbackExecuted).toBe(true);
  });

  it('should append button container to target element', () => {
    const mockComponent = {};
    const buttons = [{ i18nKey: 'test' }];
    const manager = new ButtonManager(mockComponent, buttons);
    const target = document.createElement('div');
    
    manager.appendTo(target);
    
    expect(target.children.length).toBe(1);
    expect(target.children[0].className).toBe('dynamic-buttons')
  });

  it('should not append anything for empty buttons', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent, []);
    const target = document.createElement('div');
    
    manager.appendTo(target);
    
    expect(target.children.length).toBe(0);
  });

  it('should create complete button setup end-to-end', () => {
    const mockComponent = {};
    let button1Clicked = false;
    let button2Clicked = false;
    
    const buttons = [
      {
        i18nKey: 'save',
        className: 'btn-primary',
        callback: () => { button1Clicked = true; }
      },
      {
        i18nKey: 'cancel',
        textContent: 'Cancel Action',
        className: 'btn-secondary',
        callback: () => { button2Clicked = true; }
      }
    ];
    
    const manager = new ButtonManager(mockComponent, buttons, {
      containerClassName: 'form-buttons'
    });
    
    const container = manager.createButtonContainer();
    
    expect(container.className).toBe('form-buttons');
    expect(container.children.length).toBe(2);
    
    const firstButton = container.children[0];
    expect(firstButton.className).toBe('btn-primary');
    expect(firstButton.getAttribute('data-event')).toBe('click:onButtonClick_0');

    const secondButton = container.children[1];
    expect(secondButton.className).toBe('btn-secondary');
    expect(secondButton.getAttribute('data-event')).toBe('click:onButtonClick_1');

    mockComponent.onButtonClick_0();
    mockComponent.onButtonClick_1();
    
    expect(button1Clicked).toBe(true);
    expect(button2Clicked).toBe(true);
  });

  it('should handle button with empty i18nKey', () => {
    const mockComponent = {};
    const manager = new ButtonManager(mockComponent);
    const btn = { i18nKey: '' };
    
    const button = manager.createButton(btn, 0);
    
    expect(button.textContent).toBe('');
    expect(button.getAttribute('data-i18n')).toBe(null);
  });

  it('should handle updateButtons method', () => {
    const mockComponent = {};
    const initialButtons = [{ i18nKey: 'initial' }];
    const manager = new ButtonManager(mockComponent, initialButtons);
    
    const newButtons = [{ i18nKey: 'new1' }, { i18nKey: 'new2' }];
    manager.updateButtons(newButtons);
    
    expect(manager.buttons.length).toBe(2);
    expect(manager.buttons[0].i18nKey).toBe('new1');
    expect(manager.buttons[1].i18nKey).toBe('new2');
  });
})
