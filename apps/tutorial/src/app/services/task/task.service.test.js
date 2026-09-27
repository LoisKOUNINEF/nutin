import { AppEventBus } from '#root/dist/src/core/index.js';
import { TaskService } from '#root/dist/src/app/services/task/task.service.js';

describe('TaskService', () => {
  let service;
  let emitSpy;

  // Hooks are declared inside describe()
  beforeEach(() => {
    // Services are singletons: start every test from a fresh instance.
    TaskService.testingReset();
    service = TaskService.getInstance();
    // Record emitted events without notifying real listeners.
    emitSpy = spyOn(AppEventBus, 'emit').andCallFake(() => {});
  });

  afterEach(() => {
    emitSpy.restore();
  });

  it('createTask adds a task with the next id', () => {
    service.createTask();
    service.createTask();

    expect(service.tasks).toEqual([
      { id: 0, name: 'Task 1' },
      { id: 1, name: 'Task 2' },
    ]);
  });

  it('createTask emits task-event', () => {
    service.createTask();

    expect(emitSpy).toHaveBeenCalledWith('task-event', { taskId: 0 });
  });

  it('deleteTask removes the task', () => {
    service.createTask();
    service.deleteTask(0);

    expect(service.tasks).toEqual([]);
  });

  it('updateTask replaces the task', () => {
    service.createTask();
    service.updateTask({ id: 0, name: 'Renamed', content: 'Details' });

    expect(service.getTask(0)).toEqual({ id: 0, name: 'Renamed', content: 'Details' });
  });
});
