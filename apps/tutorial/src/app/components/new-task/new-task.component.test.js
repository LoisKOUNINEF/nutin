import { NewTaskComponent } from '#root/dist/src/app/components/new-task/new-task.component.js';
import { taskService } from '#root/dist/src/app/services/task/task.service.js';

describe('NewTaskComponent', () => {
  let app;

  beforeEach(() => {
    // The test page already contains your app's #app element.
    app = document.getElementById('app');
  });

  afterEach(() => {
    app.innerHTML = '';
  });

  it('clicking the button creates a task', () => {
    // Mock the service method: calls are recorded, the real task list is untouched.
    const createSpy = spyOn(taskService, 'createTask').andCallFake(() => {});

    new NewTaskComponent(app).render();
    click($('.new-task button'));

    expect(createSpy).toHaveBeenCalled();
    createSpy.restore();
  });
});
