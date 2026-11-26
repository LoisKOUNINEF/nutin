// `--extension [surface]`: a browser extension project instead of a web app.
// The first surface is the default.
export const EXTENSION_SURFACES = ['side-panel', 'popup'];

// Base templates an extension project doesn't get.
// Its page only ever shows index.html, which no route matches. It also can't run on a dev server.
// Nor does it have SEO pages or i18n, which its build refuses, nor compressed files.
export const NOT_IN_EXTENSIONS = [
  'src/app/routes.ts.hbs',
  'src/app/guards.ts.hbs',
  'src/app/views/',          // home and not-found
  'src/assets/images/',      // the logos those views show
  'tools/dev/',              // serve, dev-serve and the watcher
  'config/',                 // seo.json, the router's page titles: no router, and SEO is off
  'tools/builder/core/seo/', // SEO pages, robots.txt, sitemap.xml and their prerendering (ssr/)
  'tools/builder/core/i18n/', // locale bundling
  'tools/builder/core/prod-bundle/compress-files.js.hbs', // .gz/.br copies
  'tools/builder/core/prod-bundle/hash-data-files.js.hbs', // hashed locales/markdown URLs, for nginx's cache
  'tools/builder/core/app/validate-routes.js.hbs', // no routes (route-keys.js stays: validate-html uses it)
];

// Features that can't be added to an extension project, and why.
export const EXTENSION_INCOMPATIBLE_FEATURES = {
  docker: 'an extension has no server to containerize',
  markdown: 'its pages need the router, which extension pages don\'t use',
};
