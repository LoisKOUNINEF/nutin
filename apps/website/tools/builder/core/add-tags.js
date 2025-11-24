import { print, isProd } from '../../utils/index.js';
import { writeFile } from 'fs/promises';

export async function addTags(htmlContent, filePath) {
  const scriptSrc = isProd ? "bundle.js" : "app/main.js";
  
  const tags = [
    { type: 'stylesheet', href: 'main.css', position: 'head' },
    { type: 'script', src: scriptSrc, position: 'body' }
  ];

  let modifiedHtml = htmlContent;
  
  for (const tag of tags) {
    modifiedHtml = addTag(modifiedHtml, tag);
  }

  await writeFile(filePath, modifiedHtml, "utf8");

  return modifiedHtml;
}

function addTag(htmlContent, { type, src, href, position }) {
  if (type !== 'stylesheet' && type !== 'script') return htmlContent;

  const tagMap = {
    script: `<script type="module" src="/${src}"></script>`,
    stylesheet: `<link rel="stylesheet" href="/${href}">`
  };

  const positionMap = {
    body: { regex: /<\/body>/i, replacement: (tag) => `${tag}</body>` },
    head: { regex: /<\/head>/i, replacement: (tag) => `${tag}</head>`, fallback: /<title>/i }
  };

  const tag = tagMap[type];
  const pos = positionMap[position];

  if (pos.regex.test(htmlContent)) {
    return htmlContent.replace(pos.regex, pos.replacement(tag));
  } else if (pos.fallback && pos.fallback.test(htmlContent)) {
    return htmlContent.replace(pos.fallback, `${tag}<title>`);
  }
  
  return htmlContent + tag;
}
