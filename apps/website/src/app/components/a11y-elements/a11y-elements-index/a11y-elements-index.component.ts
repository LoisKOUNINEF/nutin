import { Component, Navigation } from '../../../../core/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class A11yElementsIndexComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private navigateTo(page: string) {
    Navigation.navigateTo(`/a11y-elements/${page}`);
  }
}
