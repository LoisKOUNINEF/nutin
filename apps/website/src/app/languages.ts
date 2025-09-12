// Used in src/core/services/i18n.ts

export const LANGUAGES = ['en', 'fr'] as const;
export const DEFAULT_LANGUAGE: Language = 'en' as const;

export type Language = typeof LANGUAGES[number];
export type Translations = Record<string, any>;
