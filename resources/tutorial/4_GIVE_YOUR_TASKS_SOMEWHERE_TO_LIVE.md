# 4. Give your tasks somewhere to live

## Generate the service

```bash
npm run generate service task
# Creates src/app/services/task/task.service.ts
```

## Move your tasks to the service

```ts
class TaskService extends Service<TaskService> {
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
class TaskService extends Service<TaskService> {
    /* ... */
    public get tasks(): ITask[] {
        return this._tasks;
    }
}
```

## Use the service in the view

```ts
class TaskCatalogView extends View {
    registerChildren(): ComponentConfig[] {
        return this.createCatalogComponents({
            array: taskService.tasks, // 
            selector: 'tasks',
            elementName: 'task',
            component: TaskCardComponent,
            elementTag: 'article'
        })
    }
}
```

**[Next step →](5_ADD_YOUR_FIRST_INTERACTION.md)**
