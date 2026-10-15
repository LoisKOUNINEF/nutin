import { Component, html } from '../../../core/index.js';
import { taskService } from '../../services/task/task.service.js';

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

export class NewTaskComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private _newTask(): void {
    taskService.createTask();
  }
}
