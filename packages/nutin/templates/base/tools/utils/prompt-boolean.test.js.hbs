import readline from 'readline';
import { promptBoolean } from './prompt-boolean.js';

describe('promptBoolean', () => {
  let createInterfaceSpy;
  let answer;

  beforeEach(() => {
    createInterfaceSpy = spyOn(readline, 'createInterface').andCallFake(() => ({
      question: (_question, callback) => callback(answer),
      close: () => {},
      on: () => {},
    }));
  });

  afterEach(() => {
    createInterfaceSpy.restore();
  });

  it('resolves true for "y"', async () => {
    answer = 'y';
    expect(await promptBoolean('continue?')).toBe(true);
  });

  it('resolves true for "yes", case-insensitively', async () => {
    answer = 'YES';
    expect(await promptBoolean('continue?')).toBe(true);
  });

  it('resolves false for "n"', async () => {
    answer = 'n';
    expect(await promptBoolean('continue?')).toBe(false);
  });

  it('resolves false for anything else', async () => {
    answer = 'maybe';
    expect(await promptBoolean('continue?')).toBe(false);
  });

  it('resolves false instead of hanging if stdin closes before an answer', async () => {
    createInterfaceSpy.restore();
    let closeHandler;
    createInterfaceSpy = spyOn(readline, 'createInterface').andCallFake(() => ({
      question: () => {},
      close: () => {},
      on: (event, handler) => { if (event === 'close') closeHandler = handler; },
    }));

    const resultPromise = promptBoolean('continue?');
    closeHandler();

    expect(await resultPromise).toBe(false);
  });
});
