import { Component } from '../../../core/index.js';
import { PrismHighlighter } from '../../helpers/index.js';

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

  protected override onAfterRender(): void {
    PrismHighlighter.apply();
    super.onAfterRender();
  }
}
