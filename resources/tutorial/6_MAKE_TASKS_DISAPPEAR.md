# 6. Make tasks disappear

## Let the service remove tasks

```ts
class TaskService extends Service<TaskService> {
    /* ... */
    public removeTask(id: number): ITask[] {
        this._tasks = this._tasks.filter((task: ITask) => task.id !== id);
        // event
        return this.tasks;
    }
}
```

## Generate the component

```bash
npm run generate component task-action
```

## Call the service

### TS

### HTML

### Style it a bit


**[Next step →](7_MAKE_TASKS_EDITABLE.md)**
