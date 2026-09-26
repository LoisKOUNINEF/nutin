import { View, ComponentConfig, NavigationManager } from '../../../core/index.js';
import {
  A11yDemoElementsComponent,
  A11yDemoOverlaysComponent,
  A11yElementsIndexComponent,
} from '../../components/index.js';
import { loadA11yElements } from '../../helpers/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

type A11yPage = 'index' | 'elements' | 'overlays';

export class A11yElementsView extends View {
  constructor() {
    super({ template, viewName: 'A11y Elements' });
  }

  private get page(): A11yPage {
    const page = this.getRouteParam('page');
    return page === 'elements' || page === 'overlays' ? page : 'index';
  }

  // Never invoked during SSR, so the pre-rendered HTML stays free of the
  // CDN bundles; an unknown page is canonicalized to the index it renders.
  public onEnter(): void {
    loadA11yElements();
    if (this.hasRouteParam('page') && this.page === 'index') {
      NavigationManager.replaceState('/a11y-elements');
    }
  }

  public registerChildren(): ComponentConfig[] {
    return [{
      selector: 'a11y-elements-page',
      factory: (el) => {
        switch (this.page) {
          case 'elements': return new A11yDemoElementsComponent(el);
          case 'overlays': return new A11yDemoOverlaysComponent(el);
          default: return new A11yElementsIndexComponent(el);
        }
      },
    }];
  }
}
