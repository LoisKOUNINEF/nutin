import { Component, ComponentConfig } from '../../../../core/index.js';
import { AnchorComponent } from '../../../../libs/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class UnderDevelopmentComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  registerChildren(): ComponentConfig[] {
    return [
      {
        selector: 'repository-docs-link',
        factory: (el) => new AnchorComponent(el, {
          href: 'https://github.com/LoisKOUNINEF/nutin/tree/main/docs',
          i18nKey: 'under-development.repository-docs-link',
          className: 'under-development__repository-docs-link'
        })
      }
    ];
  }
}
