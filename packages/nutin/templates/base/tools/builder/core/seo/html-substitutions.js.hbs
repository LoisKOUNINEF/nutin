export function escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Replacements go through functions: a replacement *string* would expand `$&`, `$'`
// etc. found in a title/description, copying raw page HTML into the tag.
// `replacement` receives the match's capture groups.
export function upsertInHead(html, pattern, replacement, fullTag) {
  if (pattern.test(html)) {
    return html.replace(pattern, (_match, ...groups) => replacement(...groups));
  }
  return insertBeforeHeadEnd(html, fullTag);
}

function insertBeforeHeadEnd(html, tag) {
  return html.replace('</head>', () => `\n    ${tag}\n  </head>`);
}

export function applySubstitutions(template, lang, title, description, pageUrl, ogImage, hreflangLinks = []) {
  let html = template;

  // lang attribute on <html>
  if (/(<html[^>]*\slang=)["'][^"']*["']/.test(html)) {
    html = html.replace(/(<html[^>]*\slang=)["'][^"']*["']/, (_m, start) => `${start}"${escape(lang)}"`);
  } else {
    html = html.replace(/<html/, () => `<html lang="${escape(lang)}"`);
  }

  // <title>
  html = upsertInHead(html,
    /(<title>)[^<]*(<\/title>)/,
    (start, end) => `${start}${escape(title)}${end}`,
    `<title>${escape(title)}</title>`
  );

  // <meta name="description"> — replace all occurrences, or insert one
  const descPattern = /(<meta\s+name=["']description["']\s+content=)["'][^"']*["']/;
  if (descPattern.test(html)) {
    html = html.replace(/(<meta\s+name=["']description["']\s+content=)["'][^"']*["']/g, (_m, start) => `${start}"${escape(description)}"`);
  } else {
    html = insertBeforeHeadEnd(html, `<meta name="description" content="${escape(description)}" />`);
  }

  // <link rel="canonical">
  html = upsertInHead(html,
    /(<link\s+rel=["']canonical["']\s+href=)["'][^"']*["']/,
    (start) => `${start}"${escape(pageUrl)}/"`,
    `<link rel="canonical" href="${escape(pageUrl)}/" />`
  );

  // og:url
  html = upsertInHead(html,
    /(<meta\s+property=["']og:url["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"${escape(pageUrl)}/"`,
    `<meta property="og:url" content="${escape(pageUrl)}/" />`
  );

  // hreflang alternates — one per active language plus x-default, so crawlers see
  // these URLs as language variants of the same page rather than duplicate content
  if (hreflangLinks.length > 0) {
    const altTags = hreflangLinks
      .map(({ hreflang, href }) => `<link rel="alternate" hreflang="${escape(hreflang)}" href="${escape(href)}" />`)
      .join('\n    ');
    html = insertBeforeHeadEnd(html, altTags);
  }

  // og:title
  html = upsertInHead(html,
    /(<meta\s+property=["']og:title["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"${escape(title)}"`,
    `<meta property="og:title" content="${escape(title)}" />`
  );

  // og:description
  html = upsertInHead(html,
    /(<meta\s+property=["']og:description["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"${escape(description)}"`,
    `<meta property="og:description" content="${escape(description)}" />`
  );

  // twitter:title
  html = upsertInHead(html,
    /(<meta\s+name=["']twitter:title["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"${escape(title)}"`,
    `<meta name="twitter:title" content="${escape(title)}" />`
  );

  // twitter:description
  html = upsertInHead(html,
    /(<meta\s+name=["']twitter:description["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"${escape(description)}"`,
    `<meta name="twitter:description" content="${escape(description)}" />`
  );

  // og:type
  html = upsertInHead(html,
    /(<meta\s+property=["']og:type["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"website"`,
    `<meta property="og:type" content="website" />`
  );

  // twitter:card — required for Twitter/X to render an image card at all
  html = upsertInHead(html,
    /(<meta\s+name=["']twitter:card["']\s+content=)["'][^"']*["']/,
    (start) => `${start}"summary_large_image"`,
    `<meta name="twitter:card" content="summary_large_image" />`
  );

  // og:image + twitter:image — only when explicitly provided in route config
  if (ogImage) {
    html = upsertInHead(html,
      /(<meta\s+property=["']og:image["']\s+content=)["'][^"']*["']/,
      (start) => `${start}"${escape(ogImage)}"`,
      `<meta property="og:image" content="${escape(ogImage)}" />`
    );
    html = upsertInHead(html,
      /(<meta\s+name=["']twitter:image["']\s+content=)["'][^"']*["']/,
      (start) => `${start}"${escape(ogImage)}"`,
      `<meta name="twitter:image" content="${escape(ogImage)}" />`
    );
  }

  return html;
}
