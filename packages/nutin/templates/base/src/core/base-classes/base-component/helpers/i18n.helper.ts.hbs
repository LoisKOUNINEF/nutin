import { I18nService } from '../../../services/i18n/i18n.js';
import { CONFIG } from '../../../config.js';
import * as DomHelper from './dom.helper.js';

export function parseI18nAttributes(element: HTMLElement): void {
  element.querySelectorAll('[data-i18n]').forEach(el => {
    // Nested components translate their own content.
    if (DomHelper.isInsideNestedComponent(el, element)) return;
    const key = el.getAttribute('data-i18n')!;
    setTranslatedContent(el, key);
  });
  localizeLinks(element);
}

// With i18n, every page lives under a language prefix: a root-relative link ("/docs") is
// rewritten to the page's canonical URL ("/en/docs/") so prerendered HTML and copied links
// don't point at an unlocalized duplicate. The router strips the prefix again on navigation.
function localizeLinks(element: HTMLElement): void {
  if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
    element.querySelectorAll('a[href]').forEach(el => {
      // Nested components localize their own links.
      if (DomHelper.isInsideNestedComponent(el, element)) return;
      const localized = localizedHref(el.getAttribute('href')!);
      if (localized !== null) el.setAttribute('href', localized);
    });
  }
}

// null when the href isn't an unprefixed app path: external, protocol-relative, relative,
// a file (has an extension), or already localized.
function localizedHref(href: string): string | null {
  if (!href.startsWith('/') || href.startsWith('//')) return null;

  const end = href.search(/[?#]/);
  const path = end === -1 ? href : href.slice(0, end);
  const rest = end === -1 ? '' : href.slice(end);
  const segments = path.split('/').filter(Boolean);
  if (segments[segments.length - 1]?.includes('.')) return null;
  if (segments[0] && I18nService.languages.includes(segments[0] as Nutin.Language)) return null;

  const suffix = segments.length ? `/${segments.join('/')}` : '';
  return `/${I18nService.currentLanguage}${suffix}/${rest}`;
}

function setTranslatedContent(
  el: Element, 
  key: string
): void {
  // With i18n off, apply translate()'s own no-translation fallback without
  // referencing I18nService, so prod builds can drop the service entirely.
  const text = (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n)
    ? I18nService.translate(key, el.textContent)
    : el.textContent || key;

  if (el instanceof HTMLInputElement) {
    el.placeholder = text;
  } else {
    el.textContent = text;
  }
}
