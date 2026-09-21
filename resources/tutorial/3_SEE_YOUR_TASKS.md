# 3. See your tasks

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
            items: this._tasks,
            selector: 'task-cards',
            elementName: 'task-card',
            component: TaskCardComponent,
            elementTag: 'article'
        })
    }
}
```

## Add the target in the template

```html
<div class="task-catalog">
    <h1>Nutin Todo</h1>
    <div class="task-catalog__body">
        <!-- data-catalog attribute = "selector" target -->
        <div data-catalog="task-cards" class="task-catalog__task-cards"></div>
    </div>
</div>
```

## Style it a bit

```css
.task-catalog {
    h1 {
        font-size: 2.5rem;
    }
}

.task-catalog__body {
  display: grid;
  grid-template-columns: repeat(2, 1fr 2fr);
}

.task-catalog__task-cards {
    padding: 2rem;
    display: grid;
    gap: 12px;
}
```

## Add the route

```ts
// src/app/routes.ts

export const appRoutes: Routes = {
    // Make your new page the landing page
    '/': () => new TaskCatalogView(),
}
```

## Remove the default `HomeView`

```bash
rm -rf src/app/views/home
```

- Remove the export in `src/app/views/index.ts` and the import in `src/app/routes.ts`.

**[Next step →](4_GIVE_YOUR_TASKS_SOMEWHERE_TO_LIVE.md)**
