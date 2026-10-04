import { Component, html } from '../../../core/index.js';

export interface ITaskActionConfig {
  callback: () => void;
  textContent: string;
}

const templateFn = (config: ITaskActionConfig) => html`__TEMPLATE_PLACEHOLDER__`;

export class TaskActionComponent extends Component {
  private _callback: () => void;

  constructor(
    mountTarget: HTMLElement,
    config: ITaskActionConfig,
    props: ComponentProps = { /* className: '', style: '' */ },
  ) {
    super({ templateFn, mountTarget, config, props });
    this._callback = config.callback;
  }
}
