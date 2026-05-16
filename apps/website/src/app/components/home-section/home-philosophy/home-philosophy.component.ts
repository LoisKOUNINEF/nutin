import { Component } from '../../../../core/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class HomePhilosophyComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }
}
