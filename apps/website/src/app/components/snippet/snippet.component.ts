import { Component } from '../../../core/index.js';

const templateFn = (_snippet: ISnippet) => `__TEMPLATE_PLACEHOLDER__`;

export class SnippetComponent extends Component {
  constructor(mountTarget: HTMLElement, config: ISnippet, props?: {className?: 'snippet__code'}) {
    super({
      templateFn, 
      config, 
      mountTarget, 
      tagName: 'section',
      props
    });
  }
}
