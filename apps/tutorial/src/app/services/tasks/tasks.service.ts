import { notify, NotifyOptions, PopoverView } from '../../../libs/index.js';
import { AppEventBus, Service } from '../../../core/index.js';

export class Tasks extends Service<Tasks> {
  private _tasks: Task[] = [];

  constructor() {
    super();
    this.registerCleanup(this.clear);
    this.fetchTasks();
  }

// called by abstract class Service on service destruction
  private clear() {
    this._tasks = [];
  }

  private fetchTasks() {
    this._tasks = localStorage.tasks 
      ? JSON.parse(localStorage.tasks)
      : [];
  }

  private setTasks() {
    localStorage.setItem('tasks', JSON.stringify(this._tasks));
  }

  private sortTasksByDate(): Task[] {
    return this._tasks.sort((a, b) => {
      if (new Date(a.date) > new Date(b.date)) return 1;
      if (new Date(a.date) < new Date(b.date)) return -1;
      return 0;
    }) 
  }

  public get tasks() {
    return this.sortTasksByDate();
  }

  private notification(
    message: string, 
    type: NotifyOptions['type'] = 'success'
  ) {
    notify(message, { type: type });
  }

  private emitReload() {
    AppEventBus.emit('task-updated');
  }

  private tasksUpdated() {
    this.setTasks();
    this.emitReload();
  }

  public addTask() {
    const id = this._tasks.length === 0 
      ? 0 
      : Math.max(...this._tasks.map(task => task.id)) + 1;

    const newTask: Task = {
      id: id,
      name: `Untitled ${id + 1}`,
      content: '',
      date: new Date(),
    };

    this._tasks.push(newTask);
    this.tasksUpdated();
    this.notification('New task created.');
  }

  public deleteTask(id: number) {
    const popoverConfirm = new PopoverView({ 
      template: `<div style="padding:1rem;font-size:1.1rem;text-align:center;">
  <p>Delete task.</p>
  <p>Are you sure ?</p>
</div>`, 
      buttons: [
        {
          callback: () => this.deleteTaskConfirmed(id), 
          textContent: 'Yes'
        },
        {
          callback: () => { return }, 
          textContent: 'No'
        }
      ] 
    });
    popoverConfirm.render();
  }

  private deleteTaskConfirmed(id: number) {
    this._tasks = this._tasks.filter((task) => task.id !== id);
    this.tasksUpdated();
    this.notification('Task deleted.')
  }

  public updateTask(task: Task) {
    if (isNaN(Date.parse(task.date.toString()))) {
      this.notification('Issue with "Date" property when updating task.', 'error');
      return;
    };

    this._tasks = this._tasks.map((t) => {
      return t.id === task.id ? task : t
    });

    this.tasksUpdated();
    this.notification('Task updated.');
  }
}

export const TasksService = Tasks.getInstance();
