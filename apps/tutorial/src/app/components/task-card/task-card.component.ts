import { Component, ComponentConfig, Navigation } from '../../../core/index.js';
import { TaskActionComponent } from '../index.js';
import { taskService } from '../../services/index.js';

const templateFn = (_task: ITask) => `__TEMPLATE_PLACEHOLDER__`;

export class TaskCardComponent extends Component {
  constructor(mountTarget: HTMLElement, config: ITask) {
    super({ templateFn, config, mountTarget });
  }

  registerChildren(): ComponentConfig[] {
    return [
      {
        selector: 'remove',
        factory: (el) => new TaskActionComponent(el, 
          {
            callback: () => this._removeTask(),
            textContent: 'Remove',
          },
          // props
          { className: 'task-card__action-remove' },
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

  private _removeTask(): void {
    taskService.deleteTask(this.config.id);
  }

  private _goToEdit(): void {
    Navigation.navigateTo(`/tasks/${this.config.id}`)
  }
}
