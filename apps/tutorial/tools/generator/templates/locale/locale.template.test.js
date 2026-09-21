import { localeTemplate } from './locale.template.js';

describe('localeTemplate', () => {
  it('renders a locale JSON stub with a "default" key', () => {
    expect(localeTemplate({ pascal: 'Widget', capitalized: 'Widget' })).toBe('{\n  "default": "Widget works !"\n}\n');
  });

  it('does not include a "title" key when isView is false', () => {
    expect(localeTemplate({ pascal: 'Widget', capitalized: 'Widget' }, false)).toBe('{\n  "default": "Widget works !"\n}\n');
  });

  it('includes a top-level "title" key seeded from the capitalized name when isView is true', () => {
    expect(localeTemplate({ pascal: 'Widget', capitalized: 'Widget' }, true)).toBe(
      '{\n  "title": "Widget",\n  "default": "Widget works !"\n}\n'
    );
  });
});
