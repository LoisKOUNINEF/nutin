import readline from 'readline';
import { promptBoolean } from './prompt-boolean.js';

describe('promptBoolean', () => {
  let createInterfaceSpy;
  let answer;

  beforeEach(() => {
    createInterfaceSpy = spyOn(readline, 'createInterface').andCallFake(() => ({
      question: (_question, callback) => callback(answer),
      close: () => {},
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
});
