import { navigateToDoc } from '#root/dist/src/app/helpers/navigate-to-doc/navigate-to-doc.helper.js';
import { Navigation } from '#root/dist/src/core/index.js';

describe('navigateToDoc', () => {
  it('forwards the href, hash included, to the router untouched', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    try {
      navigateToDoc('/docs/api/navigate');
      navigateToDoc('/docs/api/navigate#heading-id');
    } finally {
      navigateSpy.restore();
    }
    expect(navigateSpy.calls).toEqual([['/docs/api/navigate'], ['/docs/api/navigate#heading-id']]);
  });
});
