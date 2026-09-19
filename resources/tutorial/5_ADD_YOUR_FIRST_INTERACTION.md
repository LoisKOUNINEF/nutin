# 5. Add your first interaction

## Let the service add tasks

```ts
class TaskService extends Service<TaskService> {
    /* ... */
    public addTask(task: ITask): ITask[] {
        this._tasks.push(task);
        return this.tasks;
    }
}
```

## Generate the component

```bash
npm run generate component add-task
# Creates src/app/components/add-task/add-task.component.ts|html|scss
```

## Call the service

### TS

### HTML

### Style it a bit

## Re-render the view

### Emit an event

### Listen to an event

**[Next step →](6_MAKE_TASKS_DISAPPEAR.md)**
