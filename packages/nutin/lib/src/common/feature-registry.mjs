// Single source of truth for the optional, additive features under templates/features
export const FEATURES = [
  {
    key: 'docker',
    cli: 'docker',
  },
  {
    key: 'markdown',
    cli: 'markdown',
  },
];

export function findFeatureByCli(cliName) {
  return FEATURES.find((feature) => feature.cli === cliName);
}
