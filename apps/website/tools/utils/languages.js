import nutinConfig from '../../nutin.config.js';
import { errorExit } from './error-exit.js';

// nutin.config.js "i18n": a list of language codes, the first being the default ([] turns i18n
// off), or a boolean. `true` lists no language: English only (the build warns about it).
export const FALLBACK_LANGUAGES = ['en'];

// Language codes end up in URLs (/<lang>/...), file names (locales/<lang>.json) and nginx rules.
const LANGUAGE_CODE = /^[A-Za-z0-9-]+$/;

// Why an "i18n" value is invalid, or null when it's valid.
export function i18nOptionError(option) {
  if (option === undefined || typeof option === 'boolean') return null;
  if (!Array.isArray(option)) {
    return `nutin.config.js "i18n" must be a list of language codes (e.g. ['en', 'fr']), [] or a boolean — got ${JSON.stringify(option)}.`;
  }
  const invalid = option.find((code) => typeof code !== 'string' || !LANGUAGE_CODE.test(code));
  if (invalid !== undefined) {
    return `nutin.config.js "i18n": invalid language code ${JSON.stringify(invalid)} — use letters, digits and "-" only (e.g. "en", "pt-BR").`;
  }
  const duplicate = option.find((code, index) => option.indexOf(code) !== index);
  if (duplicate !== undefined) return `nutin.config.js "i18n" lists "${duplicate}" more than once.`;
  return null;
}

export function resolveI18n(option) {
  const languages = Array.isArray(option) && option.length > 0 ? [...option] : [...FALLBACK_LANGUAGES];
  return {
    enabled: Array.isArray(option) ? option.length > 0 : Boolean(option),
    languages,
    defaultLanguage: languages[0],
  };
}

const optionError = i18nOptionError(nutinConfig.i18n);
if (optionError) errorExit(new Error(optionError), 'languages');

const resolved = resolveI18n(nutinConfig.i18n);

export const I18N_ENABLED = resolved.enabled;
export const LANGUAGES = resolved.languages;
export const DEFAULT_LANGUAGE = resolved.defaultLanguage;
// `i18n: true`: on, but with no language listed.
export const I18N_LISTS_NO_LANGUAGE = nutinConfig.i18n === true;
