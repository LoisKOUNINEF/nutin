export default {
  // Nutin options
  tailwind: false,         // Enable Tailwind CSS v4
  i18n: true,             // Enable i18n; configure languages in config/languages.json
  generateSEOFiles: true, // Generate per-route HTML, robots.txt and sitemap.xml; configure SEO data in config/seo.json

// Nutin features
  dockerPorts: [9090, 9091],     // Ports the Docker container exposes/listens on — edit as needed
  
  // Components / Views scaffolding
  generator: {
    generateStylesheet: true, // Generate a .scss file alongside each component or view
    generateLocales: true,    // Generate locale files alongside components and views (requires i18n)
    generateTest: true,       // Generate test files alongside components, views and services (requires testinNutin.includeApp)
  },

  // Build pipeline
  builder: {
    sass: {
      paths: [
        'base',
        'core',
      ], // Directories in styles/ to include in the Sass load path
    },

    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: false,
      target: ['es2015'],
      drop: ['console', 'debugger'],
    },
  },

  // Testing toolkit
  // `npm run testin-nutin`
  testinNutin: {
    includeFramework: true,  // Test Nutin source - src/core
    includeTools: true,     // Test tools/ (builder, testin-nutin, etc.)
    includeApp: true,       // Include application tests

    coverage: {
      enabled: false,        // Include coverage in the normal test command
      threshold: 95,         // Fail if any global coverage metric falls below this threshold
      reportUncovered: true, // Generate a report of uncovered lines, functions and branches
    },

    jsdomOptions: {
      runScripts: false,
      resources: false,
      freezeGlobals: false,
      pretendToBeVisual: true,
    },
  },
}
