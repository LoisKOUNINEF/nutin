# 6. Make tasks disappear

## Let the service remove tasks

```ts
class TaskService extends Service<TaskService> {
    /* ... */
    public removeTask(id: number): void {
        this._tasks = this._tasks.filter((task: ITask) => task.id !== id);
        AppEventBus.emit('task-event', { taskId: id });
    }
}
```

## Generate the component

```bash
npm run generate component task-action
# Creates src/app/components/task-action/task-action.component.ts|html|scss
```

## Pass configuration to the component

```ts
export interface ITaskActionConfig {
    callback: () => void;
    textContent: string;
}

const templateFn = (config: ITaskActionConfig) => `__TEMPLATE_PLACEHOLDER__`;

export class TaskActionComponent extends Component {
    private _callback: () => void;

    constructor(
        mountTarget: HTMLElement,
        config: ITaskActionConfig,
        props: ComponentProps = { /* className: '', style: '' */ },
    ) {
        super({ templateFn, mountTarget, config, props });
        this._callback = config.callback;
    }
}
```

## Bind the callback

```html
<div class="task-action">
    <button data-event="click:_callback">${config.textContent}</button>
</div>
```

## Style it

```css
.task-action {
    padding: .5rem;
    button {
        background: #FAFAF9;
        padding: 0 1rem;
        border-radius: 10px;
        border: 2px solid #D6D6D2;
        &:hover {
            border: 2px solid #B2B2AD;
        }
    }
}
```

## Use it in the card

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
                factory: (el) => new TaskActionComponent(el, 
                    // config
                    {
                        callback: () => this._deleteTask(),
                        textContent: 'Delete',
                    },
                    // props
                    { className: 'task-card__action-delete' },
                )
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

## Customize its style

```css
.task-card__action-delete {
    button {
        color: #B05252;
        &:hover {
            border: 2px solid #B05252;
        }
    }
}
```

**[Next step →](7_MAKE_TASKS_EDITABLE.md)**
