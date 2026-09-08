# Why Nutin Exists?

Nutin started with a simple question:

**How far can you take a real web application without using a frontend framework?**

At the time, the goal wasn't to build a framework. It was to build an application with TypeScript, HTML and SASS, and keep the browser close to the surface.

The first application was my own portfolio.

That part is almost incidental. The interesting constraint was the application itself: it needed reusable UI, navigation, interaction and enough structure to remain maintainable, but I didn't want to introduce a large frontend framework just to get there.

So I started building what I needed.

## Solving the problems that actually appeared

The first problem was reuse.

Once an application contains more than a handful of pieces of UI, copying markup and behaviour around quickly becomes unpleasant. I needed a way to define components, give them data and let them manage their own behaviour.

So I built components.

Then the application needed more than one page.

So I built a router.

As interactions became more involved, different parts of the application needed to communicate with each other.

So I built an event system.

Other problems followed the same pattern. When something became repetitive or difficult to manage, I looked for the smallest abstraction that solved it.

There was no grand architecture behind this process.

I wasn't sitting down to design a frontend framework and then implementing its features one by one. I was building an application, encountering problems, and solving those problems.

That distinction shaped Nutin more than any particular feature.

The toolkit grew because the applications using it gave it reasons to grow.

## From application code to a toolkit

Eventually, the abstractions stopped feeling like application-specific code.

The component system could be reused. So could the router. So could the event system and the other pieces that had accumulated around them.

At some point, I realized I wasn't simply building an application anymore.

I was building a small toolkit for building applications like it.

That toolkit became Nutin.

Its purpose was still the same: provide structure where a real application needs structure, while staying close to the underlying web platform.

And because I was using Nutin to build actual applications, its development continued to be driven by actual problems.

That was useful.

It also created a trap.

## When useful becomes too much

The easiest way for a toolkit to grow is to keep adding things.

A feature solves a problem. Then another feature makes a different problem easier. A utility makes sense. A library looks useful. An abstraction cleans up a particular case.

Individually, these decisions can all be reasonable.

The problem appears when you look at them together.

Nutin became increasingly capable. It accumulated more abstractions, more libraries and more ways of doing things.

Some of them were genuinely useful. Some solved problems I had encountered. Others were technically interesting or convenient to have.

But usefulness alone wasn't enough.

The original goal had never been to build the most capable frontend toolkit possible.

It had been to make application development more structured **without introducing unnecessary machinery**.

By version 1.3.1, Nutin had become a capable toolkit.

It had also started drifting away from the reason it existed.

That was the point where adding another feature no longer felt like the obvious way forward.

The more important question became:

**Does this belong here at all?**

## The road to 2.0

Nutin 2.0 grew out of that question.

Instead of asking what else the toolkit could do, I went back through it and asked what it actually needed to do.

Some things stayed.

Some things were simplified.

Some things were removed completely.

That included features that worked perfectly well. Their problem wasn't necessarily implementation quality. They simply didn't justify the additional concepts, APIs and maintenance they introduced.

This was an important distinction.

Removing something isn't admitting that it was badly built.

Sometimes it means recognizing that it shouldn't have been built in the first place.

The result is a very different kind of major version.

Nutin 2.0 isn't primarily an expansion of Nutin 1.x. It is a deliberate reduction.

**The goal wasn't to make Nutin capable of more things. It was to make the things Nutin does more focused.**

## What remained

The parts that survived are the parts that still make sense when viewed through the original constraint.

Components provide structure for reusable UI.

Views provide a place to orchestrate application-level concerns.

Routing connects the application to URLs and navigation.

Events provide explicit communication between otherwise independent pieces.

Pipes handle transformations without requiring a larger state or rendering system.

And underneath all of it is still the browser.

Nutin doesn't try to replace HTML, CSS or JavaScript. It gives them a structure in which they can be used to build a larger application without requiring the application to adopt an entirely different programming model.

That is also why Nutin is intentionally unopinionated about many things.

You can use the browser APIs directly.

You can use SASS or Tailwind.

You can bring in another library when you actually need one.

You don't have to give up the tools you already know simply because your application has a Nutin component.

The framework is there to provide structure, not to become the environment in which everything else has to live.

## A framework built by using it

Looking back, the most important part of Nutin's history isn't any particular API.

It's how those APIs came to exist.

Nutin wasn't designed in isolation and then tested against imaginary applications. It was built by using it.

The problems came first. The abstractions came afterward.

That doesn't mean every decision was perfect. In fact, the history of Nutin is partly a record of decisions that eventually needed to be reconsidered.

But that process is useful.

It provides a way to distinguish between an abstraction that solves a real recurring problem and one that merely seems like a good idea.

And it provides a useful constraint for the future:

**Nutin should only grow when real problems give it a reason to grow.**

## Why Nutin

There are already many excellent frontend frameworks.

Nutin doesn't exist because the web needed another way to render a button.

It exists because there is a useful middle ground between writing every piece of application infrastructure yourself and adopting a large framework with its own rendering model, state model, conventions and ecosystem.

A small application may not need much structure.

A larger application probably needs more.

But needing structure doesn't necessarily mean needing an entirely different way to build for the web.

That's the space Nutin occupies.

It provides enough structure to make a TypeScript application easier to organize, test and evolve, while leaving the underlying platform visible and usable.

And perhaps that's the simplest way to explain its history.

Nutin started because I wanted to build an application without a frontend framework.

It grew because the application presented real problems.

It became too complicated because solving problems can become a problem of its own.

And version 2 exists because sometimes the best way to move a project forward is to remove things rather than add them.

**Nutin is smaller today not because fewer features are inherently better, but because every abstraction should have a reason to be there.**
