import { Navigation } from '#root/dist/src/core/index.js';
import { TaskCardComponent } from '#root/dist/src/app/components/task-card/task-card.component.js';
import { taskService } from '#root/dist/src/app/services/task/task.service.js';

describe('TaskCardComponent', () => {
  let app;

  beforeEach(() => {
    app = document.getElementById('app');
  });

  afterEach(() => {
    app.innerHTML = '';
  });

  it('renders the task name', () => {
    new TaskCardComponent(app, { id: 1, name: 'Buy milk' }).render();

    expect($('.task-card h2').textContent).toBe('Buy milk');
  });

  it('removes the content paragraph when the task has no content', () => {
    new TaskCardComponent(app, { id: 1, name: 'Buy milk' }).render();

    expect($('.task-card p')).toBe(null);
  });

  it('renders its Edit and Remove actions', () => {
    new TaskCardComponent(app, { id: 1, name: 'Buy milk' }).render();

    const labels = $$('.task-action button').map((button) => button.textContent);
    expect(labels).toEqual(['Edit', 'Remove']);
  });

  it('Remove deletes the task', () => {
    const deleteSpy = spyOn(taskService, 'deleteTask').andCallFake(() => {});
    new TaskCardComponent(app, { id: 1, name: 'Buy milk' }).render();

    click($('.task-card__action-remove button'));

    expect(deleteSpy).toHaveBeenCalledWith(1);
    deleteSpy.restore();
  });

  it('Edit navigates to the task route', () => {
    const navigateSpy = spyOn(Navigation, 'navigateTo').andCallFake(() => {});
    new TaskCardComponent(app, { id: 1, name: 'Buy milk' }).render();

    click($$('.task-action button')[0]);

    expect(navigateSpy).toHaveBeenCalledWith('/tasks/1');
    navigateSpy.restore();
  });
});
