// JS-only projects: the templates stay TypeScript-authored, and each rendered .ts file is
// transpiled here at generation time. typescript is imported lazily so TS projects never load it.
// Its version is pinned in package.json: nutin-update re-transpiles the old baseline and compares
// it to the user's files, so any output change between versions would read as a user edit.
// This pin is the CLI's own: generated apps install their own TypeScript (7.x) for tsc.
let tsModule;

async function loadTypeScript() {
  tsModule ??= (await import('typescript')).default;
  return tsModule;
}

// TypeScript's printer drops blank lines and indents by 4. Blank lines survive as marker
// comments, which are turned back into blank lines after transpiling.
const BLANK_LINE_MARKER = '//__NUTIN_BLANK_LINE__';
const BLANK_LINE_MARKER_LINE = /^[ \t]*\/\/__NUTIN_BLANK_LINE__[ \t]*$/;

function markBlankLines(source) {
  return source
    .split('\n')
    .map((line) => (line.trim() === '' ? BLANK_LINE_MARKER : line))
    .join('\n');
}

function restoreBlankLines(output) {
  return output
    .split('\n')
    .map((line) => (BLANK_LINE_MARKER_LINE.test(line) ? '' : line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n*$/, '\n');
}

// Template literal bodies are emitted verbatim (already 2-space), so lines starting inside
// one are left alone.
function getTemplateLiteralRanges(ts, code) {
  const sourceFile = ts.createSourceFile('output.js', code, ts.ScriptTarget.Latest, true);
  const ranges = [];

  (function visit(node) {
    if (ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      ranges.push([node.getStart(sourceFile), node.end]);
      return;
    }
    ts.forEachChild(node, visit);
  })(sourceFile);

  return ranges;
}

// Each 4-space level becomes 2; a smaller remainder (JSDoc ` * ` alignment) is kept.
function reindent(ts, code) {
  const ranges = getTemplateLiteralRanges(ts, code);
  let offset = 0;

  return code
    .split('\n')
    .map((line) => {
      const lineStart = offset;
      offset += line.length + 1;

      if (ranges.some(([start, end]) => lineStart > start && lineStart < end)) return line;

      const indent = line.match(/^ */)[0].length;
      return ' '.repeat(indent - 2 * Math.floor(indent / 4)) + line.slice(indent);
    })
    .join('\n');
}

/**
 * Returns `{ outputFileName, content }` with a `.js` name and transpiled content,
 * `null` for ambient `.d.ts` files (type-only, nothing to emit), or the input unchanged
 * for any other file.
 */
export async function toJsOutput(outputFileName, content) {
  if (outputFileName.endsWith('.d.ts')) return null;
  if (!outputFileName.endsWith('.ts')) return { outputFileName, content };

  const ts = await loadTypeScript();
  const { outputText } = ts.transpileModule(markBlankLines(content), {
    fileName: outputFileName,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      removeComments: false,
    },
  });

  return {
    outputFileName: outputFileName.replace(/\.ts$/, '.js'),
    content: restoreBlankLines(reindent(ts, outputText)),
  };
}
