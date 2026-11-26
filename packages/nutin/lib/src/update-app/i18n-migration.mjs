import path from 'path';
import * as fsExtra from 'fs-extra';
import { realWriter } from '../common/project-writer.mjs';

const fs = fsExtra.default;

// Projects from before nutin.config.js "i18n" took the language list: it lived in
// config/languages.json ({ languages, defaultLanguage }), and "i18n" was a boolean.
export const LANGUAGES_FILE = 'config/languages.json';
export const NUTIN_CONFIG_FILE = 'nutin.config.js';

// Same rule as the project's tools/utils/languages.js: such a code is also safe in a '...' literal.
const LANGUAGE_CODE = /^[A-Za-z0-9-]+$/;

// An `i18n` key at the start of a line: `i18n:`, `"i18n" :`...
const I18N_KEY_RE = /^[ \t]*['"]?i18n['"]?[ \t]*:/m;
// The whole `i18n:` line: prefix, value, spaces, optional comma (none on the last key), padding,
// and an optional `//` or `/* */` comment. The value is everything up to them, so lists and
// expressions are read whole.
const I18N_LINE_RE = /^([ \t]*['"]?i18n['"]?[ \t]*:[ \t]*)(.*?)([ \t]*)(,?)([ \t]*)((?:\/\/|\/\*)[^\n]*)?$/m;

// Where code may still read languages.json, or nutin.config.js "i18n" as a boolean (this update rewrites them).
const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'dist-build', '.git', 'coverage']);
const SCANNED_EXTENSIONS = new Set(['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx', '.html', '.json']);
// The default import of nutin.config.js (`import nutinConfig from '../../nutin.config.js'`).
const CONFIG_IMPORT_RE = /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"][^'"]*nutin\.config(?:\.js)?['"]/g;

// Reads `<name>.i18n` where <name> is what the file imports nutin.config.js as.
function readsI18nOption(content) {
  return [...content.matchAll(CONFIG_IMPORT_RE)]
    .some(([, name]) => new RegExp(`(^|[^\\w$.])${name.replace(/\$/g, '\\$')}\\.i18n\\b`).test(content));
}

function languagesPath(projectPath) {
  return path.join(projectPath, ...LANGUAGES_FILE.split('/'));
}

// The default language first, then the others.
// Codes that aren't valid (or not strings) are set aside in `invalid`: never written to nutin.config.js.
export function languagesFromFile({ languages, defaultLanguage } = {}) {
  // Missing or blank entries aren't codes at all: dropped without a word, as before.
  const candidates = [defaultLanguage, ...(Array.isArray(languages) ? languages : [])]
    .filter((lang) => lang !== undefined && lang !== null && !(typeof lang === 'string' && !lang.trim()));
  const valid = [];
  const invalid = [];
  for (const lang of candidates) {
    const list = typeof lang === 'string' && LANGUAGE_CODE.test(lang) ? valid : invalid;
    if (!list.includes(lang)) list.push(lang);
  }
  return { languages: valid, invalid };
}

function isBalanced(text) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const char of text) {
    if ('([{'.includes(char)) stack.push(char);
    else if (pairs[char] && stack.pop() !== pairs[char]) return false;
  }
  return stack.length === 0;
}

// { line, value, kind }
// kind is 'true', 'false', 'list', 'expression', 'absent' (no i18n key) or 'unparsable'
export function readI18nLine(content) {
  if (!I18N_KEY_RE.test(content)) return { line: null, value: null, kind: 'absent' };
  const match = content.match(I18N_LINE_RE);
  const value = match?.[2].trim() ?? '';
  if (!match || !value || !isBalanced(value)) return { line: match?.[0] ?? null, value: null, kind: 'unparsable' };

  let kind = 'expression';
  if (value === 'true' || value === 'false') kind = value;
  else if (value.startsWith('[') && value.endsWith(']')) kind = 'list';
  return { line: match[0], value, kind };
}

