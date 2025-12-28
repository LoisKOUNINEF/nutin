import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { TaskComponent, AddTaskComponent, TaskDetailsComponent } from '../../components/index.js';
import { TasksService } from '../../services/index.js';

const template = `
<div data-component="add-task"></div>
<div style="display:flex;">
  <div data-catalog="task-catalog" class="task-catalog__sidebar"></div>
  <div data-component="task-details"></div>
</div>
`;

export class TaskCatalogView extends View {
  private _tasks: Task[] = [];

  constructor() {
    super({template});
    AppEventBus.subscribe('task-updated', () => this.forceRender());
  }

  protected override forceRender(): void {
    this._tasks = TasksService.tasks;
    return super.forceRender();
  }

  public onEnter() {
    this._tasks = TasksService.tasks;
  }

  public childConfigs(): ComponentConfig[] { 
    const addTaskConfig: ComponentConfig = {
      selector: `add-task`,
      factory: (el) => new AddTaskComponent(el)
    };

    const configs = [addTaskConfig, ...this.catalogConfigs()];

    if (this.hasRouteParam('id')) {
      configs.push(...this.detailsConfigs());
    }

    return configs;
  }

  private catalogConfigs(): ComponentConfig[] {
    return this.catalogConfig({
      array: this._tasks,
      elementName: 'task',
      selector: 'task-catalog',
      component: TaskComponent
    });

  }
  
  private detailsConfigs(): ComponentConfig[] {
    const taskId = this.getRouteParam('id') || 0;
    const task = this._tasks.find((task) => task.id === +taskId);
    if (!task) return [];

    return [
      { 
        selector: `task-details`,
        factory: (el) => new TaskDetailsComponent(el, task)
      }
    ]  
  }
}
