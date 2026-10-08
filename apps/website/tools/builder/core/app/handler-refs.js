import fs from 'fs/promises';
import path from 'path';
import { getFilesRecursive } from '../../../utils/index.js';
import { findInlineTemplate } from '../html-templates/template-literal.js';
import { PATHS } from './paths.js';

// data-event handlers are looked up by name at runtime, so tsc can't see them: a typo binds
// nothing, and noUnusedLocals flags every private handler. Before tsc, each component/view's
// handler names are referenced from its own class, on the class's opening line (no line shifts):
//   class TaskCardComponent extends Component { static { void ((c: InstanceType<typeof TaskCardComponent>) => [c._save]); }
// A class body may read its own private members, so a missing handler is a tsc error and an
// existing one counts as used. The arrow is never called; stripHandlerRefs() removes it after tsc.

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
    refs[toPosix(path.relative(PATHS.temp, codePath))] = result.entry;
  }
  return refs;
}

export async function stripHandlerRefs(refs) {
  for (const [relPath, entry] of Object.entries(refs)) {
    const codePath = path.join(PATHS.temp, relPath);
    const content = await fs.readFile(codePath, 'utf-8');
    await fs.writeFile(codePath, removeHandlerRefs(content, entry));
  }
}

// The template's handler names, referenced from the class that follows (or precedes) it.
// Returns null when there's nothing to check. entry: { className, line, col, segment, handlers }
// with 1-based positions; each handler's col is where it sits in the injected line, and its
// templateLine/templateCol where its name is written in the template.
export function addHandlerRefs(content) {
  const template = findInlineTemplate(content);
  if (!template || template.body === null) return null;

  const handlers = collectHandlers(content, template);
  if (!handlers.length) return null;

  const classOpen = findClassOpen(content, template);
  if (!classOpen) return null;

  const prefix = ` static { void ((c: InstanceType<typeof ${classOpen.name}>) => [`;
  let segment = prefix;
  const { line, col } = positionOf(content, classOpen.end);
  const located = handlers.map((handler, i) => {
    if (i > 0) segment += ', ';
    const handlerCol = col + segment.length + 2; // past "c."
    segment += `c.${handler.name}`;
    return { ...handler, col: handlerCol };
  });
  segment += ']); }';

  return {
    content: content.slice(0, classOpen.end) + segment + content.slice(classOpen.end),
    entry: { className: classOpen.name, line, col, segment, handlers: located },
  };
}

export function removeHandlerRefs(content, entry) {
  const index = content.indexOf(entry.segment);
  return index === -1 ? content : content.slice(0, index) + content.slice(index + entry.segment.length);
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

// The first `class X ... extends ... {` outside the template: after it first, else before it.
function findClassOpen(content, template) {
  const end = template.end ?? template.open;
  let found = null;
  for (const match of content.matchAll(CLASS_OPEN)) {
    const inTemplate = match.index >= template.open && match.index < end;
    if (inTemplate) continue;
    const candidate = { name: match[1], end: match.index + match[0].length };
    if (match.index >= end) return candidate;
    found ??= candidate;
  }
  return found;
}

function positionOf(content, offset) {
  const before = content.slice(0, offset);
  return { line: before.split('\n').length, col: offset - before.lastIndexOf('\n') };
}

const toPosix = (p) => p.split(path.sep).join('/');
