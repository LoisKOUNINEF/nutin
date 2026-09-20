# 6. Make tasks disappear

## Let the service remove tasks

```ts
class TaskService extends Service<TaskService> {
    /* ... */
    public removeTask(id: number): ITask[] {
        this._tasks = this._tasks.filter((task: ITask) => task.id !== id);
        AppEventBus.emit('task-event', { taskId: id });
    }
}
```

## Generate the component

```bash
npm run generate component task-action
```

## 
```ts
import { taskService } from '../../services/index.js';

export interface ITaskActionConfig {
    callback: () => void;
    textContent: string;
}

const templateFn = (config: ITaskActionConfig) => `__TEMPLATE_PLACEHOLDER__`;

export class TaskActionComponent extends Component {
  private _callback: () => void;

  constructor(mountTarget: HTMLElement, config: ITaskActionConfig) {
    super({templateFn, mountTarget, config: config});
    this._callback = config.callback;
  }
}
```

```html
<div class="task-action">
    <button data-event="click:_callback">${textContent}</button>
</div>
```

## Style it a bit

```css
.task-action {
    padding: .5rem;
    button {
        background: #FAFAF9;
        padding: 0 1rem;
        border-radius: 9999px;
        border: 1px solid #D6D6D2;
        &:hover {
            border: 1px solid #B2B2AD;
        }
    }
}
```

## Use it in task-card

```ts
export class TaskCardComponent extends Component {
    // Keep a reference to task
    private _task: ITask;

    constructor(mountTarget: HTMLElement, config: ITask) {
        /* ... */
        this._task = config;
    }

    registerChildren(): ComponentConfig[] {
        return [
            {
                selector: 'delete',
                factory: (el) => new TaskActionComponent(el, {
                    callback: () => this.deleteTask(),
                    textContent: 'Delete',
                })
            },
        ]
    }

    private _deleteTask(): void {
        taskService.removeTask(this._task.id);
    }
}
```

```html
<div class="task-card">
    <!-- ... -->
    <div data-component="delete"></div>
</div>
```


**[Next step →](7_MAKE_TASKS_EDITABLE.md)**
