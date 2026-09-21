import { Component } from '../../../core/index.js';
import { taskService } from '../../services/index.js';

const templateFn = (_task: ITask) => `__TEMPLATE_PLACEHOLDER__`;

export class TaskInputsComponent extends Component {
  private _task: ITask;

  constructor(mountTarget: HTMLElement, config: ITask) {
    super({templateFn, mountTarget, config});
    this._task = config;
  }

  private _editTask(field: keyof ITask, value: string): void { 
    this._task = { ...this._task, [field]: value };
    taskService.updateTask(this._task);
  }
}
