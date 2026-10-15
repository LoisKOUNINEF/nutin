import nutinConfig from '../../../nutin.config.js';
import { I18nService } from '../../core/index.js';

// i18n hooks of the markdown feature. Each I18nService use sits behind core's guard
// (`globalThis.__NUTIN_I18N__` is set by the builder), so bundles without i18n drop it.
// A block rather than an early return: esbuild only drops a constant-false block.

// The current language, or null without i18n (one manifest per source then).
export function markdownLanguage(): string | null {
  if (globalThis.__NUTIN_I18N__ ?? nutinConfig.i18n) {
    return I18nService.currentLanguage;
  }
  return null;
}

// A UI string from the "markdown" translations (src/app/markdown/locales/<lang>.json),
// or `fallback` without i18n or without a translation.
export function markdownText(key: string, fallback: string): string {
  if (globalThis.__NUTIN_I18N__ ?? nutinConfig.i18n) {
    return I18nService.translate(`markdown.${key}`, fallback);
  }
  return fallback;
}

// Calls `callback` after each language change; returns the unsubscribe function.
export function onMarkdownLanguageChange(callback: () => void): () => void {
  if (globalThis.__NUTIN_I18N__ ?? nutinConfig.i18n) {
    return I18nService.onLanguageChange(callback);
  }
  return () => {};
}
