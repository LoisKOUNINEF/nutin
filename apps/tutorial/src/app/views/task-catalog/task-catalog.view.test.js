import { AppEventBus } from '#root/dist/src/core/index.js';
import { TaskCatalogView } from '#root/dist/src/app/views/task-catalog/task-catalog.view.js';
import { taskService } from '#root/dist/src/app/services/task/task.service.js';

describe('TaskCatalogView', () => {
  let view;
  let emitSpy;

  beforeEach(() => {
    emitSpy = spyOn(AppEventBus, 'emit').andCallFake(() => {});
    taskService.createTask();
    taskService.createTask();
    view = new TaskCatalogView();
  });

  afterEach(() => {
    // The view listens to AppEventBus: destroy it so its listeners don't leak into other tests.
    view.destroy();
    taskService.tasks.forEach((task) => taskService.deleteTask(task.id));
    emitSpy.restore();
  });

  it('renders one card per task', () => {
    view.render();

    expect($$('.task-card').length).toBe(2);
  });

  it('does not render task inputs without an id', () => {
    view.render();

    expect($('.task-inputs')).toBe(null);
  });

  it('renders task inputs for the task in the route', () => {
    // What the router does for /tasks/1
    view.setRouteParams({ id: '1' });
    view.render();

    expect($('.task-inputs #name').value).toBe('Task 2');
  });
});
