---
ogImage: /assets/images/og-covers/og-cover-articles.jpg
---

# The story behind Nutin

After learning how to build web apps with several frameworks, a couple of questions had been on my mind.

I wanted to understand *how* frameworks work, *why* they do what they do, and *when* to use them. No better way to find out than to build an app from scratch.

So I started building what I needed from the ground up.

First, render something. Then, have some reusable UI.

An app has multiple pages: here comes navigation and routing.

More and more branches, with so many leaves. A tree that big, I wouldn't know how to nurture on my own.

There's the first question: *"WTF am I doing?"*

Or, to be more precise: *"WTF am I building?"*

There's no need for yet another framework.

So what possible reason could justify all the hours I was so eager to spend on it?

## From learning to building and back again

At first, Nutin was an opportunity to dig deeper into vanilla web development while building my own portfolio.

Then I fell down a rabbit hole. A pretty deep one: in fact, I ended up building Nutin's website before the portfolio.

I won't go into all the back-and-forth or the poor design decisions that cost me hours.

What matters is that Nutin was built out of real needs and evolved through actual use.

But something I hadn't anticipated eventually surfaced: application-specific logic had started leaking into the framework.

That needed fixing. More importantly, I needed to prevent it from happening again.

## Defining the boundaries

**Nutin aims to bring the architectural benefits of frameworks to vanilla web development without turning conventions into constraints**.

### When useful becomes too much

The obvious, easy way to grow is to keep adding things.

A feature solves a problem. A utility makes sense. A library looks useful. An abstraction cleans up a particular case.

Eventually, all of that just made Nutin harder to use.

The original goal had never been to build the most capable tool possible.

It had been to make application development more structured **without introducing unnecessary machinery**.

Nutin had started drifting away from the reason it existed.

### Does this belong here at all?

I went back through it and asked what it actually needed to do.

Some things stayed.

Some things were simplified.

Many things were removed completely. The [a11y-elements](https://www.npmjs.com/package/a11y-elements) package originates from it.

Nutin's philosophy needed pillars to define its scope:

- Defaults should eliminate unnecessary decisions, not restrict them.
- Users should think in terms of capabilities, not implementation details.
- Nutin's public API should remain small, explicit and approachable.
- Internal code should be modular, with clear responsibilities and minimal coupling.
- Every new feature should answer a genuine need.

**Nutin is small because every abstraction has earned its place.**

### What remained

The parts that survived are those that still make sense within the original constraints.

Components provide *structure for reusable UI*.

Views provide a place to *orchestrate application-level logic*.

Services handle *shared resources*.

Events provide *explicit communication between otherwise independent pieces*.

Nutin is there to provide structure and an enjoyable developer experience, not to become the environment in which everything else has to live.

## Built by using it

Nutin wasn't designed in isolation and then tested against imaginary applications. It was built by using it.

In that sense, Nutin has already proven its worth: I use it to build and maintain my own applications.

Nutin's history is largely a record of decisions that eventually needed to be reconsidered.

I am now more likely to distinguish between an abstraction that solves a recurring problem and one that merely seems like a good idea.

**Nutin should only grow when real problems give it a reason to grow.**

## Why Nutin exists

Nutin doesn't exist because the web needed another way to render a button.

It exists because there is a useful middle ground between writing every piece of application infrastructure yourself and adopting a large framework.

Because needing structure doesn't necessarily mean needing an entirely different way to build.

Nutin started because I wanted to build an application without a frontend framework.

It grew because the application presented real problems.

It became too complicated because solving problems can become a problem of its own.

And I'm now aware that sometimes the best way to move a project forward is to remove things rather than add them.
