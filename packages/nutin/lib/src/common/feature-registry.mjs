// Single source of truth for the optional, additive features under templates/features
export const FEATURES = [
  {
    key: 'nutinMixins',
    cli: 'nutin-mixins',
    scssForward: '@forward "nutin-mixins";',
  },
  {
    key: 'accessibilityComponents',
    cli: 'accessibility-components',
    tsExport: "export * from './accessibility-components/index.js';",
    scssForward: '@forward "accessibility-components";',
  },
  {
    key: 'overlays',
    cli: 'overlays',
    tsExport: "export * from './overlays/index.js';",
    scssForward: '@forward "overlays";',
  },
  {
    key: 'forms',
    cli: 'forms',
    tsExport: "export * from './forms/index.js';",
    scssForward: '@forward "forms";',
  },
  {
    key: 'docker',
    cli: 'docker',
  },
];

export function findFeatureByCli(cliName) {
  return FEATURES.find((feature) => feature.cli === cliName);
}

export const LIB_FEATURE_KEYS = FEATURES.filter((feature) => feature.scssForward).map((feature) => feature.key);
