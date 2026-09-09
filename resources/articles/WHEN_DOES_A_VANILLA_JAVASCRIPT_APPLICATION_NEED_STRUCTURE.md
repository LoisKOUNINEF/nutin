# When Does a Vanilla JavaScript Application Need Structure?

A vanilla JavaScript application can start remarkably simply.

You might have an `index.html`, an `app.ts`, a few modules, some event listeners, and a handful of DOM operations. There is no framework to configure, no component model to learn, and no abstraction between your code and the browser. And that can be exactly the right architecture.

It's time to worry when **the number of relationships between parts of the application increases**.

One screen becomes several. A button starts affecting something that lives somewhere else. Data fetched from an API is displayed in multiple places. Components are created dynamically and need to be removed later. Navigation becomes intertwined with rendering. Event listeners survive longer than the UI that created them.

The architecture may no longer be that simple.

At that point, the useful question isn't:

> "Do I need a framework now?"

It is:

> **"Which problems have appeared, and what is the smallest architectural abstraction that solves them?"**

## Vanilla JavaScript is often the right place to start

There is nothing inherently incomplete about using the platform directly.

A small application might only need a couple files (`index.html`, `app.ts`, `api.ts`), a few event listeners and some direct DOM manipulation.

If the application is easy to understand, easy to change, and easy to debug, its architecture is doing its job.

The browser already provides a substantial application platform:

* the DOM;
* events;
* modules;
* browser APIs;
* `fetch`;
* URL and History APIs;
* Web Components;
* JavaScript and TypeScript themselves.

You can build serious applications directly on top of these primitives.

The difficulty appears when the application accumulates **relationships**.

A rough progression might look like this:

```text
One screen
    ↓
Several screens
    ↓
Reusable UI
    ↓
Shared application data
    ↓
Navigation
    ↓
Dynamic creation/destruction
    ↓
Cross-component events
    ↓
Multiple rendering paths
    ↓
Cleanup and ownership problems
```

There is no magic number of files or lines of code at which this happens.

It depends on the application.

A 3,000-line application can be perfectly manageable. A 500-line application with poorly defined ownership can be surprisingly difficult to maintain.

The important variable is not size by itself.

It is **how difficult the relationships between parts have become to reason about**.

## What does it mean for an application to "need structure"?

Structure is sometimes confused with a particular technology, but it does not necessarily mean:

* a frontend framework;
* classes everywhere;
* dependency injection;
* a global store;
* a particular directory structure;
* a component-per-element architecture.

Structure means making **responsibilities and boundaries explicit**.

For example:

* What is responsible for rendering this UI?
* Who owns this data?
* Which code is responsible for networking?
* What constitutes a reusable component?
* What belongs to a particular screen?
* Who creates this DOM subtree?
* Who destroys it?
* Who owns its event listeners?
* How does navigation happen?
* What causes this UI to update?

These are architectural questions.

You can answer them with a framework, or you can answer them yourself.

An explicit data owner makes the architecture easier to reason about.

Structure is therefore less about adding abstractions and more about **making important relationships visible**.

## The warning signs of accidental architecture

Most applications don't suddenly become unmaintainable.

Instead, the architecture slowly becomes accidental.

Here are some of the more useful warning signs.

### 1. DOM manipulation is scattered everywhere

Imagine that several unrelated functions can modify the same part of the interface:

```ts
function loadUser() {
    // ...
    nameElement.textContent = user.name;
}

function updateUser() {
    // ...
    nameElement.textContent = user.name;
}

function resetScreen() {
    // ...
    nameElement.textContent = '';
}
```

This isn't inherently wrong, and may be perfectly reasonable.

The problem appears when there is no longer a clear answer to:

> **Who owns this piece of UI?**

### 2. Event listeners have unclear ownership

Dynamic interfaces make this particularly visible.

Consider a component that attaches a listener whenever it is rendered:

```ts
button.addEventListener('click', handleClick);
```

Then the component is rendered again.

Another listener is attached.

Then it is rendered again.

Now the callback fires multiple times.

Or perhaps the component disappears, but its listener remains attached somewhere.

The problem isn't `addEventListener()`.

The problem is **ownership and lifetime**.

You need to know:

* who created the listener;
* what it listens to;
* how long it should exist;
* when it should be removed.

Once UI can be dynamically created and destroyed, lifecycle management becomes an architectural concern.

Creating something is only half the problem.

You also need a reliable answer to:

> **What happens when this thing goes away?**

### 3. Shared data has no obvious owner

Suppose several parts of an application need the current shopping cart.

