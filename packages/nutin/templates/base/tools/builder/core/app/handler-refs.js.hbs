import fs from 'fs/promises';
import path from 'path';
import { getFilesRecursive } from '../../../utils/index.js';
import { findInlineTemplate, findHtmlTemplates, scanExpression } from '../html-templates/template-literal.js';
import { PATHS } from './paths.js';

// data-event handlers are looked up by name at runtime, so tsc can't see them: a typo binds
// nothing, and noUnusedLocals flags every private handler. Before tsc, each component/view's
// handler names are referenced from its own class, on the class's opening line (no line shifts):
//   class TaskCardComponent extends Component { static { void ((c: InstanceType<typeof TaskCardComponent>) => [c._save]); }
// A class body may read its own private members, so a missing handler is a tsc error and an
// existing one counts as used. The arrow is never called; stripHandlerRefs() removes it after tsc.
// Every template of the file is read, each for the class it sits in,
// else the class after it, else the one before it.

const DATA_EVENT = /\bdata-event\s*=\s*(["'])(.*?)\1/gs;
const CLASS_OPEN = /\bclass\s+([A-Za-z_$][\w$]*)\b[^{;]*?\bextends\b[^{;]*\{/g;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

// Injects the references into every .ts under src/app; returns where they went, by path
// relative to dist-build (as ts-errors.js receives tsc's paths).
export async function injectHandlerRefs() {
  const refs = {};
  for (const codePath of await getFilesRecursive(PATHS.tempApp, ['.ts'])) {
    const content = await fs.readFile(codePath, 'utf-8');
    const result = addHandlerRefs(content);
    if (!result) continue;
    await fs.writeFile(codePath, result.content);
    refs[toPosix(path.relative(PATHS.temp, codePath))] = result.entries;
  }
  return refs;
}

export async function stripHandlerRefs(refs) {
  for (const [relPath, entries] of Object.entries(refs)) {
    const codePath = path.join(PATHS.temp, relPath);
    const content = await fs.readFile(codePath, 'utf-8');
    await fs.writeFile(codePath, removeHandlerRefs(content, entries));
  }
}

// The templates' handler names, referenced from their classes.
// Returns null when there's nothing to check.
// entries, one per class, in source order: { className, line, col, segment, handlers }
// with 1-based positions in the injected content; each handler's col is where it
// sits in the injected line, and its templateLine/templateCol where its name is written.
export function addHandlerRefs(content) {
  const templates = findTemplates(content);
  if (!templates.length) return null;

  const classes = findClasses(content, templates);
  const byClass = new Map();
  for (const template of templates) {
    const classOpen = classFor(classes, template);
    if (!classOpen) continue;
    if (!byClass.has(classOpen)) byClass.set(classOpen, new Map());
    const handlers = byClass.get(classOpen);
    for (const handler of collectHandlers(content, template)) {
      if (!handlers.has(handler.name)) handlers.set(handler.name, handler);
    }
  }

  const entries = [];
  let out = '';
  let last = 0;
  let shift = { line: 0, by: 0 }; // segments already injected on the current line
  for (const classOpen of classes) {
    const handlers = [...(byClass.get(classOpen)?.values() ?? [])];
    if (!handlers.length) continue;

    const prefix = ` static { void ((c: InstanceType<typeof ${classOpen.name}>) => [`;
    let segment = prefix;
    const position = positionOf(content, classOpen.end);
    if (shift.line !== position.line) shift = { line: position.line, by: 0 };
    const col = position.col + shift.by;
    const located = handlers.map((handler, i) => {
      if (i > 0) segment += ', ';
      const handlerCol = col + segment.length + 2; // past "c."
      segment += `c.${handler.name}`;
      return { ...handler, col: handlerCol };
    });
    segment += ']); }';

    out += content.slice(last, classOpen.end) + segment;
    last = classOpen.end;
    shift.by += segment.length;
    entries.push({ className: classOpen.name, line: position.line, col, segment, handlers: located });
  }
  if (!entries.length) return null;
  return { content: out + content.slice(last), entries };
}

export async function stripEmittedHandlerRefs(refs) {
  for (const [relPath, entries] of Object.entries(refs)) {
    const codePath = path.join(PATHS.temp, relPath.replace(/\.ts$/, '.js'));
    let content;
    try {
      content = await fs.readFile(codePath, 'utf-8');
    } catch {
      continue; // nothing emitted for this file
    }
    const stripped = removeEmittedHandlerRefs(content, entries);
    if (stripped !== content) await fs.writeFile(codePath, stripped);
  }
}

export function removeEmittedHandlerRefs(content, entries) {
  for (const entry of entries) {
    const emitted = `static { void ((c) => [${entry.handlers.map((h) => `c.${h.name}`).join(', ')}]); }`;
    const line = new RegExp(`^[ \\t]*${escapeRegExp(emitted)}[ \\t]*\\r?\\n`, 'm');
    content = content.replace(line, '');
  }
  return content;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function removeHandlerRefs(content, entries) {
  for (const entry of entries) {
    const index = content.indexOf(entry.segment);
    if (index !== -1) content = content.slice(0, index) + content.slice(index + entry.segment.length);
  }
  return content;
}

// Every html`` template, plus the const template when it isn't tagged.
function findTemplates(content) {
  const templates = findHtmlTemplates(content) ?? [];
  const inline = findInlineTemplate(content);
  if (inline && inline.body !== null && !templates.some((t) => t.open === inline.open)) templates.push(inline);
  return templates;
}

// `class X ... extends ... {` outside the templates,
// in source order, with where the body ends (the file's end when the scanner can't follow it).
function findClasses(content, templates) {
  const classes = [];
  for (const match of content.matchAll(CLASS_OPEN)) {
    if (templates.some((t) => match.index >= t.open && match.index < (t.end ?? t.open))) continue;
    const end = match.index + match[0].length;
    const close = scanExpression(content, end, []);
    classes.push({ name: match[1], start: match.index, end, close: close === -1 ? content.length : close });
  }
  return classes;
}

// The innermost class the template sits in, else the first class after it, else the first before it.
function classFor(classes, template) {
  const inside = classes.filter((c) => c.end <= template.open && template.open < c.close);
  if (inside.length) return inside[inside.length - 1];
  const templateEnd = template.end ?? template.open;
  return classes.find((c) => c.start >= templateEnd) ?? classes[0] ?? null;
}

// Each handler named in a static data-event (one built with ${} is skipped), once, at its
// first occurrence.
function collectHandlers(content, template) {
  const handlers = new Map();
  for (const match of template.body.matchAll(DATA_EVENT)) {
    const value = match[2];
    if (value.includes('${')) continue;
    const name = value.split(':')[1]?.trim();
    if (!name || !IDENTIFIER.test(name) || handlers.has(name)) continue;

    const valueStart = match.index + match[0].indexOf(match[1]) + 1;
    const afterColon = value.indexOf(':') + 1;
    const nameOffset = template.open + valueStart + afterColon + value.slice(afterColon).indexOf(name);
    const { line, col } = positionOf(content, nameOffset);
    handlers.set(name, { name, templateLine: line, templateCol: col });
  }
  return [...handlers.values()];
}

function positionOf(content, offset) {
  const before = content.slice(0, offset);
  return { line: before.split('\n').length, col: offset - before.lastIndexOf('\n') };
}

const toPosix = (p) => p.split(path.sep).join('/');
