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
npm run generate component components/task-inputs
# Creates src/app/components/task-inputs/task-inputs.component.ts|html|scss
```

## Give the component a task

```ts
import { Component, html } from '../../../core/index.js';
import { taskService } from '../../services/task/task.service.js';

const templateFn = (_task: ITask) => html`__TEMPLATE_PLACEHOLDER__`;

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

```scss
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
        min-height: 20vh;
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

### Guard the route

Tasks only live in memory: reload the page on `/tasks/1` and there's no task 1 to edit. A route guard runs before the view is created, gets the route's params, and returns `true` to let the navigation through, or a path to redirect to.

Add one next to the generated `requireAuth` example:

```ts
// src/app/guards.ts
import { taskService } from './services/task/task.service.js';

export const Guards = {
    /* requireAuth ... */

    /**
     * Redirects when the route's task doesn't exist, e.g. after a reload: tasks only live in memory.
     */
    requireTask: (redirectTo: string = '/'): RouteGuard => {
        return ({ id }) => id === undefined || taskService.getTask(+id) !== undefined || redirectTo;
    },
};
```

Then use the route's object form to attach it:

```ts
// src/app/routes.ts
import { Guards } from './guards.js';

export const appRoutes: Routes = {
    /* ... */
    '/tasks/:id?': { view: () => new TaskCatalogView(), guards: [Guards.requireTask()] },
    /* ... */
}
```

See [Use route guards](https://nutin.org/docs/api/use-route-guards).

### Handle routeParams in the view

```ts
/* ... */
import { TaskInputsComponent } from '../../components/task-inputs/task-inputs.component.js';

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

```scss
.task-card__actions {
    padding-top: .5rem;
    display: flex;
    justify-content: flex-end;
}
```

## Keep elements across re-renders

Edit a task, change its name, then press Tab to go to its details: the focus is lost. Saving the name emits `task-event`, the view re-renders, and every child is destroyed and created again, the form you're typing in included.

Tell the view which children are the same as before:

```ts
export class TaskCatalogView extends View {
    /* ... */

    registerChildren(): ComponentConfig[] {
        const taskCatalogChildren: ComponentConfig[] = [
            /* add-task */
            ...this.createCatalogComponents({
                /* ... */
                // A card whose task didn't change is kept on re-render.
                trackBy: (task) => task.id,
            }),
        ];
        /* ... */
    }

    private getTaskInputsChild(): ComponentConfig[] {
        /* ... */
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
```

- `trackBy` gives each card an identity. On re-render, a card whose task has the same id and the same values keeps its component and its DOM. The card you renamed changed, so it's created again with the new name.
- `key` does the same for a single child. While you edit the same task, the form is kept as it is: the focus, the caret and what you typed stay where they were. Opening another task changes the key, so a new form is created for it.

See [Keeping children across re-renders](https://nutin.org/docs/api/register-child-components#keeping-children-across-re-renders).

**[Next step →](8_TAKE_A_LOOK_AT_WHAT_YOU_VE_BUILT.md)**
