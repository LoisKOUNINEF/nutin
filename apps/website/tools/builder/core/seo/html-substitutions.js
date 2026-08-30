export function escape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function upsertInHead(html, pattern, replacement, fullTag) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace('</head>', `\n    ${fullTag}\n  </head>`);
}

export function applySubstitutions(template, lang, title, description, pageUrl, ogImage) {
  let html = template;

  // lang attribute on <html>
  if (/(<html[^>]*\slang=)["'][^"']*["']/.test(html)) {
    html = html.replace(/(<html[^>]*\slang=)["'][^"']*["']/, `$1"${lang}"`);
  } else {
    html = html.replace(/<html/, `<html lang="${lang}"`);
  }

  // <title>
  html = upsertInHead(html,
    /(<title>)[^<]*(<\/title>)/,
    `$1${escape(title)}$2`,
    `<title>${escape(title)}</title>`
  );

  // <meta name="description"> — replace all occurrences, or insert one
  const descPattern = /(<meta\s+name=["']description["']\s+content=)["'][^"']*["']/;
  if (descPattern.test(html)) {
    html = html.replace(/(<meta\s+name=["']description["']\s+content=)["'][^"']*["']/g, `$1"${escape(description)}"`);
  } else {
    html = html.replace('</head>', `\n    <meta name="description" content="${escape(description)}" />\n  </head>`);
  }

  // <link rel="canonical">
  html = upsertInHead(html,
    /(<link\s+rel=["']canonical["']\s+href=)["'][^"']*["']/,
    `$1"${pageUrl}/"`,
    `<link rel="canonical" href="${pageUrl}/" />`
  );

  // og:url
  html = upsertInHead(html,
    /(<meta\s+property=["']og:url["']\s+content=)["'][^"']*["']/,
    `$1"${pageUrl}/"`,
    `<meta property="og:url" content="${pageUrl}/" />`
  );

  // og:title
  html = upsertInHead(html,
    /(<meta\s+property=["']og:title["']\s+content=)["'][^"']*["']/,
    `$1"${escape(title)}"`,
    `<meta property="og:title" content="${escape(title)}" />`
  );

  // og:description
  html = upsertInHead(html,
    /(<meta\s+property=["']og:description["']\s+content=)["'][^"']*["']/,
    `$1"${escape(description)}"`,
    `<meta property="og:description" content="${escape(description)}" />`
  );

  // twitter:title
  html = upsertInHead(html,
    /(<meta\s+name=["']twitter:title["']\s+content=)["'][^"']*["']/,
    `$1"${escape(title)}"`,
    `<meta name="twitter:title" content="${escape(title)}" />`
  );

  // twitter:description
  html = upsertInHead(html,
    /(<meta\s+name=["']twitter:description["']\s+content=)["'][^"']*["']/,
    `$1"${escape(description)}"`,
    `<meta name="twitter:description" content="${escape(description)}" />`
  );

  // og:image + twitter:image — only when explicitly provided in route config
  if (ogImage) {
    html = upsertInHead(html,
      /(<meta\s+property=["']og:image["']\s+content=)["'][^"']*["']/,
      `$1"${escape(ogImage)}"`,
      `<meta property="og:image" content="${escape(ogImage)}" />`
    );
    html = upsertInHead(html,
      /(<meta\s+name=["']twitter:image["']\s+content=)["'][^"']*["']/,
      `$1"${escape(ogImage)}"`,
      `<meta name="twitter:image" content="${escape(ogImage)}" />`
    );
  }

  return html;
}
