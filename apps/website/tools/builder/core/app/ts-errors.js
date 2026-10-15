import path from 'path';

// tsc reports errors in dist-build's merged copies. This maps each `file(line,col): …` line
// back to the project's own file: the .html template when the position falls inside a merged
// template, the source .ts otherwise (its lines after the template shifted back up).
//   templateMap: { 'src/…/x.component.ts': { html, line, col, lines } } (see merge-templates)
//   handlerRefs: { 'src/…/x.component.ts': { className, line, col, segment, handlers } } (see handler-refs):
//   an error in the injected handler references is reported where the handler is named in the template.
const LOCATION = /^(.+?)\((\d+),(\d+)\)(: .*)$/;

export function remapTscOutput(output, { cwd, tempDir, templateMap, handlerRefs = {} }) {
  return output
    .split('\n')
    .map((line) => {
      const match = LOCATION.exec(line);
      if (!match) return line;
      const [, file, lineNo, colNo, rest] = match;
      const absolute = path.resolve(cwd, file);
      if (!absolute.startsWith(tempDir + path.sep)) return line;

      const relPath = path.relative(tempDir, absolute);
      const handlerRef = mapHandlerRef(handlerRefs[toPosix(relPath)], Number(lineNo), Number(colNo));
      const { file: mappedFile, line: mappedLine, col: mappedCol } = mapPosition(relPath, handlerRef.line, handlerRef.col, templateMap);
      // A private handler declared in a parent class: TS2341 names the parent; say what to do.
      const hint = handlerRef.note && rest.includes('TS2341') ? ' Declare it protected to use it in a subclass template.' : '';
      return `${toPosix(mappedFile)}(${mappedLine},${mappedCol})${rest}${handlerRef.note}${hint}`;
    })
    .join('\n');
}

export function mapPosition(relPath, line, col, templateMap) {
  const entry = templateMap[toPosix(relPath)] ?? templateMap[relPath];
  if (!entry || line < entry.line) return { file: relPath, line, col };

  const lastTemplateLine = entry.line + entry.lines - 1;
  if (line > lastTemplateLine) return { file: relPath, line: line - (entry.lines - 1), col };

  // Inside the template: its first line starts where the placeholder was.
  const htmlLine = line - entry.line + 1;
  return { file: entry.html, line: htmlLine, col: htmlLine === 1 ? col - entry.col + 1 : col };
}

// A position on a line where handler references were injected: inside them, the handler's place
// in the template (or the class, for an error about the injection itself); after them, shifted back.
export function mapHandlerRef(entry, line, col) {
  if (!entry || line !== entry.line || col < entry.col) return { line, col, note: '' };
  if (col >= entry.col + entry.segment.length) return { line, col: col - entry.segment.length, note: '' };

  const handler = entry.handlers.find((h) => col >= h.col && col < h.col + h.name.length);
  if (!handler) return { line, col: Math.max(entry.col - 1, 1), note: ` (data-event handlers of ${entry.className})` };
  return {
    line: handler.templateLine,
    col: handler.templateCol,
    note: ` (data-event handler "${handler.name}" of ${entry.className})`,
  };
}

const toPosix = (p) => p.split(path.sep).join('/');