export function toI18nLiteral(languages) {
  return `[${languages.map((lang) => `'${lang}'`).join(', ')}]`;
}

// Sets the `i18n:` value, keeping the comma (or its absence), and the comment at its column when
// the new value leaves room for it.
export function setI18nValue(content, literal) {
  return content.replace(I18N_LINE_RE, (_, prefix, value, spaces, comma, padding, comment = '') => {
    // Without a comma, the spaces before it and the padding are one gap.
    const tail = comma ? `${spaces}${comma}` : '';
    const gap = comma ? padding : `${spaces}${padding}`;
    if (!comment) return `${prefix}${literal}${tail}${gap}`;
    const column = value.length + tail.length + gap.length;
    return `${prefix}${literal}${tail}${' '.repeat(Math.max(1, column - literal.length - tail.length))}${comment}`;
  });
}

/**
 * Files that still read config/languages.json (`referencedBy`), or nutin.config.js "i18n"
 * as if it were a boolean.
 * generatedPaths: the files nutin generates (posix paths), skipped: this update rewrites them.
 */
export async function findI18nReferences(projectPath, generatedPaths = new Set()) {
  const referencedBy = [];
  const readsI18nOptionFiles = [];

  async function scan(dir) {
    for (const entry of await fs.readdir(path.join(projectPath, dir), { withFileTypes: true })) {
      const relPath = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) await scan(relPath);
        continue;
      }
      if (!SCANNED_EXTENSIONS.has(path.extname(entry.name)) || relPath === LANGUAGES_FILE || generatedPaths.has(relPath)) continue;
      const content = await fs.readFile(path.join(projectPath, relPath), 'utf8');
      if (content.includes('languages.json')) referencedBy.push(relPath);
      if (readsI18nOption(content)) readsI18nOptionFiles.push(relPath);
    }
  }

  await scan('');
  return { referencedBy, readsI18nOption: readsI18nOptionFiles };
}

/**
 * What to migrate, or null when the project has no config/languages.json.
 * Read before anything is written: the value restored after the merge is this one.
 * { languages, invalid, kind, value }; the updater adds findI18nReferences()'s lists.
 */
export async function detectI18nMigration(projectPath) {
  if (!(await fs.pathExists(languagesPath(projectPath)))) return null;

  let fromFile = { languages: [], invalid: [] };
  try {
    fromFile = languagesFromFile(await fs.readJSON(languagesPath(projectPath)));
  } catch {
    // Unreadable: no list to carry over (`i18n: true` then becomes English only).
  }

  const configPath = path.join(projectPath, NUTIN_CONFIG_FILE);
  const config = (await fs.pathExists(configPath)) ? await fs.readFile(configPath, 'utf8') : '';
  const { kind, value } = readI18nLine(config);

  return { ...fromFile, kind, value, referencedBy: [], readsI18nOption: [] };
}

/**
 * nutin.config.js as the update compares and merges it:
 * the new template's `i18n:` line in place of the existing line and of the old template's.
 * Nothing on that line is then a change, on either side: an untouched file is a plain update,
 * and edits around it (`tailwind: true`...) merge without a conflict.
 * applyI18nMigration puts the value back afterwards.
 * If the line was removed, only the base gets the new one: removal then merges cleanly.
 * A line this can't read is left alone, then merges like any other edit.
 */
export function prepareConfigForMerge({ actual, base, next }) {
  const yours = readI18nLine(actual);
  const original = readI18nLine(base);
  const updated = readI18nLine(next);
  if (yours.kind === 'unparsable' || !original.line || !updated.line) return { actual, base };
  return {
    actual: yours.line ? actual.replace(yours.line, () => updated.line) : actual,
    base: base.replace(original.line, () => updated.line),
  };
}

function listLiteral(migration) {
  return toI18nLiteral(migration.languages.length > 0 ? migration.languages : ['en']);
}

