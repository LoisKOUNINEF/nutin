# How Much Frontend Framework Do You Actually Need?

There is a point in the life of a small frontend application where “just use JavaScript” starts to become less simple than it sounded.

You have several screens. Some UI is reused. A few pieces of data need to be shared. Navigation happens without full page loads. Event handlers are being attached and removed. The build process needs some attention. Tests are starting to matter.

None of these problems is particularly difficult on its own.

And yet, taken together, they create architecture.

At that point, there is the familiar choice:

* keep building directly on the platform and create the missing structure yourself, or
* adopt a frontend framework that provides much of that structure for you.

But the more useful question is:

> **How much frontend framework does your application actually need?**

Not which framework is best. Not whether frameworks are good or bad.

**Which problems does your application have, and how much abstraction is justified by those problems?**

That question leads to a much more useful way of thinking about frontend architecture.

## A frontend framework is not one thing

“Frontend framework” sounds like a single category of software, but frameworks solve several different problems.

A framework might provide some or all of the following.

### Structure

As applications grow, you need somewhere to put things.

Components establish reusable UI boundaries. Conventions determine where application logic belongs. Architectural patterns provide some consistency across a codebase.

Without a framework, you can create all of this yourself.

The platform does not prevent you from having a well-structured application. It simply does not prescribe one.

### Rendering

Something has to turn application state or data into what the user sees.

That might mean directly manipulating the DOM:

```ts
element.textContent = user.name;
```

Or it might mean describing a UI and allowing a rendering system to determine what needs to change.

Different frameworks make different choices here. Some use direct DOM operations, some use a Virtual DOM, and others use different reactive or compilation-based approaches.

Rendering is a problem worth solving, but there is no single universally correct solution.

### Lifecycle

Dynamic UI has a lifecycle. During that lifetime, the application may create event listeners, subscriptions, timers, observers, or other resources.

Eventually, those resources need to be cleaned up.

For a tiny application, managing this directly is usually straightforward. Once components are frequently created and destroyed, lifecycle management becomes an architectural concern.

### Routing

A single-page application needs to associate URLs with application state and UI.

Again, the browser provides the underlying primitives:

* `history.pushState()`
* `history.replaceState()`
* `popstate`
* the current URL

But building a complete routing system around those primitives is a different matter.

A framework can provide that structure instead of making every application reinvent it.

### Reactivity and state propagation

This is where frameworks can become considerably more sophisticated.

An application might need to detect changes, propagate them through a component tree, calculate derived state, and update affected parts of the interface automatically.

For some applications, this is extremely valuable.

For others, it introduces machinery to solve a problem they barely have.

There is an important distinction here:

> **An application needing state does not automatically mean it needs sophisticated reactivity.**

Shared state, state propagation, and automatic reactive rendering are related problems, but they are not identical ones.

### Tooling

Modern frontend development also involves work that isn't directly part of rendering UI:

* development servers
* bundling
* asset processing
* production builds
* code transformation
* testing
* configuration

You can assemble these tools independently.

A framework can provide conventions and integration.

### Ecosystem

Finally, there is the ecosystem.

Frameworks often provide — or sit alongside — large collections of libraries, integrations, plugins, conventions, documentation, and community knowledge.

That ecosystem can be a major advantage.

It can also become part of the application's complexity.

The important point is that **these are separate architectural needs**.

You may need routing without sophisticated reactivity.

You may need component lifecycle management without a Virtual DOM.

You may need build tooling without wanting a framework to dictate your rendering model.

You do not necessarily have to accept one answer to every frontend problem simply because you have one frontend problem.

## Start with the problems, not the framework

A useful way to evaluate framework requirements is to forget frameworks temporarily.

Instead, list the problems your application actually has.

| Problem                 | Can the platform handle it? | Does dedicated structure become valuable? |
| ----------------------- | --------------------------- | ----------------------------------------- |
| Reusable UI             | Yes                         | Often                                     |
| DOM updates             | Yes                         | Depends                                   |
| Event handling          | Yes                         | Often as the application grows            |
| Lifecycle cleanup       | Yes                         | Very useful for dynamic components        |
| Client-side routing     | Yes                         | Usually                                   |
| Shared application data | Yes                         | Often                                     |
| Reactivity              | Yes                         | Depends heavily on the application        |
| Build process           | Yes                         | Usually                                   |
| Testing                 | Yes                         | Usually                                   |
| Highly reactive UI      | Yes                         | Specialized solutions may become valuable |

```text
The web platform is capable of doing all of these things.
```
But **capable of doing something** and **pleasant to maintain while doing it yourself** are different questions.

That distinction is where architecture begins.

For example, you can implement a router with the History API. The question isn't whether you can. It is whether maintaining routing logic yourself remains a good use of your time and attention.

