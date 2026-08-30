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

You can run `npm run build` to install Tailwind CSS v4 dependencies automatically.

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
