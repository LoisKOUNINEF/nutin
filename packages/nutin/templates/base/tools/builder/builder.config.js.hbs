import process from 'process';
import nutinConfig from '../../nutin.config.js';
import { errorExit } from '../utils/index.js';

function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    errorExit(new Error('nutin.config.js must export a default object.'), 'builder.config');
  }
  if (!config.builder || typeof config.builder !== 'object') {
    errorExit(new Error('nutin.config.js is missing the required "builder" object.'), 'builder.config');
  }
  if (!Array.isArray(config.builder.sass?.paths)) {
    errorExit(new Error('nutin.config.js is missing "builder.sass.paths" (expected an array).'), 'builder.config');
  }
  if (!config.builder.esbuild || typeof config.builder.esbuild !== 'object') {
    errorExit(new Error('nutin.config.js is missing the required "builder.esbuild" object.'), 'builder.config');
  }
}

validateConfig(nutinConfig);

// `build:prod` passes --prod rather than a NODE_ENV=production prefix, which Windows shells
// don't understand. Every build step is a separate process that only inherits the env (see
// runScript), so the flag is turned into NODE_ENV here, for them and for this process.
if (process.argv.includes('--prod')) process.env.NODE_ENV = 'production';

const wellKnownNonSEORoutes = [
  '/400',
  '/401',
  '/403',
  '/404',
  '/500',
  '/502',
  '/503',
  '/504',
]

export const builderConfig = {
  ...nutinConfig.builder,
  isProd: process.env.NODE_ENV === 'production',
  i18n: nutinConfig.i18n,
  markdownSources: nutinConfig.markdownSources,
  tailwind: nutinConfig.tailwind,
  generateSEO: nutinConfig.generateSEOFiles,
  WELL_KNOWN_NON_SEO_ROUTES: wellKnownNonSEORoutes,
};
