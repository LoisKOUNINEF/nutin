import { TaskActionComponent } from '#root/dist/src/app/components/task-action/task-action.component.js';

describe('TaskActionComponent', () => {
  let app;

  beforeEach(() => {
    app = document.getElementById('app');
  });

  afterEach(() => {
    app.innerHTML = '';
  });

  it('renders its text and className', () => {
    const action = new TaskActionComponent(
      app,
      { callback: () => {}, textContent: 'Remove' },
      { className: 'danger' },
    );
    action.render();

    expect($('.task-action button').textContent).toBe('Remove');
    expect(action.getElement().classList.contains('danger')).toBe(true);
  });

  it('clicking the button calls the callback', () => {
    let calls = 0;
    new TaskActionComponent(app, { callback: () => calls++, textContent: 'Remove' }).render();

    click($('.task-action button'));

    expect(calls).toBe(1);
  });
});
