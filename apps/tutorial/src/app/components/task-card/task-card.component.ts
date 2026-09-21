import { Component, ComponentConfig, Navigation } from '../../../core/index.js';
import { TaskActionComponent } from '../index.js';
import { taskService } from '../../services/index.js';

const templateFn = (_task: ITask) => `__TEMPLATE_PLACEHOLDER__`;

export class TaskCardComponent extends Component {
  private _task: ITask;
  constructor(mountTarget: HTMLElement, config: ITask) {
    super({ templateFn, config, mountTarget });
    this._task = config;
  }

  registerChildren(): ComponentConfig[] {
    return [
      {
        selector: 'delete',
        factory: (el) => new TaskActionComponent(el, 
          {
            callback: () => this._deleteTask(),
            textContent: 'Delete',
          },
          // props
          { className: 'task-card__action-delete' },
        )
      },
      {
        selector: 'edit',
        factory: (el) => new TaskActionComponent(el, {
          callback: () => this._goToEdit(),
          textContent: 'Edit',
          })
        },
      ]
  }

  private _deleteTask(): void {
    taskService.removeTask(this._task.id);
  }

  private _goToEdit(): void {
    Navigation.navigateTo(`/tasks/${this._task.id}`)
  }
}
