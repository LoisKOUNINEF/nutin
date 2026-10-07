# Test your app with testin-nutin

Every Nutin application ships with **testin-nutin**, a built-in testing toolkit.

## Enable application tests

```js
// nutin.config.js
testinNutin: {
    includeFramework: true,  // Nutin's own tests - set to false to only run yours
    includeTools: false,
    includeApp: true,        // Include application tests
    /* ... */
},
```

## Create the test files

```bash
touch src/app/services/task/task.service.test.js src/app/views/task-catalog/task-catalog.view.test.js src/app/components/new-task/new-task.component.test.js src/app/components/task-action/task-action.component.test.js src/app/components/task-card/task-card.component.test.js src/app/components/task-inputs/task-inputs.component.test.js src/app/guards.test.js
```

```text
src/app/
 |---- components/
        |---- new-task/new-task.component.test.js
        |---- task-action/task-action.component.test.js
        |---- task-card/task-card.component.test.js
        |---- task-inputs/task-inputs.component.test.js
 |---- services/
        |---- task/task.service.test.js
 |---- views/
        |---- task-catalog/task-catalog.view.test.js
 |---- guards.test.js
```

- Tests run against the **compiled** output in `dist/`, which is why test files are `.js`.
- `#root/` points to your project root.
- `describe`, `it`, `expect`, `spyOn`, `click`, `$`, `$$`... are globals and need no import.
- *Note:* With `includeApp` enabled, the generator creates a `*.test.js` file alongside every new component, view and service.
- Refer to [testin-nutin docs](https://nutin.org/docs/testing) for details.

## Run the tests

```bash
npm run testin-nutin          # Builds, then runs the tests once
npm run testin-nutin task     # Only runs test files whose path contains "task"
npm run testin-nutin:watch    # Re-runs the tests on file changes
npm run testin-nutin:verbose  # Logs test suites & individual tests
```

## Test the service

```js
// src/app/services/task/task.service.test.js
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
```

## Test a component

### Render it and click it

```js
// src/app/components/new-task/new-task.component.test.js
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
```

### Pass it a fake callback

```js
// src/app/components/task-action/task-action.component.test.js
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
```

### Test its children and navigation

```js
// src/app/components/task-card/task-card.component.test.js
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
```

### Test user input

```js
// src/app/components/task-inputs/task-inputs.component.test.js
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
```

## Test the view

```js
// src/app/views/task-catalog/task-catalog.view.test.js
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

  it('keeps unchanged cards and the form when it re-renders', () => {
    view.setRouteParams({ id: '1' });
    view.render();
    const [firstCard, secondCard] = $$('.task-card');
    const form = $('.task-inputs');

    // What saving the form does: the task changes, then the view re-renders
    taskService.updateTask({ id: 1, name: 'Renamed' });
    view.render();

    expect($$('.task-card')[0]).toBe(firstCard);
    expect($$('.task-card')[1]).not.toBe(secondCard);
    expect($('.task-inputs')).toBe(form);
  });
});
```

`toBe` compares elements by identity: the first card is the same DOM node after the re-render, the renamed one is a new node.

## Test the guard

A guard is a function of the route's params, so call it directly:

```js
// src/app/guards.test.js
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
```

## Go further

- [Write a test](https://nutin.org/docs/testing/write-a-test)
- [What assertions are available?](https://nutin.org/docs/testing/what-assertions-are-available)
- [Spy on methods](https://nutin.org/docs/testing/spy-on-methods)
- [Mock core services](https://nutin.org/docs/testing/mock-core-services)
- [Fake timers](https://nutin.org/docs/testing/fake-timers)
- [Use test coverage](https://nutin.org/docs/testing/use-test-coverage)
