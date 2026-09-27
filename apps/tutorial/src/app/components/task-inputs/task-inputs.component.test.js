import { TaskInputsComponent } from '#root/dist/src/app/components/task-inputs/task-inputs.component.js';
import { taskService } from '#root/dist/src/app/services/task/task.service.js';

describe('TaskInputsComponent', () => {
  let app;
  let updateSpy;

  beforeEach(() => {
    app = document.getElementById('app');
    updateSpy = spyOn(taskService, 'updateTask').andCallFake(() => {});
  });

  afterEach(() => {
    updateSpy.restore();
    app.innerHTML = '';
  });

  // The inputs listen to `change`, which fires when the user commits a new value.
  const change = (el, value) => {
    el.value = value;
    el.dispatchEvent(new window.Event('change'));
  };

  it('fills the inputs with the task', () => {
    new TaskInputsComponent(app, { id: 1, name: 'Buy milk', content: 'Oat milk' }).render();

    expect($('#name').value).toBe('Buy milk');
    expect($('#content').value).toBe('Oat milk');
  });

  it('leaves the content empty when the task has none', () => {
    new TaskInputsComponent(app, { id: 1, name: 'Buy milk' }).render();

    expect($('#content').value).toBe('');
  });

  it('changing the name updates the task', () => {
    new TaskInputsComponent(app, { id: 1, name: 'Buy milk' }).render();

    change($('#name'), 'Buy bread');

    expect(updateSpy).toHaveBeenCalledWith({ id: 1, name: 'Buy bread' });
  });

  it('keeps previous edits when changing another field', () => {
    new TaskInputsComponent(app, { id: 1, name: 'Buy milk' }).render();

    change($('#name'), 'Buy bread');
    change($('#content'), 'Whole wheat');

    expect(updateSpy.lastCall).toEqual([{ id: 1, name: 'Buy bread', content: 'Whole wheat' }]);
  });
});