// The value nutin.config.js gets: the list when i18n was on, [] when off, the existing otherwise.
function targetValue(migration) {
  switch (migration.kind) {
    case 'true': return listLiteral(migration);
    case 'false': return '[]';
    case 'list':
    case 'expression': return migration.value;
    default: return null;
  }
}

function deletesFile(migration) {
  return !['expression', 'unparsable'].includes(migration.kind) && migration.referencedBy.length === 0;
}

// One line for the update summary: what the migration will do.
// configMerged: nutin.config.js is among the files to merge, so it may end up with conflict markers.
export function describeI18nMigration(migration, { configMerged = false } = {}) {
  const target = targetValue(migration);
  const action = {
    true: `nutin.config.js gets i18n: ${target}`,
    false: `i18n is off: nutin.config.js gets i18n: []${listLiteral(migration) !== "['en']" ? ` (its list ${listLiteral(migration)} isn't kept)` : ''}`,
    list: `nutin.config.js keeps your i18n: ${target}`,
    absent: 'i18n is off (no "i18n" option)',
    expression: `your "i18n" is an expression (${migration.value}): converting it is left to you`,
    unparsable: 'nutin.config.js\'s "i18n" can\'t be read automatically: converting it is left to you',
  }[migration.kind];
  const file = deletesFile(migration)
    ? `${LANGUAGES_FILE} is deleted`
    : `${LANGUAGES_FILE} is kept${migration.referencedBy.length ? ` (still used by ${migration.referencedBy.join(', ')})` : ''}`;
  const condition = configMerged && targetValue(migration) !== null
    ? ` — if nutin.config.js merges without conflict markers (else it's left to you)`
    : '';
  const invalid = migration.invalid.length ? `; invalid codes skipped: ${migration.invalid.map((code) => JSON.stringify(code)).join(', ')}` : '';
  const readers = migration.readsI18nOption.length ? `; to check by hand: ${migration.readsI18nOption.join(', ')} (reads "i18n" as a boolean)` : '';
  return `${LANGUAGES_FILE} → nutin.config.js "i18n": ${action}; ${file}${condition}${invalid}${readers}`;
}

// The value to give "i18n" by hand: the existing one(s) when there's a list or an expression.
function suggestion(migration) {
  if (migration.kind === 'unparsable') return `${listLiteral(migration)} (or [] if i18n is off)`;
  return targetValue(migration) ?? '[]';
}

const CONFLICT_MARKER_RE = /^(<<<<<<<|\|\|\|\|\|\|\||=======|>>>>>>>)/m;

// The `i18n:` line outside any conflict hunk, when there's exactly one in the file: safe to set.
function hasSingleSettableLine(content) {
  const lines = content.split('\n');
  let inHunk = false;
  let count = 0;
  for (const line of lines) {
    if (line.startsWith('<<<<<<<')) inHunk = true;
    else if (line.startsWith('>>>>>>>')) inHunk = false;
    else if (I18N_KEY_RE.test(line)) {
      if (inHunk) return false;
      count += 1;
    }
  }
  return count === 1 && CONFLICT_MARKER_RE.test(content);
}

/**
 * Runs once the update is written. Returns { messages, manualSteps }.
 * Puts the value detected before the update in the new `i18n:` line,
 * then deletes config/languages.json, unless:
 * - nutin.config.js has conflict markers, or no readable `i18n:` line after the merge;
 * - the value is an expression, or couldn't be read;
 * - app code still reads languages.json.
 * In those cases the file is kept, and manualSteps says what to do.
 */
export async function applyI18nMigration(projectPath, migration, { conflicted = false, writer = realWriter } = {}) {
  const configPath = path.join(projectPath, NUTIN_CONFIG_FILE);
  const messages = [];
  const manualSteps = [];
  const deleteStep = `then delete ${LANGUAGES_FILE}: nutin no longer reads it.`;

  if (migration.invalid.length > 0) {
    messages.push(`${LANGUAGES_FILE} had invalid language codes, skipped: ${migration.invalid.map((code) => JSON.stringify(code)).join(', ')}.`);
  }

  if (migration.readsI18nOption.length > 0) {
    manualSteps.push(
      `${migration.readsI18nOption.join(', ')} read${migration.readsI18nOption.length > 1 ? '' : 's'} nutin.config.js "i18n" directly: it's now a list, ` +
      `and an empty one ([], i18n off) is truthy. Use CONFIG.i18n (src/core/config.js) instead, which is a boolean.`,
    );
  }

  if (conflicted || migration.kind === 'unparsable') {
    // Your value isn't lost in a conflicted file: put back on the line both sides agree on, if any.
    const target = targetValue(migration);
    if (conflicted && target !== null) {
      const content = (await writer.pathExists(configPath)) ? await writer.readFile(configPath, 'utf8') : '';
      if (hasSingleSettableLine(content)) {
        await writer.writeFile(configPath, setI18nValue(content, target));
        messages.push(`${NUTIN_CONFIG_FILE}: "i18n" is set to ${target}; resolve its conflict markers.`);
        manualSteps.push(`${NUTIN_CONFIG_FILE} has conflict markers: once they're resolved, check that "i18n" is still ${target}, ${deleteStep}`);
        return { messages, manualSteps };
      }
    }
    const why = conflicted ? 'has conflict markers' : 'has an "i18n" value the update can\'t read';
    manualSteps.push(`${NUTIN_CONFIG_FILE} ${why}: set "i18n" to ${suggestion(migration)} (the language codes, the default first; [] disables i18n), ${deleteStep}`);
    return { messages, manualSteps };
  }

  const target = targetValue(migration);
  if (target !== null) {
    const content = (await writer.pathExists(configPath)) ? await writer.readFile(configPath, 'utf8') : '';
    if (['absent', 'unparsable'].includes(readI18nLine(content).kind)) {
      manualSteps.push(`${NUTIN_CONFIG_FILE} has no "i18n:" line the update can read after merging: set "i18n" to ${target}, ${deleteStep}`);
      return { messages, manualSteps };
    }
    await writer.writeFile(configPath, setI18nValue(content, target));
    messages.push(['list', 'expression'].includes(migration.kind)
      ? `${NUTIN_CONFIG_FILE}: kept your "i18n": ${target}.`
      : `${NUTIN_CONFIG_FILE}: "i18n" is now ${target}${migration.kind === 'true' ? ` (from ${LANGUAGES_FILE})` : ''}.`);
  }
  if (migration.kind === 'false' && listLiteral(migration) !== "['en']") {
    messages.push(`i18n was off, so its languages weren't kept. To turn it on: i18n: ${listLiteral(migration)}.`);
  }

  if (migration.kind === 'expression') {
    manualSteps.push(`"i18n" in ${NUTIN_CONFIG_FILE} is an expression (${migration.value}): make it give the language list, the default first (${listLiteral(migration)}), or [] when off, ${deleteStep}`);
  } else if (migration.referencedBy.length > 0) {
    manualSteps.push(
      `${LANGUAGES_FILE} is still used by ${migration.referencedBy.join(', ')}: read the languages from core's LANGUAGES / DEFAULT_LANGUAGE ` +
      `(src/core/services/i18n/languages.js) or nutin.config.js "i18n" instead, ${deleteStep}`,
    );
  } else {
    await writer.remove(languagesPath(projectPath));
    messages.push(migration.kind === 'absent'
      ? `Deleted ${LANGUAGES_FILE}: nutin no longer reads it (languages are listed in ${NUTIN_CONFIG_FILE} "i18n").`
      : `Deleted ${LANGUAGES_FILE}: the languages are now listed in ${NUTIN_CONFIG_FILE} "i18n".`);
  }

  return { messages, manualSteps };
}
