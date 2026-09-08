# How to Structure a Small SPA

A small single-page application can stay surprisingly simple, but there is a point where simplicity starts working against you.

You add authentication. Then a dashboard. Then settings. Then a few forms. Some API calls. A navigation menu. A modal. Maybe a table with pagination.

Nothing is particularly complicated on its own. The problem is that the responsibilities start getting mixed together.

A file that started as `app.ts` now handles routing, rendering, API calls, event listeners, and application state. A component fetches its own data while another component maintains a second copy of the same data. The router starts manipulating the DOM. Views become hundreds of lines long.

At that point, the application may simply need clearer boundaries.

> **A small SPA does not need a large architecture. It needs clear ownership and separation of responsibilities.**

This article looks at one practical way to structure a small SPA (taking TypeScript as the demo language) without making the architecture more complicated than the application itself.

## Start with responsibilities

Before deciding where files belong, ask what the application actually needs to do.

A typical small SPA might have responsibilities such as:

* rendering user interfaces;
* managing reusable UI elements;
* coordinating route-level screens;
* handling navigation;
* communicating with APIs;
* managing application data;
* responding to events;
* loading configuration;
* applying styles;
* running tests.

These responsibilities are related, but they are not identical.

The goal is not to create one abstraction for every responsibility, but to make it obvious **who owns what**.

# A deliberately small architecture

For a modest application, something like this can be enough:

```text
src/
  components/
  views/
  services/
  router/
  main.ts
```

You might organize it differently:

```text
src/
  ui/
  screens/
  application/
  navigation/
  main.ts
```

Or by feature, or by domain.

What matters is the boundary represented by each area.

# Components: reusable UI, not miniature applications

A component is useful when a piece of UI has a meaningful boundary.

For example:

* a search form;
* a modal;
* a navigation menu;
* a user card;
* a table;
* a pagination control.

These elements have their own behavior, state, DOM, events, or lifecycle.

That makes them good candidates for independent UI units.

A component can emit an event or invoke an operation without becoming responsible for the whole application workflow.

## Don't componentize everything

Ask:

> Does this UI have behavior of its own?

> Is it reused?

> Does it have a lifecycle?

> Does isolating it make the application easier to understand?

If the answer is no, keeping it inside a larger component or view may be the better choice.

The objective is not maximum component count, it is useful boundaries.

# Application operations and shared data

Suppose several parts of the application need access to the current user.

Without an explicit owner, it is easy for different components to maintain their own copies:

```text
Header → current user A

Dashboard → current user A

Settings → current user B
```

Now the application needs to keep those copies synchronized.

A shared service can instead provide one obvious owner:

```text
             AuthService
             /    |    \
            ↓     ↓     ↓
         Header Dashboard Settings
```

The exact mechanism can vary.

It could be a plain object, an event-driven store, a reactive signal, or something else.

The architectural principle is more important than the implementation:

> **Shared application data should have an obvious owner.**

That does not mean all state belongs in one global store. Only data that genuinely needs to be shared should be given a broader owner.

# Routing should solve one problem

Routing answers a relatively simple question:

> **Which view corresponds to the current URL or navigation state?**

Conceptually:

```text
URL
 ↓
Router
 ↓
View
 ↓
Components
```

A router can handle things such as:

* matching URLs;
* extracting route parameters;
* navigating between screens;
* deciding which view to display.

It should not become the place where everything else happens.

For example, this is a warning sign:

```text
Router
 ├── parse URL
 ├── fetch API data
 ├── manipulate DOM
 ├── validate forms
 ├── update application state
 └── construct UI
```

Those responsibilities belong to different parts of the application.

The router should primarily manage navigation.

# Rendering: what causes the UI to update?

## Direct DOM manipulation

An interaction directly changes the relevant DOM:

```text
click
 ↓
event handler
 ↓
DOM update
```

This can be perfectly adequate for localized interactions.

## Explicit rendering

A state change causes a component or view to render:

