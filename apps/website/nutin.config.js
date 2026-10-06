export default {
  // Nutin options
  tailwind: false,         // Enable Tailwind CSS v4
  i18n: true,             // Enable i18n; configure languages in config/languages.json
  generateSEOFiles: true, // Generate per-route HTML, robots.txt and sitemap.xml; configure SEO data in config/seo.json

// Nutin features
  markdownSources: {       // Markdown folders compiled to /generated/<name>.<lang>.json at build time
    sourceFolders: [
      {
        folder: '../../resources/docs',
        routePrefix: 'docs',
        landing: { title: 'Documentation' },
        hubFiles: ['API.md', 'OPTIONS_AND_FEATURES.md', 'TESTING.md', 'TOOLS.md'],
        sectionInPath: true,
        prefixReplacements: [['HOWDOI_', ''], ['WHATARE_', 'what-are-'], ['WHATIS_', 'what-is-'], ['WHAT_', 'what-']],
      },
      { folder: '../../resources/changelog', routePrefix: 'changelog', hubFiles: ['CHANGELOG.md'] },
      { folder: '../../resources/tutorial', routePrefix: 'tutorial', hubFiles: ['TUTORIAL.md'] },
      { folder: '../../resources/articles', routePrefix: 'articles', hubFiles: ['ARTICLES.md'] },
      { folder: '../../resources/guides', routePrefix: 'guides', hubFiles: ['GUIDES.md'] },
    ],
  },
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
      target: ['es2020'],
      drop: ['console', 'debugger'],
    },
  },

  // Testing toolkit
  // `npm run testin-nutin`
  testinNutin: {
    includeFramework: true,  // Test Nutin source - src/core
    includeTools: false,     // Test tools/ (builder, testin-nutin, etc.)
    includeApp: true,       // Include application tests

    coverage: {
      enabled: true,        // Include coverage in the normal test command
      threshold: 85,         // Fail if any global coverage metric falls below this threshold
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
