import { AppEventBus, Component, ComponentConfig } from '../../../core/index.js';
import { TasksService } from '../../services/index.js';
import { ButtonComponent } from '../index.js';

const templateFn = (task: Task) => `
<div 
  class="u-flex-center u-flex-column"
  style="max-width;25vw;margin-top:1em;text-align:center;"
><h2 
    class="u-font-large u-bold"
    data-pipe="capitalizeAll"
  >${task.name}</h2>
  <div 
    class="u-font-small u-italic"
    data-pipe="date:en-US,long,time|capitalizeAll"
  >${task.date}</div>
  <div class="u-flex-row">
    <div data-component="details"></div>
    <div data-component="delete"></div>
  </div>
</div>
`;

export class TaskComponent extends Component {
  private _task: Task;

  constructor(mountTarget: HTMLElement, task: Task) {
    super({templateFn, config: task, mountTarget});
    this._task = task;
  }

  public childConfigs(): ComponentConfig[] {
    const btnClass = 'c-button u-rounded-pill u-padd-x-small u-padd-y-small u-marg-x-smallest u-marg-y-smallest';
    return [
      {
        selector: 'details',
        factory: (el) => new ButtonComponent(
          el, { 
            textContent: `Details`, 
            callback: () => this.goToDetails(), 
            className: `${btnClass} c-button-hover-prim`
          }
        )
      },
      {
        selector: 'delete',
        factory: (el) => new ButtonComponent(
          el, 
          { 
            textContent: 'Delete', 
            callback: () => this.deleteTask(), 
            className: `${btnClass} c-button-hover-sec`
          }
        )
      },
    ]
  }

  deleteTask() {
    TasksService.deleteTask(this._task.id);
  }

  goToDetails() {
    AppEventBus.emit('navigate', `/tasks/${this._task.id}`);
  }

}
