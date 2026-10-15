import { Navigation, View, html } from '../../../core/index.js';

const template = html`__TEMPLATE_PLACEHOLDER__`;

export class NotFoundView extends View {
  constructor() {
    super({template, viewName: 'not-found'});
  }

  _handleHome() {
    Navigation.navigateTo('/');
  }
}
