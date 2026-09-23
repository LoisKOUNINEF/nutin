# 7. Make tasks editable

## Let the service update tasks

```ts
export class TaskService extends Service<TaskService> {
    /* ... */
    public updateTask(task: ITask): void {
        this._tasks = this._tasks.map((t) => {
            return t.id === task.id ? task : t
        });
        AppEventBus.emit('task-event', { taskId: task.id })
    }
}
```

## Generate the component

```bash
npm run generate component task-inputs
# Creates src/app/components/task-inputs/task-inputs.component.ts|html|scss
```

## Give the component a task

```ts
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
```

## Handle changes

```html
<div class="task-inputs">
    <form>
        <input
            type="text"
            id="name"
            placeholder="Name"
            value="${_task.name}"
            data-event="change:_editTask:name,@value"
        />
        <textarea
            id="content"
            placeholder="Task details..."
            data-event="change:_editTask:content,@value"
        >${_task.content ?? ''}</textarea>
    </form>
</div>
```

## Add style

```css
.task-inputs {
    padding: 2rem;
    input {
        font-size: 1.5rem;
        font-weight: bold;
        padding: .2rem .5rem;
        margin-bottom: .5rem;
        width: 100%;
        background: #F1F1EF;
        border-radius: 8px;
    }
    textarea {
        width: 100%;
        font-size: 1.2rem;
        padding: .5rem 1rem;
        background: #E5E5E2;
        border-radius: 8px;
    }
}
```

## Use dynamic routing for your tasks

### Register a dynamic route

```ts
// src/app/routes.ts
export const appRoutes: Routes = {
    /* ... */
    '/tasks/:id?': () => new TaskCatalogView(),
    /* ... */
}
```

### Handle routeParams in the view

```ts
/* ... */
import { TaskInputsComponent } from '../../components/index.js';

export class TaskCatalogView extends View {
    /* ... */

    registerChildren(): ComponentConfig[] {
        const taskCatalogChildren: ComponentConfig[] = [ /* new-task, task-cards */ ];

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
```

```html
<div class="task-catalog__body">
    <div data-catalog="task-cards" class="task-catalog__task-cards"></div>
    <div data-component="task-inputs"></div>
</div>
```

### Navigate to the route

```ts
/* ... */
import { Navigation } from '../../../core/index.js';

export class TaskCardComponent extends Component {
    /* ... */

    registerChildren(): ComponentConfig[] {
        return [
            /* ... */
            {
                selector: 'edit',
                factory: (el) => new TaskActionComponent(el, {
                    callback: () => this._goToEdit(),
                    textContent: 'Edit',
                })
            },
        ]
    }

    private _goToEdit(): void {
        Navigation.navigateTo(`/tasks/${this._task.id}`)
    }
}
```

```html
<div class="task-card">
    <!-- ... -->
    <div class="task-card__actions">
        <div data-component="edit"></div>
        <div data-component="remove"></div>
    </div>
</div>
```

```css
.task-card__actions {
    padding-top: .5rem;
    display: flex;
    justify-content: flex-end;
}
```

**[Next step →](8_TAKE_A_LOOK_AT_WHAT_YOU_VE_BUILT.md)**
