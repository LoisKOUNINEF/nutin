import { Component } from '../../../core/index.js';
import { TasksService } from '../../services/index.js';

const templateFn = (task: Task) => `
<div class="task-details__container">
  <div class="u-flex-column">
    <input
      class="u-font-large u-bold u-bg-inherit"
      type="text"
      id="name"
      placeholder="Name"
      value="${task.name}"
      data-event="change:updateTask:name,@value"
      data-pipe="capitalizeAll"
      autoFocus
    />
    <textarea
      style="resize:none;height:60vh;width:100%;padding-left:.5em;background-color:inherit;"
      id="body"
      placeholder="Task details..."
      data-event="change:updateTask:content,@value"
      data-pipe="capitalize"
    >${task.content}</textarea>
    <input 
      class="u-bg-inherit u-color-base"
      type="datetime-local" 
      value="${new Date(new Date(task.date).getTime() - new Date(task.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16)}"
      data-event="blur:updateTask:date,@value"
    />
  </div>
</div>
`;

export class TaskDetailsComponent extends Component {
  private _task: Task;

  constructor(mountTarget: HTMLElement, task: Task) {
    super({templateFn, config: task, mountTarget});
    this._task = task;
  }

  updateTask = (field: keyof Task, value: string) => { 
    const transformers: Partial<Record<keyof Task, (val: any) => any>> = {
      date: (v: string) => new Date(v),
    };

    const transformer = transformers[field];
    const finalValue = transformer ? transformer(value) : value;

    this._task = { ...this._task, [field]: finalValue };
    TasksService.updateTask(this._task);
  }
}
