# 5. Add your first interaction

## Let the service add tasks

```ts
class TaskService extends Service<TaskService> {
    //
    private _tasks: ITask[];

    constructor() {
        super();
        this._tasks = [];
    }
    
    public addTask(): void {
        // 'Dynamic' id
        let id = 0;
        if (this._tasks.length > 0){
            id = Math.max(...this._tasks.map(task => task.id)) + 1;
        }

        const newTask: Task = {
            id: id,
            name: `Task ${id + 1}`,
        };

        this._tasks.push(newTask);
    }
}
```

## Generate the component

```bash
npm run generate component add-task
# Creates src/app/components/add-task/add-task.component.ts|html|scss
```

```ts
import { taskService } from '../../services/index.js';

const templateFn = () => `__TEMPLATE_PLACEHOLDER__`;

export class AddTaskComponent extends Component {
    /* ... */
    private _addTask(): void {
        taskService.addTask();
  }
}
```

```html
<div class="add-task">
    <button data-event="click:_addTask">Add Task</button>
</div>
```

```css
.add-task {
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

## View

```ts
export class TaskCatalogView extends View {
    /* ... */

    registerChildren(): ComponentConfig[] {
        return [
            {
                selector: 'add-task',
                factory: (el) => new AddTaskComponent(el),
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
    <div data-component="add-task"></div>
    <!-- ... -->
</div>
```

## Make the View able to react to changes

```ts
// src/app/globals.d.ts
declare interface AppEventMap {
    // to keep this lean, we'll reuse the same event for all operations
    'task-event': { taskId: number };
}
```

```ts
import { AppEventBus } from '../../../core/index.js';

class TaskService extends Service<TaskService> {
    /* ... */
    
    public addTask(): void {
        /* ... */
        AppEventBus.emit('task-event', { taskId: newTask.id });
    }
}
```

```ts
export class TaskCatalogView extends View {
    constructor() {
        /* ... */
        this.listenToRenderEvents(['task-event']);
    }
}
```

**[Next step →](6_MAKE_TASKS_DISAPPEAR.md)**