```text
state change
 ↓
render()
 ↓
DOM
```

This makes the update mechanism explicit.

## Reactive rendering

A state change automatically propagates to dependent UI:

```text
state
 ↓
reactive dependency
 ↓
UI update
```

This can become valuable when relationships between state and UI become numerous or difficult to manage manually.

# Lifecycle is about ownership

Dynamic interfaces create another architectural problem: resources have lifetimes.

A component might:

* create DOM elements;
* attach event listeners;
* subscribe to an application event;
* start asynchronous work;
* create child components;
* start timers or observers.

Eventually that component may disappear.

What happens to those resources?

A useful way to think about lifecycle is not simply:

```text
onMount()
onDestroy()
```

but:

> **Who owns this resource, and when does that ownership end?**

Leaked event listeners and subscriptions are often not caused by complicated algorithms. They are caused by unclear ownership.

A good component model makes creation and destruction explicit enough that developers can answer:

> **If this UI disappears, what else disappears with it?**

# Don't over-architect a small SPA

*Speaking from experience:* It is tempting to try and solve all architectural questions for your 2 page SPA. Please don't.

You don't want your used-to-be-simple application suddenly get:

* repositories,
* use cases,
* dependency injection,
* factories,
* adapters,
* abstraction layers,
* state machines,
* event buses,
* generic base classes,
* five levels of directories,

and end up with an architecture that is considerably harder to understand than the original application.

That is not an improvement.

Abstraction has a cost.

> **Architecture should make the application easier to understand, not demonstrate how much architecture you know.**

Solve the actual problems you have, and add abstraction when the application gives you a concrete reason to.

# What architecture looks like in Nutin

Nutin is one example of an approach with clear boundaries.

In Nutin, the concepts map roughly like this:

| Architectural concern                  | Nutin                           |
| -------------------------------------- | ------------------------------- |
| Reusable UI                            | Components                      |
| Route-level orchestration              | Views                           |
| Shared application data and operations | Services                        |
| Navigation                             | Router                          |
| Rendering                              | Explicit/event-driven rendering |
| Lifecycle                              | Component lifecycle             |
| Templates                              | HTML                            |
| Configuration                          | `nutin.config.js`               |

Nutin is not intended to dictate what an application's architecture must be. It is to ensure a clear separation of responsibilities.

Nutin aims to support the application's architecture rather than become the architecture itself. 

Its tooling and framework code can be inspected and modified, and developers can bypass its abstractions when their application needs something different.

#############################
######TODO: update link######
#############################

For implementation details, see the relevant [Nutin documentation](/docs/) for Components, Views, Services, Routing, Lifecycle, Configuration, Testing, and Getting Started.

# When is this architecture enough?

A component/view/service model is useful for a broad class of applications.

For example:

* dashboards;
* CRUD applications;
* internal tools;
* personal projects;
* small product SPAs;
* modest client-side applications.

It gives the application enough structure to separate common responsibilities without requiring a large framework or elaborate methodology.

But no architecture is appropriate forever.

You may eventually reach a point where:

* state relationships become highly complex;
* reactive behavior dominates the application;
* rendering performance requires more sophisticated techniques;
* a very large team needs stronger conventions;
* the application grows beyond the assumptions of a lightweight architecture.

At that point, introducing additional infrastructure or adopting a more opinionated framework may be more than reasonable.

#############################
######TODO: update link######
#############################

This is the same principle explored in [How much frontend framework do you actually need?]: choose the amount of infrastructure that solves the problems you actually have.

# Clear boundaries are more valuable than a perfect architecture

The architecture should make responsibility obvious.

A developer should be able to answer:

* Where does application data belong?
* Who owns shared state?
* How does navigation work?
* What causes the UI to update?
* Who owns listeners and subscriptions?
* Where should API operations live?
* How can this behavior be tested?

If those questions have clear answers, the application probably has enough structure.

> **A small SPA does not need a large architecture. It needs clear boundaries.**
