import { minifyHTML } from './minify-html.js';

// Minifies the markup of html`` template literals without ever handing JavaScript to the
// HTML minifier: each ${…} is swapped for a token, the markup is minified, and the
// expressions are put back as written (html`` templates nested inside them are minified
// the same way). Anything the scanner can't follow, or a token the minifier drops or
// duplicates (e.g. a whole style="${…}" emptied as invalid CSS), leaves the template as
// written: the worst case is an unminified template, never a broken one.

const TOKEN_PREFIX = '__nutin_expr_';
const token = (n) => `${TOKEN_PREFIX}${n}__`;

// After these, a "/" starts a regex literal rather than a division.
const REGEX_PRECEDING_WORDS = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'throw', 'case', 'do', 'else', 'yield', 'await',
]);
const REGEX_PRECEDING_PUNCTUATION = new Set('(,=:[!&|?{};+-*%<>~^'.split(''));

const isIdentifierChar = (ch) => /[\w$]/.test(ch);

// Index just past the closing quote of the string starting at `i`, or -1.
function skipString(src, i) {
  const quote = src[i];
  for (i++; i < src.length; i++) {
    if (src[i] === '\\') i++;
    else if (src[i] === quote) return i + 1;
    else if (src[i] === '\n') return -1;
  }
  return -1;
}

// Index just past the regex literal (and its flags) starting at `i`, or -1.
function skipRegex(src, i) {
  let inClass = false;
  for (i++; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\') i++;
    else if (ch === '\n') return -1;
    else if (inClass) inClass = ch !== ']';
    else if (ch === '[') inClass = true;
    else if (ch === '/') {
      i++;
      while (i < src.length && isIdentifierChar(src[i])) i++;
      return i;
    }
  }
  return -1;
}

/**
 * Scans a template literal from `start`, the index just past its opening backtick.
 * Returns `{ end, expressions, nested }`: `end` is the index of the closing backtick,
 * `expressions` the top-level `${…}` spans (`start` at "$", `end` past "}"), `nested` the
 * html``-tagged literals inside those expressions (`open` past their opening backtick,
 * `end` at their closing one). null when the literal isn't closed or can't be followed.
 */
export function scanTemplate(src, start) {
  const expressions = [];
  const nested = [];

  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\') {
      i++;
    } else if (ch === '`') {
      return { end: i, expressions, nested };
    } else if (ch === '$' && src[i + 1] === '{') {
      const end = scanExpression(src, i + 2, nested);
      if (end === -1) return null;
      expressions.push({ start: i, end });
      i = end - 1;
    }
  }
  return null;
}

// Index just past the "}" closing the expression that starts at `i`, or -1.
function scanExpression(src, i, nested) {
  let depth = 0;
  let previous = '('; // the expression start behaves like an opening parenthesis

  while (i < src.length) {
    const ch = src[i];

    if (/\s/.test(ch)) {
      i++;
    } else if (ch === '/' && src[i + 1] === '/') {
      const newline = src.indexOf('\n', i);
      if (newline === -1) return -1;
      i = newline + 1;
    } else if (ch === '/' && src[i + 1] === '*') {
      const close = src.indexOf('*/', i + 2);
      if (close === -1) return -1;
      i = close + 2;
    } else if (ch === '"' || ch === "'") {
      i = skipString(src, i);
      if (i === -1) return -1;
      previous = 'value';
    } else if (ch === '`') {
      const inner = scanTemplate(src, i + 1);
      if (!inner) return -1;
      if (previous === 'html') nested.push({ open: i + 1, end: inner.end });
      i = inner.end + 1;
      previous = 'value';
    } else if (ch === '/' && (REGEX_PRECEDING_PUNCTUATION.has(previous) || REGEX_PRECEDING_WORDS.has(previous))) {
      i = skipRegex(src, i);
      if (i === -1) return -1;
      previous = 'value';
    } else if (isIdentifierChar(ch)) {
      let end = i;
      while (end < src.length && isIdentifierChar(src[end])) end++;
      previous = src.slice(i, end);
      i = end;
    } else {
      if (ch === '{') depth++;
      if (ch === '}') {
        if (depth === 0) return i + 1;
        depth--;
      }
      previous = ch;
      i++;
    }
  }
  return -1;
}

/**
 * Minifies a template body (the text between the backticks, or an external .html file).
 * Returns the minified body, or null when it is left as written.
 */
export async function minifyTemplateBody(body) {
  const scan = scanTemplate(`${body}\``, 0);
  if (!scan || scan.end !== body.length || body.includes(TOKEN_PREFIX)) return null;

  // Expressions (with their own nested html`` minified first), in source order.
  const expressions = [];
  for (const { start, end } of scan.expressions) {
    const nestedInside = scan.nested.filter((n) => n.open > start && n.end < end);
    expressions.push(await minifyNested(body, start, end, nestedInside));
  }

  let markup = '';
  let last = 0;
  scan.expressions.forEach(({ start, end }, n) => {
    markup += body.slice(last, start) + token(n);
    last = end;
  });
  markup += body.slice(last);

  let minified;
  try {
    minified = await minifyHTML(markup);
  } catch {
    return null;
  }

  for (let n = 0; n < expressions.length; n++) {
    if (minified.split(token(n)).length !== 2) return null;
  }
  return minified.replace(/__nutin_expr_(\d+)__/g, (_match, n) => expressions[Number(n)]);
}

// The source of body[start, end) with each nested html`` body minified (kept when it can't be).
async function minifyNested(body, start, end, nested) {
  let out = '';
  let last = start;
  for (const { open, end: close } of nested) {
    const inner = body.slice(open, close);
    out += body.slice(last, open) + ((await minifyTemplateBody(inner)) ?? inner);
    last = close;
  }
  return out + body.slice(last, end);
}

// Up to the opening backtick; scanTemplate() finds the closing one, past any nested html``.
const TEMPLATE_START = /const\s+(?:template|templateFn)\s*=?\s*(?:\(.*?\)\s*=>\s*)?(html\s*)?`/;

// The first `const template`/`templateFn` literal: whether it is html``-tagged, where its
// body starts and ends, and the body (null when its closing backtick can't be found).
export function findInlineTemplate(content) {
  const match = TEMPLATE_START.exec(content);
  if (!match) return null;

  const open = match.index + match[0].length;
  const scan = scanTemplate(content, open);
  return {
    tagged: Boolean(match[1]),
    open,
    end: scan?.end ?? null,
    body: scan ? content.slice(open, scan.end) : null,
  };
}
