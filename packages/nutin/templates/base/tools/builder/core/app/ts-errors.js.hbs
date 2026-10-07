import path from 'path';

// tsc reports errors in dist-build's merged copies. This maps each `file(line,col): …` line
// back to the project's own file: the .html template when the position falls inside a merged
// template, the source .ts otherwise (its lines after the template shifted back up).
//   templateMap: { 'src/…/x.component.ts': { html, line, col, lines } } (see merge-templates)
const LOCATION = /^(.+?)\((\d+),(\d+)\)(: .*)$/;

export function remapTscOutput(output, { cwd, tempDir, templateMap }) {
  return output
    .split('\n')
    .map((line) => {
      const match = LOCATION.exec(line);
      if (!match) return line;
      const [, file, lineNo, colNo, rest] = match;
      const absolute = path.resolve(cwd, file);
      if (!absolute.startsWith(tempDir + path.sep)) return line;

      const relPath = path.relative(tempDir, absolute);
      const { file: mappedFile, line: mappedLine, col: mappedCol } = mapPosition(relPath, Number(lineNo), Number(colNo), templateMap);
      return `${toPosix(mappedFile)}(${mappedLine},${mappedCol})${rest}`;
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

const toPosix = (p) => p.split(path.sep).join('/');
