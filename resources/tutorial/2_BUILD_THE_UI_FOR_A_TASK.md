# Build the UI for a task

## Give your tasks a shape

```ts
// src/app/globals.d.ts
interface ITask {
    id: number;
    name: string;
    content: string;
}
```

## Generate the component

```bash
npm run generate component task-card
# Creates src/app/components/task-card/task-card.component.ts|html|scss
```

## Give the component a task to render

```ts
// The component's .html template is injected here.
const templateFn = (_task: ITask) => `__TEMPLATE_PLACEHOLDER__`;

export class TaskCardComponent extends Component {
  constructor(mountTarget: HTMLElement, config: ITask, props?: {className?: 'task-card'}) {
    super({
      templateFn, 
      config, 
      mountTarget,
      props
    });
  }
}
```

## Render the task in its template

```html
<div>
    <h2>${_task.name}</h2>
    <p>${_task.content}</p>
</div>
```

## Give it some style

```css
.task-card {
    padding: 1.5rem;
    line-height: 2;
    max-width: 100ch;
    background: ;
    border: 1px solid ;
    border-radius: 8px;
    h2 {
        font-size: 1.5rem;
        font-weight: bold;
    }
}
```

**[Next step →](3_SEE_YOUR_TASKS.md)**
