import { Navigation, View } from '../../../core/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class NotFoundView extends View {
  constructor() {
    super({ template, viewName: 'not-found' });
  }

  private _handleHome(): void {
    Navigation.navigateTo('/');
  }
}
