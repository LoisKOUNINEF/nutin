import process from 'process';
import nutinConfig from '../../nutin.config.js';
import { errorExit } from '../utils/index.js';
// Validates "i18n" on load (an invalid value stops the build there).
import { I18N_ENABLED, LANGUAGES, DEFAULT_LANGUAGE, I18N_LISTS_NO_LANGUAGE } from '../utils/languages.js';

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

// `build:prod` passes --prod rather than a NODE_ENV=production prefix, which Windows shells don't understand. 
// Every build step is a separate process that only inherits the env , so the flag is turned into NODE_ENV here.
if (process.argv.includes('--prod')) process.env.NODE_ENV = 'production';
// `typecheck` (builder.js --typecheck): the same handoff, for compile-ts.js.
if (process.argv.includes('--typecheck')) process.env.NUTIN_TYPECHECK = '1';

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
  typecheckOnly: process.env.NUTIN_TYPECHECK === '1',
  // "i18n" resolved (see utils/languages.js): `i18n: []` is off, though an empty array is truthy.
  i18n: I18N_ENABLED,
  languages: LANGUAGES,
  defaultLanguage: DEFAULT_LANGUAGE,
  i18nListsNoLanguage: I18N_LISTS_NO_LANGUAGE,
  markdownSources: nutinConfig.markdownSources,
  tailwind: nutinConfig.tailwind,
  generateSEO: nutinConfig.generateSEOFiles,
  WELL_KNOWN_NON_SEO_ROUTES: wellKnownNonSEORoutes,
};
