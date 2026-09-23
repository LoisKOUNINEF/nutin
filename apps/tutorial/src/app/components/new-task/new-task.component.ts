import { Component } from '../../../core/index.js';
import { taskService } from '../../services/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class NewTaskComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private _newTask(): void {
    taskService.createTask();
  }
}
