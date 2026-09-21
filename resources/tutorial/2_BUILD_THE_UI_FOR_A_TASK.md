# 2. Build the UI for a task

## Give your tasks a shape

```ts
// src/app/globals.d.ts
declare interface ITask {
    id: number;
    name: string;
    content?: string;
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
  constructor(mountTarget: HTMLElement, config: ITask) {
    super({ templateFn, config, mountTarget });
  }
}
```

## Render the task in its template

```html
<div class="task-card">
    <h2>${_task.name}</h2>
    <!-- data-optional is removed if empty -->
    <p data-optional>${_task.content}</p>
</div>
```

## Give it some style

```css
.task-card {
    padding: 1.5rem;
    line-height: 2;
    max-width: 100ch;
    background: #F1F1EF;
    border: 1px solid #D6D6D2;;
    border-radius: 8px;
    h2 {
        font-size: 1.5rem;
        font-weight: bold;
    }
    p {
        font-size: 1.1rem;
        overflow: hidden;
        max-height: 4rem;
    }
}
```

```css
/* src/styles/_styles.scss */
/* Global styles */
:root {
    font-size: clamp(16px, 18px, 20px);
    body {
        background-color: #FAFAF9;
        color: #121212;
        min-height: 100vh;
        width: 100%;
        line-height: 1.8;
        padding: 1rem;
    }
}
```

**[Next step →](3_SEE_YOUR_TASKS.md)**
