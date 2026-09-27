import fs from 'fs';
import path from 'path';
import { PATHS } from '../app/paths.js';
import { expandDynamicRoutes } from './dynamic-routes.js';

const MANIFEST_NAME = '__dynamic-routes-test';
const manifestPath = path.join(PATHS.tempSource, 'generated', `${MANIFEST_NAME}.json`);

describe('expandDynamicRoutes', () => {
  beforeEach(() => {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify({
      sections: [],
      pages: { navigate: { slug: 'navigate', section: 'api', title: 'Navigate', description: 'How to navigate' } },
    }));
  });

  afterEach(() => {
    fs.rmSync(manifestPath, { force: true });
  });

  it('passes static routes through with an outputPath', () => {
    expect(expandDynamicRoutes([{ path: '/' }])[0].outputPath).toBe('');
    expect(expandDynamicRoutes([{ path: '/404' }])[0].outputPath).toBe('/404');
  });

  it('expands a :slug? route to one concrete URL per page', () => {
    const [route] = expandDynamicRoutes([{ path: '/articles/:slug?', dynamicFrom: MANIFEST_NAME }]);
    expect(route.outputPath).toBe('/articles/navigate');
    expect(route.mockParams).toEqual({ slug: 'navigate' });
    expect(route.title).toBe('Navigate');
  });

  it('fills a :section? segment from the page section', () => {
    const [route] = expandDynamicRoutes([{ path: '/docs/:section?/:slug?', dynamicFrom: MANIFEST_NAME }]);
    expect(route.path).toBe('/docs/:section?/:slug?');
    expect(route.outputPath).toBe('/docs/api/navigate');
    expect(route.mockParams).toEqual({ section: 'api', slug: 'navigate' });
  });
});
