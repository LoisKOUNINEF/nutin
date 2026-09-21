import { Service } from '../../../core/index.js';
import { AppEventBus } from '../../../core/index.js';

export class TaskService extends Service<TaskService> {  
  private _tasks: ITask[];

  constructor() {
    super();
    this._tasks = [];
  }

  public get tasks(): ITask[] {
    return this._tasks;
  }

  public getTask(id: number): ITask | undefined {
    return this._tasks.find((task) => task.id === id);
  }

  public addTask(): void {
    let id = 0;
    if (this._tasks.length > 0){
      id = Math.max(...this._tasks.map(task => task.id)) + 1;
    }

    const newTask: ITask = {
      id: id,
      name: `Task ${id + 1}`,
    };

    this._tasks.push(newTask);
    AppEventBus.emit('task-event', { taskId: newTask.id });
  }
    
  public removeTask(id: number): void {
    this._tasks = this._tasks.filter((task: ITask) => task.id !== id);
    AppEventBus.emit('task-event', { taskId: id });
  }

  public updateTask(task: ITask): void {
    this._tasks = this._tasks.map((t) => {
      return t.id === task.id ? task : t
    });
    AppEventBus.emit('task-event', { taskId: task.id })
  }
}

export const taskService = TaskService.getInstance();
