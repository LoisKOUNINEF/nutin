import { ConfigHelper } from '#root/dist/src/core/base-classes/component/helpers/config.helper.js';

describe('ConfigHelper', () => {
  it('normalize shallow-merges defaults under config, letting config win', () => {
    const result = ConfigHelper.normalize({ a: 1 }, { a: 0, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('normalize returns config untouched when there are no matching defaults', () => {
    const result = ConfigHelper.normalize({ a: 1 }, {});
    expect(result).toEqual({ a: 1 });
  });

  it('normalizeStrings replaces undefined and null values with an empty string for the given keys', () => {
    const result = ConfigHelper.normalizeStrings({ a: undefined, b: null, c: 'x' }, ['a', 'b']);
    expect(result).toEqual({ a: '', b: '', c: 'x' });
  });

  it('normalizeStrings leaves keys not in stringKeys untouched, even if undefined', () => {
    const result = ConfigHelper.normalizeStrings({ a: undefined, b: undefined }, ['a']);
    expect(result).toEqual({ a: '', b: undefined });
  });

  it('normalizeStrings does not mutate the original config object', () => {
    const original = { a: undefined };
    ConfigHelper.normalizeStrings(original, ['a']);
    expect(original.a).toBeUndefined();
  });

  it('createNormalizedTemplate normalizes then calls templateFn with the result', () => {
    const result = ConfigHelper.createNormalizedTemplate({
      config: { name: undefined },
      defaults: { name: 'fallback', extra: 1 },
      normalizeKeys: ['name'],
      templateFn: (cfg) => `name=${cfg.name},extra=${cfg.extra}`,
    });
    expect(result).toBe('name=,extra=1');
  });

  it('createNormalizedTemplate defaults templateFn to a function returning an empty string', () => {
    const result = ConfigHelper.createNormalizedTemplate({ config: { a: 1 } });
    expect(result).toBe('');
  });

  it('setConfigValue normalizes strings when normalizeKeys is truthy', () => {
    const result = ConfigHelper.setConfigValue({ a: undefined }, ['a']);
    expect(result).toEqual({ a: '' });
  });

  it('setConfigValue returns the config as-is when normalizeKeys is falsy and config is truthy', () => {
    const config = { a: 1 };
    expect(ConfigHelper.setConfigValue(config, null)).toBe(config);
  });

  it('setConfigValue returns an empty object when both normalizeKeys and config are falsy', () => {
    expect(ConfigHelper.setConfigValue(undefined, null)).toEqual({});
  });
});
