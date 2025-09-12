import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent } from '../../components/index.js';

const template = `<div 
  class="u-flex-center u-flex-column u-padd-y-large"
>
  <h1 
    class="u-color-sec u-font-largest u-bold u-font-secondary"
  >Page Not Found</h1>
  <img src="/assets/images/logo-small-trans.avif" width=250 height=250 alt="nutin's small logo with a growing plant.">
  <div data-component="home"></div>
</div>`;

export class NotFoundView extends View {
  constructor() {
    super({template});
  }

  childConfigs(): ComponentConfig[] {
    const btnClass = 'u-bg-inherit u-font-large u-padd-y-medium u-color-prim u-italic';
    return [
      { 
        selector: 'home',
        factory: (el) => new ButtonComponent(el, { textContent: 'Back to home', callback: () => this.handleHome(), className: btnClass })
      },
    ]
  }

  handleHome() {
    AppEventBus.emit('navigate', '/');
  }
}
