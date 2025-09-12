import { Component } from '../../../../core/index.js';

/**
 * ```typescript
 * interface AnchorConfig {
  // prefix href with '#' for internal anchor
  href: string;
  textContent: string;
  style?: string;
  // use regular pipe syntax for arguments / chaining
  pipes?: string;
}
```
*/
export interface AnchorConfig {
  href: string;
  textContent: string;
  style?: string;
  pipes?: string;
}

const templateFn = (config: AnchorConfig) => `<a
  data-pipe="${config.pipes}"
  style="${config.style}" 
  href="${config.href}" 
  id="anchor-${config.href.replace('#','')}"
>${config.textContent}</a>`;

export class AnchorComponent extends Component<HTMLAnchorElement, AnchorConfig> {
  constructor(mountTarget: HTMLElement, config: AnchorConfig) {
    super({
      templateFn, 
      mountTarget,
      config,
      normalizeKeys: ['style', 'pipes']
    });

    this.handleClick(this.config);
  }

  private handleClick(config: AnchorConfig): void {
    const isInternal = config.href.startsWith('#');
    if (!isInternal) return;

    const id = config.href.slice(1);
    const el = document.getElementById(`anchor-${id}`);

    el?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
