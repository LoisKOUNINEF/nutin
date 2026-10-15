// Language codes end up in an nginx regex and redirect target: letters, digits and "-" only (e.g. "pt-BR").
const LANGUAGE_CODE = /^[A-Za-z0-9-]+$/;

// Only i18n builds serve every page under a language prefix — without it, "/" and every
// other path are real pages, and nothing is redirected.
export function localeRedirects({ i18n, languages, defaultLanguage }) {
  if (!i18n) return '';

  [defaultLanguage, ...languages].forEach((lang) => {
    if (typeof lang !== 'string' || !LANGUAGE_CODE.test(lang)) {
      throw new Error(`config/languages.json: invalid language code ${JSON.stringify(lang)} — use letters, digits and "-" only (e.g. "en", "pt-BR").`);
    }
  });

  // Unprefixed app paths (old or external links like "/docs") get a 301 to the default
  // language instead of a 200 SPA shell that duplicates the real page. Paths with a "."
  // (robots.txt, sitemap.xml, assets) are left to the other locations. $request_uri is
  // the raw request (query included): the decoded $uri could inject headers via %0D%0A.
  return [
    `location = / {`,
    `        return 301 /${defaultLanguage}/$is_args$args;`,
    `    }`,
    ``,
    `    location ~ ^/(?!(?:${languages.join('|')})(?:/|$))[^.]*$ {`,
    `        return 301 /${defaultLanguage}$request_uri;`,
    `    }`,
  ].join('\n');
}