One component maintains its own cart.

Another fetches the cart independently.

A third stores a derived version.

Eventually, these representations disagree.

You now have synchronization problems rather than merely data problems.

A useful architectural question is:

> **Where is the source of truth?**

### 4. Navigation leaks into UI components

A button shouldn't necessarily need to understand the entire routing architecture.

Likewise, route parsing, page initialization, data fetching, and DOM rendering don't necessarily belong in one function.

Again, the issue isn't that the latter cannot work.

It is that the relationships have become difficult to see.

### 5. Rendering is triggered from everywhere

This is one of the more significant warning signs.

Imagine:

```ts
updateUser();
renderHeader();

saveSettings();
renderSettings();

handleLogin();
renderHeader();
renderNavigation();
```

Eventually someone asks:

> **What actually causes this UI to update?**

If the answer is "it depends on which function happened to change the data," your rendering model may be becoming accidental.

### 6. Cleanup becomes difficult

This is one of the strongest signals that an application needs architectural boundaries.

Creating UI is usually easy:

```ts
const component = createComponent();
container.append(component);
```

Destroying it correctly can be considerably harder.

What happens to:

* event listeners?
* subscriptions?
* timers?
* observers?
* pending operations?
* child components?
* references to DOM nodes?

If your application has dynamic UI and there is no clear destruction model, complexity is accumulating around lifecycle.

### 7. One feature requires touching unrelated code

This is perhaps the broadest architectural smell.

You add a feature to a settings screen and have to modify:

* the router;
* the API module;
* the navigation component;
* a global event handler;
* the application bootstrap;
* two unrelated components.

Sometimes cross-cutting changes are legitimate.

But if they happen routinely, your boundaries may not reflect the actual responsibilities of the application.

The goal of structure isn't to eliminate all dependencies.

It is to make **necessary dependencies explicit and unnecessary dependencies difficult**.

## Structure does not necessarily mean reactivity

A modern framework may give you:

* components;
* state;
* lifecycle;
* routing;
* rendering;
* automatic updates;
* dependency management;
* build tooling.

Because these features often appear together, it is easy to assume that they are one architectural problem.

> Structural question: *Where should this functionality live, and who owns it?*

> Reactivity question: *When this data changes, how should all dependent UI update?*

Those questions are related, but they are not identical.

You can have:

* reusable components;
* route-bound views;
* services;
* lifecycle management;
* event-driven communication;
* explicit rendering;

without having a reactive state system, and the reverse is also possible.

An application can use sophisticated reactivity while still having poorly separated responsibilities.

Reactivity can solve an **update propagation problem**, it does not automatically solve an **application architecture problem**.

## When does reactivity actually become useful?

Reactivity is valuable when update propagation itself has become difficult.

For example, imagine a dashboard where many parts of the interface depend on shared, frequently changing state:

```text
                 ┌─── Header
                 │
Shared state ────┼─── Sidebar
                 │
                 ├─── Notifications
                 │
                 ├─── Dashboard
                 │
                 └─── Status panel
```

When the state changes, several parts of the UI need to respond.

Now add:

* derived values;
* nested dependencies;
* asynchronous transitions;
* optimistic updates;
* frequent changes;
* conditional UI;
* multiple levels of components.

Manually coordinating all of those updates can become repetitive and error-prone.

Reactivity becomes particularly attractive when:

* many UI elements depend on the same changing state;
* state changes frequently;
* derived state is pervasive;
* updates propagate through many component levels;
* manually triggering updates has become repetitive;
* fine-grained updates matter;
* asynchronous state transitions are numerous and interconnected.

## A better progression: introduce the smallest useful abstraction

When an application starts becoming difficult to maintain, there is a temptation to make a large architectural jump.

You started with:

```text
HTML + TypeScript
```

and suddenly consider:

```text
component framework
+ reactive state management
+ routing
+ dependency injection
+ build system
+ ecosystem
```
But before jumping to a decision, let's try to solve problems in order.

### Step 1 — Separate responsibilities

Start by separating things that have different reasons to change.

For example:

```text
UI
Data / application logic
Networking
Routing
```

This alone can eliminate a surprising amount of complexity.

### Step 2 — Establish component boundaries

Introduce components where they provide a meaningful boundary.

Good reasons include:

* the UI is reused;
* it has its own lifecycle;
* it has a clear responsibility;
* it has meaningful inputs or outputs;
* it can be understood independently.

Don't turn every `<div>` into a component.

A component should earn its abstraction.

### Step 3 — Establish ownership

