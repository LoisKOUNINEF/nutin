# 4. See your tasks

## Generate the view

```bash
npm run generate view task-catalog
# Creates src/app/views/task-catalog/task-catalog.view.ts|html|scss
```

## Render your tasks

```ts
class TaskCatalogView extends View {
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

    registerChildren(): ComponentConfig[] {
        // One TaskCardComponent is created for each task.
        return this.createCatalogComponents({
            array: this._tasks,
            selector: 'tasks',
            elementName: 'task',
            component: TaskCardComponent,
            elementTag: 'article'
        })
    }
}
```

## Add the target in the template

```html
<div>
    <div data-catalog="tasks"></div>
</div>
```

## Add the route

```ts
// routes.ts
```

## Remove the default `HomeView`

**[Next step →](4_GIVE_YOUR_TASKS_SOMEWHERE_TO_LIVE.md)**
