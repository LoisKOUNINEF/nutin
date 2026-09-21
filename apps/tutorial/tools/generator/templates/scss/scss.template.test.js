import { scssTemplate } from './scss.template.js';

describe('scssTemplate', () => {
  it('renders an empty stylesheet placeholder', () => {
    expect(scssTemplate()).toBe('\n');
  });
});
