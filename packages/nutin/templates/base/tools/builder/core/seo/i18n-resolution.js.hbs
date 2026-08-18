// Collapses a per-lang-object-or-flat value down to one language, falling back to the
// first available value if the exact key is missing. Used when i18n is off, where a route
// may still be authored as a per-lang object (e.g. the default seo.json.hbs) or a flat value.
export function resolveLocaleValue(value, defaultLanguage) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[defaultLanguage] ?? Object.values(value)[0];
  }
  return value;
}

// Used when i18n is on: a per-lang object must have an exact entry for `lang` (no silent
// fallback to another language), while a flat value is applied uniformly to every language.
function valueForLang(value, lang) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value[lang] : value;
}

// Used to actually resolve HTML content when i18n is on: falls back to defaultLanguage (then
// the first available value) when `lang` has no exact entry, mirroring resolveLocaleValue's
// fallback. Missing translations become a warning (see collectI18nSeoIssues), not a crash.
export function valueForLangWithFallback(value, lang, defaultLanguage) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] ?? value[defaultLanguage] ?? Object.values(value)[0];
  }
  return value;
}

// Which language's value valueForLangWithFallback would actually use for `lang`, given the
// same value[lang] ?? value[defaultLanguage] ?? Object.values(value)[0] precedence — so
// warnings can name the real source language instead of assuming defaultLanguage.
function sourceLangFor(value, lang, defaultLanguage) {
  if (value[lang]) return lang;
  if (value[defaultLanguage]) return defaultLanguage;
  return Object.keys(value).find((key) => value[key]);
}

// Upfront pass over every route x lang x field, run before the (expensive) SSR bundle build.
// Buckets each combination into a fallback warning (some language has content, this one
// doesn't) or a hard error (no language has any content for this field on this route).
export function collectI18nSeoIssues(routes, languages, defaultLanguage) {
  const fallbacks = [];
  const missing = [];
  const noLocalization = [];

  for (const route of routes) {
    for (const field of ['title', 'description']) {
      const value = route[field];

      if (value && typeof value !== 'object') {
        noLocalization.push({ path: route.path, field });
      }

      for (const lang of languages) {
        if (valueForLang(value, lang)) continue;

        const sourceLang = value && typeof value === 'object' ? sourceLangFor(value, lang, defaultLanguage) : undefined;
        if (sourceLang) {
          fallbacks.push({ path: route.path, field, lang, sourceLang });
        } else {
          missing.push({ path: route.path, field, lang });
        }
      }
    }
  }

  return { fallbacks, missing, noLocalization };
}
