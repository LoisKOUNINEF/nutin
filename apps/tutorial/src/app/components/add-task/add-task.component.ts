import { Component } from '../../../core/index.js';
import { taskService } from '../../services/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class AddTaskComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private _addTask(): void {
    taskService.addTask();
  }
}
