# 5. Add your first interaction

## Let the service add tasks

```ts
class TaskService extends Service<TaskService> {
    // Remove hardcoded tasks
    private _tasks: ITask[];

    constructor() {
        super();
        this._tasks = [];
    }
    
    public createTask(): void {
        let id = 0;
        if (this._tasks.length > 0){
            id = Math.max(...this._tasks.map(task => task.id)) + 1;
        }

        const newTask: ITask = {
            id: id,
            name: `Task ${id + 1}`,
        };

        this._tasks.push(newTask);
    }
}
```

## Generate the component

```bash
npm run generate component new-task
# Creates src/app/components/new-task/new-task.component.ts|html|scss
```

## Add the callback

```ts
import { taskService } from '../../services/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class NewTaskComponent extends Component {
    /* ... */
    private _newTask(): void {
        taskService.addTask();
  }
}
```

## Bind the callback

```html
<div class="add-task">
    <button data-event="click:_newTask">New Task</button>
</div>
```

## A little bit of styling

```css
.new-task {
    padding: 2rem;
    button {
        background: #3C3C3A;
        color: #FAFAF9;
        padding: 1rem 1.5rem;
        font-size: 1.2rem;
        border-radius: 8px;
        &:hover {
            background: #2C2C2A;
        }
    }
}
```

## Use the component in the view

```ts
export class TaskCatalogView extends View {
    /* ... */

    registerChildren(): ComponentConfig[] {
        return [
            {
                selector: 'new-task',
                factory: (el) => new NewTaskComponent(el),
            },
            /* ... */
        ]
    }
}
```

```html
<div class="task-catalog">
    <h1>Nutin Todo</h1>
    <!-- data-component attribute = "selector" target -->
    <div data-component="new-task"></div>
    <!-- ... -->
</div>
```

## Make the view aware of task creation

### Define an event

```ts
// src/app/globals.d.ts
declare interface AppEventMap {
    // to keep this lean, we'll reuse the same event for all operations
    'task-event': { taskId: number };
}
```

### Emit the event

```ts
import { AppEventBus } from '../../../core/index.js';

class TaskService extends Service<TaskService> {
    /* ... */
    
    public createTask(): void {
        /* ... */
        AppEventBus.emit('task-event', { taskId: newTask.id });
    }
}
```

### Listen to the event to re-render the view

```ts
export class TaskCatalogView extends View {
    constructor() {
        /* ... */
        this.listenToRenderEvents(['task-event']);
    }
}
```

**[Next step →](6_MAKE_TASKS_DISAPPEAR.md)**