Likewise, you can create and destroy event listeners manually. But when components are repeatedly mounted and unmounted, having a consistent lifecycle mechanism can eliminate an entire class of bugs.

The decision is therefore not:

> “Can JavaScript do this?”

It is:

> **“Is this something I want to be responsible for?”**

## The cost of abstraction

Framework adoption is often discussed as though abstraction simply removes complexity.

**Abstraction moves complexity.**

A framework can remove the need to design your own component lifecycle, routing conventions, rendering system, or application structure.

In return, you now need to understand the framework's concepts.

You may also inherit:

* framework-specific conventions
* build requirements
* runtime assumptions
* dependencies
* abstraction layers
* ecosystem decisions
* constraints on how code is organized

None of this is inherently bad; in fact, this is the entire point of abstraction.

You accept one form of complexity because another form is more expensive for your application.

The useful question is therefore not:

> “Does this framework add complexity?”

Every sufficiently capable abstraction adds some.

The useful question is:

> **“Does the complexity this framework removes outweigh the complexity it introduces?”**

For a large application with a large team, sophisticated state management, and highly reactive interfaces, the answer may be an emphatic yes.

For a small application with a handful of screens and limited shared state, the answer may be different.

Neither conclusion is ideological; it is an engineering trade-off.

## The opposite problem: doing everything yourself

There is an equally common mistake on the other side.

“Just use vanilla JavaScript” because the application is small is often exactly right.

A few modules. A few DOM elements. Some event listeners. A little CSS.

Then the application grows. Some components need to be rendered dynamically. Some need cleanup. A navigation system appears. Data needs to be shared between screens. Build configuration gets more complicated. Tests are added.

None of these additions requires a framework.

But now the application has to answer architectural questions:

* How are components organized?
* How are they created and destroyed?
* Where does shared state live?
* How is navigation represented?
* How are event listeners cleaned up?
* When should the DOM be updated?
* How are reusable pieces registered?
* How is the application built and tested?

You can answer every one of those questions yourself, create conventions, abstractions, lifecycle rules, and infrastructure around the application.

But eventually you have built a framework.

The important thing is to recognize what is happening.

> **“Vanilla” does not mean “without architecture.”**

It means that the architecture is primarily yours to define.

That can be an advantage, but it can also become expensive.

## There is a middle ground

The choice is not really:

```text
Vanilla JavaScript
        ↓
Huge framework
```

There is a spectrum.

```text
Platform APIs
      ↓
Small focused abstractions
      ↓
Lightweight toolkit or framework
      ↓
Full-scale frontend framework
```

Different applications can legitimately live at different points on that spectrum.

A small static site may need almost nothing beyond the platform.

A small interactive application may benefit from a few focused abstractions.

A small SPA may need components, lifecycle management, routing, build tooling, and testing without requiring a sophisticated reactive architecture.

A large application may benefit enormously from the conventions, rendering model, ecosystem, and state-management capabilities of a full-scale framework.

The mistake is assuming that moving further along the spectrum is inherently better.

The right amount of abstraction is the amount that makes the application easier to build, understand, test, and maintain.

## What does a small SPA actually need?

Consider a fairly ordinary small TypeScript SPA.

It has:

* several route-bound screens
* reusable UI components
* forms and user interaction
* some shared application data
* asynchronous operations
* a production build
* automated tests

This is more than a collection of DOM scripts.

But it doesn't necessarily follow that the application needs sophisticated reactive state propagation or a large framework ecosystem.

It may primarily need **structure**.

For example:

* components to define UI boundaries
* views to orchestrate screens
* services to hold application-level concerns
* lifecycle management to clean up dynamic resources
* routing to manage navigation
* a build system to produce the application
* testing infrastructure to make changes safer

These are useful abstractions even if rendering remains relatively explicit.

This is an important distinction.

A framework does not have to solve every possible frontend problem to be useful.

## One example of the middle ground: [Nutin](https://nutin.org/docs)

