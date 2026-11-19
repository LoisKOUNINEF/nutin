import path from 'path';
import * as fsExtra from 'fs-extra';

const fs = fsExtra.default;

// Projects from before nutin.config.js "i18n" took the language list: it lived in
// config/languages.json ({ languages, defaultLanguage }), and "i18n" was a boolean.
export const LANGUAGES_FILE = 'config/languages.json';
export const NUTIN_CONFIG_FILE = 'nutin.config.js';

// `i18n: <value>,<padding>// comment`. The value is everything up to the last comma before the
// comment (or the end of the line), so lists and expressions are read whole.
const I18N_LINE_RE = /^([ \t]*i18n:[ \t]*)(.*?),([ \t]*)(\/\/[^\n]*)?$/m;

function languagesPath(projectPath) {
  return path.join(projectPath, ...LANGUAGES_FILE.split('/'));
}

// The default language first, then the others, as nutin.config.js "i18n" lists them.
export function languagesFromFile({ languages, defaultLanguage } = {}) {
  const list = [defaultLanguage, ...(Array.isArray(languages) ? languages : [])]
    .filter((lang) => typeof lang === 'string' && lang.length > 0);
  return [...new Set(list)];
}

export function readI18nLine(content) {
  const match = content.match(I18N_LINE_RE);
  return match ? { line: match[0], value: match[2].trim() } : null;
}

export function toI18nLiteral(languages) {
  return `[${languages.map((lang) => `'${lang.replace(/['\\]/g, '\\$&')}'`).join(', ')}]`;
}

// Sets the `i18n:` value, keeping the comment's column when the new value leaves room for it.
export function setI18nValue(content, literal) {
  return content.replace(I18N_LINE_RE, (_, prefix, value, padding, comment = '') => {
    if (!comment) return `${prefix}${literal},`;
    const width = value.length + 1 + padding.length;
    return `${prefix}${literal},${' '.repeat(Math.max(1, width - literal.length - 1))}${comment}`;
  });
}

// What to migrate, or null when the project has no config/languages.json.
export async function detectI18nMigration(projectPath) {
  if (!(await fs.pathExists(languagesPath(projectPath)))) return null;
  try {
    return { languages: languagesFromFile(await fs.readJSON(languagesPath(projectPath))) };
  } catch {
    // Unreadable: no list to carry over (`i18n: true` then becomes English only).
    return { languages: [] };
  }
}

/**
 * nutin.config.js as the update diffs and merges it. The new template changes the `i18n:` line, and
 * projects nearly always change the lines around it (`tailwind: true`...): git would conflict on
 * those adjacent edits. So the new template's `i18n:` line is put in the merge base, and in your
 * file with your value: the merge then only sees your own edits, and keeps your value. Your old
 * comment on that line goes (it pointed to languages.json). applyI18nMigration converts the value.
 */
export function prepareConfigForMerge({ actual, base, next }) {
  const yours = readI18nLine(actual);
  const baseLine = readI18nLine(base);
  const nextLine = readI18nLine(next);
  if (!yours || !baseLine || !nextLine) return { actual, base };

  return {
    actual: actual.replace(yours.line, () => setI18nValue(nextLine.line, yours.value)),
    base: base.replace(baseLine.line, () => nextLine.line),
  };
}

function manualStep(literal) {
  return `Set "i18n" in ${NUTIN_CONFIG_FILE} to ${literal} (the language codes, the default first; [] disables i18n), ` +
    `then delete ${LANGUAGES_FILE}: nutin no longer reads it.`;
}

/**
 * Runs once the update is written, on the value now in nutin.config.js:
 * - true: the languages.json list (default first); false: [] (off). Then languages.json is deleted;
 * - a list (written by hand), or no `i18n:` line (off, e.g. an extension's config): kept as it is,
 *   and languages.json is deleted;
 * - anything else (an expression), or conflict markers in the file: nothing changes, and the
 *   returned manualStep says what to do.
 */
export async function applyI18nMigration(projectPath, { languages }, { conflicted = false } = {}) {
  const configPath = path.join(projectPath, NUTIN_CONFIG_FILE);
  const content = (await fs.pathExists(configPath)) ? await fs.readFile(configPath, 'utf8') : '';
  const value = readI18nLine(content)?.value ?? null;
  const list = toI18nLiteral(languages.length > 0 ? languages : ['en']);
  const messages = [];

  if (conflicted) return { messages, manualStep: manualStep(list) };

  if (value === null) {
    if (list !== "['en']") messages.push(`i18n is off, so the languages of ${LANGUAGES_FILE} weren't kept. To turn it on: i18n: ${list}.`);
  } else if (value === 'true' || value === 'false') {
    const literal = value === 'true' ? list : '[]';
    await fs.writeFile(configPath, setI18nValue(content, literal));
    messages.push(`${NUTIN_CONFIG_FILE}: "i18n" is now ${literal} (from ${LANGUAGES_FILE}).`);
    if (value === 'false' && list !== "['en']") {
      messages.push(`i18n was off, so its languages weren't kept. To turn it on: i18n: ${list}.`);
    }
  } else if (!value.startsWith('[')) {
    return {
      messages,
      manualStep: `"i18n" in ${NUTIN_CONFIG_FILE} is an expression (${value}): make it give the language list, ` +
        `the default first (${list}), or [] when off. Then delete ${LANGUAGES_FILE}: nutin no longer reads it.`,
    };
  }

  await fs.remove(languagesPath(projectPath));
  messages.push(`Deleted ${LANGUAGES_FILE}: the languages are now listed in ${NUTIN_CONFIG_FILE} "i18n".`);
  return { messages, manualStep: null };
}
