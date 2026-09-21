import { View, ComponentConfig } from '../../../core/index.js';
import { AddTaskComponent, TaskInputsComponent, TaskCardComponent } from '../../components/index.js';
import { taskService } from '../../services/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`;

export class TaskCatalogView extends View {
  private _tasks: ITask[] = [];
  constructor() {
    super({ template, viewName: 'task-catalog' });
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
                factory: (el) => new AddTaskComponent(el),
            },...this.createCatalogComponents({
            items: this._tasks,
            selector: 'task-cards',
            elementName: 'task-card',
            component: TaskCardComponent,
            elementTag: 'article'
        })]

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
                selector: `task-inputs`,
                factory: (el) => new TaskInputsComponent(el, task)
            }
        ]  
    }

}
