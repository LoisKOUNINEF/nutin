import nutinConfig from '../../nutin.config.js';
import seo from '../../config/seo.json' with { type: 'json' };

// nutin.config.js "i18n": a list of language codes (the first is the default; [] turns i18n off),
// or a boolean. `true` lists no language, so it means English only (the build warns about it).
const FALLBACK_LANGUAGES: string[] = ['en'];
const i18nOption = nutinConfig.i18n;
const languages = Array.isArray(i18nOption) && i18nOption.length > 0 ? i18nOption : FALLBACK_LANGUAGES;

export const CONFIG = {
  langs: { languages, defaultLanguage: languages[0] as string },
  seo,
  generateSEOFiles: nutinConfig.generateSEOFiles,
  i18n: Array.isArray(i18nOption) ? i18nOption.length > 0 : Boolean(i18nOption),
} as const;
