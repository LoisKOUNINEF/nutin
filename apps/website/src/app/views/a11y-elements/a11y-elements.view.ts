import { View, NavigationManager, html } from '../../../core/index.js';
import { A11yDemoElementsComponent } from '../../components/a11y-elements/a11y-demo-elements/a11y-demo-elements.component.js';
import { A11yDemoOverlaysComponent } from '../../components/a11y-elements/a11y-demo-overlays/a11y-demo-overlays.component.js';
import { A11yElementsIndexComponent } from '../../components/a11y-elements/a11y-elements-index/a11y-elements-index.component.js';
import { loadA11yElements } from '../../helpers/a11y-elements/load-a11y-elements.helper.js';

const template = html`__TEMPLATE_PLACEHOLDER__`;

type A11yPage = 'index' | 'elements' | 'overlays';

export class A11yElementsView extends View {
  constructor() {
    super({ template, viewName: 'A11y Elements' });
  }

  private get page(): A11yPage {
    const page = this.getRouteParam('page');
    return page === 'elements' || page === 'overlays' ? page : 'index';
  }

  // Never invoked during SSR, so the elements are only defined client-side;
  // an unknown page is canonicalized to the index it renders.
  public onEnter(): void {
    void loadA11yElements();
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
