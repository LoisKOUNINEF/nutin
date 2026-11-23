import { NUTIN_CONFIG_FILE, prepareConfigForMerge } from './i18n-migration.mjs';

// The line AGENTS.md records the nutin version in, the same in every 3.x template.
const VERSION_LINE_RE = /^This project was generated with Nutin [^\n]*$/m;

// AGENTS.md as the update compares and merges it: the new version's line in place of yours and of
// the old template's. A file that only differs by that line (written by another nutin version than
// .nutin-meta.json records) is then untouched, and your edits next to it merge without a conflict.
export function alignVersionLine({ actual, base, next }) {
  const yours = actual.match(VERSION_LINE_RE)?.[0];
  const original = base.match(VERSION_LINE_RE)?.[0];
  const updated = next.match(VERSION_LINE_RE)?.[0];
  if (!yours || !original || !updated) return { actual, base };
  return {
    actual: actual.replace(yours, () => updated),
    base: base.replace(original, () => updated),
  };
}

// The TemplateDiffer's `prepare`: per file, the contents compared and merged.
export function buildMergePreparer({ i18nMigration = null } = {}) {
  return (relPath, contents) => {
    if (relPath === 'AGENTS.md') return alignVersionLine(contents);
    if (relPath === NUTIN_CONFIG_FILE && i18nMigration) return prepareConfigForMerge(contents);
    return { actual: contents.actual, base: contents.base };
  };
}
