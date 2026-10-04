import { CONFIG } from '../../config.js';

export const LANGUAGES = CONFIG.langs.languages;
export const DEFAULT_LANGUAGE = CONFIG.langs.defaultLanguage as (typeof LANGUAGES)[number];

