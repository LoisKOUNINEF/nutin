import path from 'path';
import { getRelToCore } from './get-rel-to-core.js';

describe('getRelToCore', () => {
  it('adds one "../" per path segment before core/index.js', () => {
    const targetPath = ['src', 'app', 'components', 'widget'].join(path.sep);
    expect(getRelToCore(targetPath)).toBe('../../../core/index.js');
  });

  it('adds no "../" for a single-segment path', () => {
    expect(getRelToCore('widget')).toBe('core/index.js');
  });

  it('scales with the number of segments', () => {
    const targetPath = ['a', 'b'].join(path.sep);
    expect(getRelToCore(targetPath)).toBe('../core/index.js');
  });
});
