import { Component, ComponentConfig } from '../../../core/index.js';
import { TasksService } from '../../services/index.js';
import { ButtonComponent } from '../index.js';

const templateFn = () => `
<div data-component="add-task"></div>
`;

export class AddTaskComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private addTask() {
    TasksService.addTask();
  }

  public childConfigs(): ComponentConfig[] {
    return [
      {
        selector: `add-task`,
        factory: (el) => new ButtonComponent(
          el, 
          { 
            textContent: 'New Task', 
            callback: () => this.addTask(), 
            className: 'task-catalog__add-task-button' 
          }
        )
      }
    ]
  }
}