Give important resources clear owners.

For example:

```text
Component
 ├── DOM subtree
 ├── event listeners
 ├── subscriptions
 └── child components
```

The exact architecture can vary.

What matters is that you can answer:

> **Who owns this?**

### Step 4 — Introduce lifecycle management

Once UI can be dynamically created and destroyed, lifecycle becomes important.

You should have an explicit model for events such as:

```text
create
 ↓
render
 ↓
update
 ↓
destroy
```

Not every application needs formal lifecycle hooks.

But every dynamic application needs some way of answering:

> **What resources must be released when this UI disappears?**

### Step 5 — Establish an owner for shared data

If multiple parts of the application depend on the same data, give that data an explicit source of truth.

Don't introduce global state merely because several components exist, but when **shared ownership is actually a problem**.

### Step 6 — Establish a rendering model

Decide what causes UI to update.

For example:

```text
Event
  ↓
State change
  ↓
Render
```

The update model should be intentional.

### Step 7 — Only then consider reactivity

If coordinating updates has become one of the application's dominant sources of complexity, you have evidence that reactivity may be useful.

> **Don't adopt abstractions because your application has become "big enough." Adopt them because a specific problem has become expensive enough to justify them.**

## Vanilla and frameworks are not binary choices

There is a useful middle ground between raw platform APIs and a large reactive framework.

Think of the ecosystem as a spectrum:

```text
Raw platform APIs
       ↓
Your own application architecture
       ↓
Focused frontend toolkit
       ↓
Lightweight framework
       ↓
Full-scale reactive framework
```

You don't have to choose between:

> "I write everything myself."

and:

> "I adopt a framework that defines almost everything for me."

You can remain close to the browser while adopting explicit architectural conventions.

This is particularly useful for applications where the main problem is organizational rather than reactive.

You may want:

* components;
* views;
* routing;
* lifecycle;
* event management;
* services;
* build tooling;
* testing;

while still preferring:

* HTML templates;
* direct DOM APIs;
* explicit rendering;
* straightforward TypeScript;
* minimal runtime machinery.

## Nutin: structured vanilla without requiring reactivity

[Nutin](https://nutin.org) is one example of this middle ground.

The idea behind Nutin is not that vanilla JavaScript is inadequate.

It is that there is a useful point between ad-hoc DOM code and a highly reactive framework.

Nutin provides explicit application structure around concepts such as:

* components;
* route-bound views;
* lifecycle management;
* routing;
* event management;
* services for shared application data;
* explicit event-driven rendering;
* build tooling;
* testing tooling.

How these pieces relate to the architectural problems described above:

* Components establish UI boundaries.
* Views establish route-bound boundaries.
* Lifecycle gives dynamically created UI an explicit lifetime.
* Event management gives communication and listener ownership a defined model.
* Services provide explicit ownership for shared application concerns.
* Rendering remains explicit rather than being based on a reactive state graph.

The resulting model can remain close to the platform:

```text
User action
    ↓
Event
    ↓
Application logic
    ↓
State change
    ↓
Explicit render
```

There is no Virtual DOM sitting between your code and the browser.

There are no runtime dependencies.

Templates remain HTML, and the underlying DOM remains directly accessible.

The framework's conventions are there to provide structure, not to prevent you from using the platform.

That makes Nutin useful for a particular kind of application:

> **An application that has outgrown ad-hoc vanilla architecture, but whose fundamental problem is not highly interconnected reactive state.**

## Structured does not mean constrained

A useful architectural abstraction should reduce accidental complexity without making ordinary work unnecessarily difficult.

When the abstraction isn't appropriate, you should be able to step outside it.

You can add structure without surrendering control of the platform.

## When a larger reactive framework is the better choice

A larger framework may be more appropriate when:

* highly interconnected reactive state is central to the application;
* many parts of the interface depend on frequently changing shared state;
* fine-grained updates are important;
* derived state is pervasive;
* sophisticated reconciliation or diffing provides significant value;
* the application's scale benefits from a mature framework ecosystem;
* the team benefits from the framework's established conventions;
* the application's complexity has exceeded what a deliberately minimal toolkit is designed to address.

The point is to **recognize when reactivity is solving your actual problem**.

Nutin is deliberately not trying to cover every possible frontend architecture; it is aimed at small and medium SPAs and at developers who value explicit structure while remaining close to the underlying platform.

## Let's sum it up

> **Solve the problem you actually have, not the problem your framework assumes you will have.**
> **Understand what became difficult. Then choose the smallest abstraction that makes it easier.**
