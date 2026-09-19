# 7. Make tasks editable

## Let the service update tasks

```ts
class TaskService extends Service<TaskService> {
    /* ... */
    public updateTask(id: number, updatedTask: Partial<ITask>): ITask[] {
        const task = this._tasks.find((task: ITask) => task.id === id);
        task = { ...task, updatedTask } 
        // event
        return this.tasks;
    }
}
```

## Reuse the component

## Call the service

### TS

### HTML

### Style it a bit


**[Next step →](8_TAKE_A_LOOK_AT_WHAT_YOU_VE_BUILT.md)**
