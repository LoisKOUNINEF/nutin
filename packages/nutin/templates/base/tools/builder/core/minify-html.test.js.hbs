// Importing this module also runs its top-level minifyInlineHTML() call (a
// fire-and-forget IIFE that scans dist-build/src/app for inline templates to
// minify). That's inert here: dist-build/ no longer exists once the build has
// renamed it to dist/, so it resolves immediately with nothing to do.
import { minifyHTML } from './minify-html.js';

describe('minifyHTML', () => {
  it('collapses whitespace and strips comments', async () => {
    const html = '<div>\n  <!-- comment -->\n  <span>  hi  </span>\n</div>';

    expect(await minifyHTML(html)).toBe('<div><span>hi</span></div>');
  });

  it('minifies inline <script> content and drops the redundant type attribute', async () => {
    const html = '<script type="text/javascript">var x=1;</script>';

    expect(await minifyHTML(html)).toBe('<script>var x=1</script>');
  });
});
