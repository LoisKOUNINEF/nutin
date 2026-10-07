import { Guards } from '#root/dist/src/app/guards.js';
import { AppEventBus } from '#root/dist/src/core/index.js';
import { taskService } from '#root/dist/src/app/services/task/task.service.js';

describe('Guards.requireTask', () => {
  let emitSpy;

  beforeEach(() => {
    emitSpy = spyOn(AppEventBus, 'emit').andCallFake(() => {});
    taskService.createTask();
  });

  afterEach(() => {
    taskService.tasks.forEach((task) => taskService.deleteTask(task.id));
    emitSpy.restore();
  });

  it('lets an existing task through', () => {
    expect(Guards.requireTask()({ id: '0' })).toBe(true);
  });

  it('redirects when the task does not exist', () => {
    expect(Guards.requireTask()({ id: '5' })).toBe('/');
  });

  it('lets the route through without an id', () => {
    expect(Guards.requireTask()({})).toBe(true);
  });
});
