# FAQ

<details>
<summary style="color:var(--primary);font-size:1.2rem;padding:.5rem;">How big is a Nutin application?</summary>
<div style="padding-left:1rem;">
<p>A freshly generated application, built for production with the default options, ships about <strong>31 KB of minified JavaScript, about 10 KB gzipped</strong>.</p>

<p>Nutin has no runtime dependencies, so the only third-party code you ship is the one you add.</p>
</div>
</details>

<details>
<summary style="color:var(--primary);font-size:1.2rem;padding:.5rem;">Does Nutin use a virtual DOM?</summary>
<div style="padding-left:1rem;">
<p>No. Components render HTML templates directly into the DOM, when you ask them to.</p>
</div>
</details>

<details>
<summary style="color:var(--primary);font-size:1.2rem;padding:.5rem;">Can I use other libraries with Nutin?</summary>
<div style="padding-left:1rem;">
<p>Yes. Nutin works with the DOM and browser APIs directly, so most libraries work as they would in a vanilla application. See the <a href="https://nutin.org/guides/a11y-elements">a11y-elements</a> and <a href="https://nutin.org/guides/alpinejs">AlpineJS</a> guides.</p>
</div>
</details>

<details>
<summary style="color:var(--primary);font-size:1.2rem;padding:.5rem;">How is Nutin different from htmx?</summary>
<div style="padding-left:1rem;">
<p>In htmx, attributes let any element request HTML from the server and swap it into the page.<br/>The browser mostly displays what it receives.</p>

<p>Nutin works on the client side: the application renders its own HTML and can be served as static files.</p>

<p>If you already have a server that renders HTML (Django, Rails, Laravel, Go), htmx is a natural fit.<br/>If the interface lives in the browser, Nutin gives that client-side code a structure.</p>
</div>
</details>

<details>
<summary style="color:var(--primary);font-size:1.2rem;padding:.5rem;">How is Nutin different from Lit?</summary>
<div style="padding-left:1rem;">
<p>Lit focuses on components. The application around them is left to you or to other packages.</p>

<p>Nutin provides that application structure, and its components are plain classes rendering plain HTML templates into the light DOM. Rendering is explicit rather than driven by reactive properties. See <a href="https://nutin.org/docs/api/what-is-a-component">Why aren't components Web Components?</a>.</p>

<p>The elements you build with Lit can also be used inside a Nutin application.</p>
</div>
</details>

<details>
<summary style="color:var(--primary);font-size:1.2rem;padding:.5rem;">Isn't "your app owns the framework" what shadcn/ui does?</summary>
<div style="padding-left:1rem;">
<p>shadcn/ui is a collection of React components. Its CLI copies their source code into your project, so you can read and change your buttons and dialogs. React itself remains a regular dependency.</p>

<p>Nutin applies the same idea to the framework layer itself.<br/>Its core, its build tools and its development tools are generated into your project. When a new version comes out, <a href="https://nutin.org/docs/tools/updater"><code>nutin-update</code></a> updates the files you haven't changed, and gives you a diff to merge for the ones you did.</p>
</div>
</details>
