# 2. Give your tasks somewhere to live

## `Task` Interface

```ts
// src/app/globals.d.ts
declare interface Task {
  id: number;
  name: string;
  content: string;
}
```

## Generate the service

```bash
npm run generate service task
```

## Return a task

```ts
// src/app/services/task/task.service.ts
```

### Register service cleanup

```ts
```

**[Next step →](3_BUILD_THE_UI_FOR_A_TASK.md)**
