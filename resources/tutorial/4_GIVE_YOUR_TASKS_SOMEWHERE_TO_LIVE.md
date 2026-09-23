# 4. Give your tasks somewhere to live

## Generate the service

```bash
npm run generate service task
# Creates src/app/services/task/task.service.ts
```

## Move your tasks to the service

```ts
import { Service } from '../../../core/index.js';

export class TaskService extends Service<TaskService> {
    private _tasks: ITask[] = [
        {
            id: 1,
            name: 'First task',
            content: 'This is the first task.'
        },
        {
            id: 2,
            name: 'Second task',
            content: 'This is the second task.'
        }
    ];
}
```

## Let the service return tasks

```ts
export class TaskService extends Service<TaskService> {
    /* ... */
    public get tasks(): ITask[] {
        return this._tasks;
    }

    public getTask(id: number): ITask | undefined {
        return this._tasks.find((task) => task.id === id);
    }
}
```

## Use the service in the view

```ts
/* ... */
import { taskService } from '../../services/index.js';

export class TaskCatalogView extends View {
  private _tasks: ITask[] = [];

  /* ... */

  onBeforeRender(): void {
    this._tasks = taskService.tasks;
  }
}
```

**[Next step →](5_ADD_YOUR_FIRST_INTERACTION.md)**
