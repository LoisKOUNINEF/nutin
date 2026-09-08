import { Component, Navigation } from '../../../../core/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class ReadMoreComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private navigateTo(slug: string) {
    Navigation.navigateTo(`/articles/${slug}`);
  }
}
