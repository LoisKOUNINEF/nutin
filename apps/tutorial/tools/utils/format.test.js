import { getLastWord, capitalized, kebabCased, camelCased, pascalCased, allFormats } from './format.js';

describe('format', () => {
  it('getLastWord returns the last non-empty path segment', () => {
    expect(getLastWord('a/b/c')).toBe('c');
    expect(getLastWord('a/b/c/')).toBe('c');
    expect(getLastWord('single')).toBe('single');
  });

  it('getLastWord returns an empty string for non-string input', () => {
    expect(getLastWord(123)).toBe('');
    expect(getLastWord(undefined)).toBe('');
  });

  it('capitalized title-cases each word and strips commas', () => {
    expect(capitalized('hello world')).toBe('Hello World');
    expect(capitalized('HELLO, WORLd')).toBe('Hello World');
  });

  it('kebabCased splits on capital letters', () => {
    expect(kebabCased('HelloWorld')).toBe('hello-world');
    // leading lowercase run isn't matched by the [A-Z][a-z]* regex, so it
    // sticks to the next captured word instead of being split off on its own
    expect(kebabCased('myComponentName')).toBe('mycomponent-name');
  });

  it('camelCased joins kebab-case segments with an initial lowercase', () => {
    expect(camelCased('my-component-name')).toBe('myComponentName');
    expect(camelCased('single')).toBe('single');
  });

  it('pascalCased joins kebab-case segments with every segment capitalized', () => {
    expect(pascalCased('my-component-name')).toBe('MyComponentName');
    expect(pascalCased('single')).toBe('Single');
  });

  it('allFormats returns all four casings for the same input', () => {
    expect(allFormats('my-component')).toEqual({
      kebab: 'my-component',
      pascal: 'MyComponent',
      camel: 'myComponent',
      capitalized: 'My-Component',
    });
  });
});