This is the architectural space [Nutin](https://nutin.org/docs) is designed to occupy.

Nutin provides application structure around the problems that tend to become repetitive or error-prone in small SPAs while keeping the underlying web platform visible.

Its components and views establish explicit UI boundaries. Services provide a consistent place for application-level data and state. Routing, build tooling, and development environment are provided rather than assembled from scratch.

The rendering model is deliberately different from frameworks built around a Virtual DOM.

Nutin manipulates the DOM directly, and rendering is explicitly triggered through application events rather than being driven by a general-purpose reactive rendering system.

That is a trade-off, not a claim that explicit rendering is universally superior.

For an application whose UI requires sophisticated, highly reactive state propagation, a more comprehensive reactive architecture may be a better fit.

For an application where explicit rendering and straightforward DOM operations are sufficient, introducing that machinery may not provide enough value to justify it.

The same philosophy applies to templates.

Nutin templates remain HTML and use standard `data-*` attributes such as `data-component`, `data-i18n`, and `data-pipe`. There is no requirement to replace HTML with a proprietary markup language simply to establish component structure.

The goal is not to hide the platform.

It is to avoid repeatedly rebuilding the pieces of application architecture that sit around it.

Nutin also has no runtime dependencies. This means an application does not acquire a runtime dependency chain simply because it uses Nutin; it does not mean the development and build tooling has no dependencies.

Perhaps more importantly, Nutin's own framework and tooling code is exposed and modifiable.

That changes the relationship between the application and the framework.

If the framework's behavior doesn't quite fit a particular application, the intended answer isn't necessarily to search for a plugin that changes it. Developers can inspect the implementation, modify it when appropriate, and work with the underlying platform directly when they need to.

The framework accompanies the application rather than attempting to own its architecture.

That is one possible answer to the middle-ground problem.

It is not the only one.

## When a lightweight approach stops being appropriate

The middle ground is useful precisely because it is not universal.

There are applications where adopting a full-scale framework is the more sensible engineering decision.

Consider an application with:

* extensive reactive state propagation
* complex derived state
* deeply interconnected UI state
* a large component tree
* sophisticated rendering requirements
* a large development team
* significant reliance on an established ecosystem
* organizational value in having a widely recognized framework and its conventions

In those circumstances, the abstractions provided by a mature full-scale framework can be extremely valuable.

The additional concepts and tooling are justified because the application actually needs them.

There is also a practical team dimension.

A technology decision is not made only by looking at runtime behavior.

A framework may provide:

* established hiring patterns
* shared team knowledge
* mature libraries
* well-understood conventions
* extensive documentation
* established development workflows

Those advantages can outweigh the architectural cost of adopting more framework than the application strictly requires.

Likewise, direct DOM manipulation isn't automatically a virtue.

If the application needs a sophisticated reconciliation system, building one yourself would be a poor engineering decision simply because “the browser already has a DOM.”

The point is not to minimize abstraction, but to **justify abstraction**.

## A practical decision framework

When starting or restructuring a frontend application, the following progression is often more useful than choosing a framework first.

### Start with the platform if:

* the application is small
* interactions are limited
* there is little shared state
* UI reuse is modest
* navigation is simple
* introducing application architecture would cost more than it saves

Sometimes, having no framework is the cleanest architecture.

### Add focused structure when:

* reusable components are multiplying
* components have meaningful lifecycles
* event and subscription cleanup is becoming repetitive
* routing is becoming a recurring problem
* application-wide data needs a consistent home
* the codebase is becoming difficult to reason about

At this point, adding structure does not necessarily mean adopting a large framework.

You can introduce individual abstractions as the application needs them.

### Consider a lightweight toolkit or framework when:

* you want established component architecture
* lifecycle management matters
* client-side routing is required
* build and testing infrastructure should be integrated
* you want conventions without adopting a large ecosystem
* staying close to HTML and the DOM is important
* you want to retain the ability to bypass framework abstractions

This is a legitimate architectural category, not merely a compromise between “real frameworks” and vanilla JavaScript.

### Consider a full-scale framework when:

* high reactivity is fundamental to the application
* state propagation has become complex
* sophisticated rendering or reconciliation provides substantial value
* the application or team is large
* the framework ecosystem solves significant problems for you
* established conventions are more valuable than maximum control

In other words:

> **Choose the abstraction that solves the problems you actually have.**, not the ones you might have someday.

## The framework should earn its complexity

There is a temptation in frontend development to treat framework choice as a matter of identity.

Framework developers defend their framework.

Vanilla developers defend the platform.

Yet, it misses the point.

Your application doesn't care what category its architecture belongs to.

It cares whether the resulting system is understandable, maintainable, testable, and appropriate to its requirements.

A framework is valuable when its abstractions make those things easier.

The browser is valuable because it gives you a powerful foundation without requiring you to adopt an application architecture.

A lightweight toolkit can be valuable when the gap between those two becomes uncomfortable: the platform is no longer enough to provide the structure you want, but a full-scale framework introduces more machinery than the application needs.

There is no universal threshold.

And there doesn't need to be one.

## So, how much frontend framework do you actually need?

**As much as your application's problems justify — and no more.**

Some applications need almost none.

Some benefit from a focused collection of abstractions.

Some genuinely need a full-scale framework and its ecosystem.

The important thing is not to maximize or minimize framework usage by default.

Start with the application.

Identify the problems.

Then decide which ones are worth solving yourself and which ones are worth delegating to an abstraction.

If you're looking for the middle ground — explicit structure, lifecycle management, routing, and tooling while staying close to the DOM and HTML — [Nutin](https://nutin.org/) is designed specifically for that kind of application.

*The framework is a means of organizing the application, not the reason the application exists.*


