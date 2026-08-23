import { componentTemplate } from './component.template.js';

describe('componentTemplate', () => {
  it('renders a component class importing Component via the relative core path', () => {
    const name = { pascal: 'Widget' };
    const targetPath = 'src/app/components/widget';

    // The generator always leaves the html body as a placeholder — the builder
    // swaps in the .html sibling's content at build time.
    expect(componentTemplate(name, targetPath)).toBe(
      `import { Component } from '../../../core/index.js';

const templateFn = () => \`__TEMPLATE_PLACEHOLDER__\`;

export class WidgetComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }
}
`
    );
  });
});
