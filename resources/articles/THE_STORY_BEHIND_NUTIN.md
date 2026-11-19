---
ogImage: /assets/images/og-covers/og-cover-articles.jpg
---

# The story behind Nutin

After learning how to build web apps with several frameworks, a couple of questions kept coming back to me.

I wanted to understand *how* frameworks work, *why* they do what they do, and *when* to use them. No better way to find out than to build an app from scratch.

So I started building what I needed from the ground up.

The beginning wasn't particularly difficult: render a page, reuse a few UI elements, nothing too complicated.

Soon enough, modules needed shared state, and data had to flow between them.

Things escalated quickly.

More and more branches, with so many leaves. A tree that big, I wouldn't know how to nurture on my own.

At that moment, I asked myself a question I probably should ask more often: *"WTF am I doing?"*

Or, in that specific case: *"WTF am I **building**?"*

Nobody wants another framework.

So what possible reason could justify all the hours I was so eager to spend on it?

## From learning to building and back again

At first, Nutin was an opportunity to dig deeper into vanilla web development while building my own portfolio.

Then I fell down a rabbit hole. A pretty deep one: in fact, I ended up building Nutin's website before the portfolio.

I won't go into all the back-and-forth or the poor design decisions that cost me hours.

What matters is that Nutin was built around real needs and evolved through actual use.

But something I hadn't anticipated eventually surfaced: application-specific logic had started leaking into the framework.

That needed fixing. More importantly, I needed to prevent it from happening again.

## Defining the boundaries

**Nutin aims to bring the architectural benefits of frameworks to vanilla web development without turning conventions into constraints.**

### When useful becomes too much

The obvious way to grow is to keep adding things.

A feature solves a problem. A utility makes sense. A library looks useful. An abstraction cleans up a particular case.

But all of that just made Nutin harder to use.

The original goal had never been to build the most capable tool possible.

It had been to make application development more structured **without introducing unnecessary machinery**.

Nutin had started drifting away from the reason it existed.

### Does this belong here at all?

I went back through it and asked what it actually needed to do.

Some things stayed.

Some things were simplified.

Many things were removed completely.

Some of what I removed eventually found a home in the [a11y-elements package](https://www.npmjs.com/package/a11y-elements).

I needed a set of principles to define Nutin's scope:

- Nutin's public API should remain small, explicit and approachable.
- Users should think in terms of capabilities, not implementation details.
- Internal code should be modular, with clear responsibilities and minimal coupling.
- Defaults should eliminate unnecessary decisions, not restrict them.
- Every new feature should answer a genuine need.

### What remained

The parts that survived are those that still make sense within the original constraints.

Components provide *structure for reusable UI*.

Views provide a place to *orchestrate application-level logic*.

Services handle *shared resources*.

Events provide *explicit communication between modules*.

**Nutin is small because every abstraction has earned its place.**

## Built by using it

Nutin wasn't designed in isolation and then tested against imaginary applications. It was built by using it.

In that sense, Nutin has already proven its worth: I use it to build and maintain my own applications.

Nutin's history is largely a record of decisions I've had to reconsider.

This taught me how to distinguish between abstractions that solve recurring problems and those that merely seem like good ideas.

**Nutin should only grow when real problems give it a reason to grow.**

Nutin's origin story is in fact pretty classic: it started because I wanted to build an application without a frontend framework, it grew because I built more than one, it became too complicated because solving problems can become a problem of its own.

I now know that sometimes the best way to move a project forward is to remove things.
