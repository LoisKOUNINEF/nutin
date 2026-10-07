import { View, html } from '../../../core/index.js';
import { NewTaskComponent } from '../../components/new-task/new-task.component.js';
import { TaskInputsComponent } from '../../components/task-inputs/task-inputs.component.js';
import { TaskCardComponent } from '../../components/task-card/task-card.component.js';
import { taskService } from '../../services/task/task.service.js';

const template = html`__TEMPLATE_PLACEHOLDER__`;

export class TaskCatalogView extends View {
  private _tasks: ITask[] = [];

  constructor() {
    super({ template, viewName: 'Task Catalog' });
    this.listenToRenderEvents(['task-event']);
  }

  onBeforeRender(): void {
    this._tasks = taskService.tasks;
  }

  registerChildren(): ComponentConfig[] {
    // One TaskCardComponent is created for each task.
    const taskCatalogChildren: ComponentConfig[] = [
      {
        selector: 'add-task',
        factory: (el) => new NewTaskComponent(el),
      },
      ...this.createCatalogComponents({
        items: this._tasks,
        selector: 'task-cards',
        elementName: 'task-card',
        component: TaskCardComponent,
        elementTag: 'article',
        // A card whose task didn't change is kept on re-render.
        trackBy: (task) => task.id,
      }),
    ];

    if (this.hasRouteParam('id')) {
      taskCatalogChildren.push(...this.getTaskInputsChild());
    }

    return taskCatalogChildren;
  }

  private getTaskInputsChild(): ComponentConfig[] {
    const taskId = this.getRouteParam('id') || 0;
    const task = taskService.getTask(+taskId);
    if (!task) return [];

    return [
      {
        selector: 'task-inputs',
        // Same task, same form: it's kept while you edit.
        key: task.id,
        factory: (el) => new TaskInputsComponent(el, task),
      },
    ];
  }
}
