# How do I use Tailwind CSS?

## Enable option

Only supports **Tailwind CSS v4**.

```js
// nutin.config.js
export default {
  tailwind: true,
  // ...
}
```

## Install dependencies

When they're missing, a dev build (`<pm> run build`) in a terminal offers to install Tailwind CSS v4 dependencies. Outside a terminal (CI, the `dev` watcher), it fails unless you pass `-- -y` (or set `NUTIN_ASSUME_YES=1`) to install them automatically. `build:prod` never installs them.

Or you can install them manually as devDependencies

```bash
{ name: 'tailwindcss', version: '^4.3.0' },
{ name: '@tailwindcss/cli', version: '^4.3.0' }
```

## Tailwind import file

```css
/* styles/tailwind.css */
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```
