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
  inlineTemplates: nutinConfig.inlineTemplates,
  i18n: nutinConfig.i18n,
  tailwind: nutinConfig.tailwind,
  generateSEO: nutinConfig.generateSEOFiles,
  WELL_KNOWN_NON_SEO_ROUTES: wellKnownNonSEORoutes,
};
