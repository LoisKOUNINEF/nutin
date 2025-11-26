import { minify } from 'html-minifier-terser';

export async function minifyHTML(html) {
  return minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    keepClosingSlash: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

