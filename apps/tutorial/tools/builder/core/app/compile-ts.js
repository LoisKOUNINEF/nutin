import fs from 'fs';
import path from 'path';
import { captureCommand, errorExit } from "../../../utils/index.js";
import { builderConfig } from '../../builder.config.js';
import { PATHS } from './paths.js';
import { readTemplateMap } from '../html-templates/merge-templates.js';
import { remapTscOutput } from './ts-errors.js';
import { injectHandlerRefs, stripHandlerRefs } from './handler-refs.js';

// Runs after the .html templates are merged (process-html-templates), on dist-build's copies,
// so templates are type-checked like the rest of the code. A tsconfig generated there extends
// the project's: dist-build/src mirrors src, so its include/exclude apply as written.
const BUILD_TSCONFIG = path.join(PATHS.temp, 'tsconfig.json');

async function compileTS() {
  writeBuildTsconfig();

  // Prod bundles straight from the merged .ts (see prod-bundle/esbuild.js), so tsc only
  // type-checks there. Dev emits each .js next to its .ts, for the dev bundle and testin-nutin.
  const args = ['--project', BUILD_TSCONFIG, '--pretty', 'false'];
  if (builderConfig.isProd) args.push('--noEmit');

  // data-event handlers are type-checked through references injected for tsc only, then
  // removed from the .ts copies the prod bundle is built from (see handler-refs.js).
  const handlerRefs = await injectHandlerRefs();
  const { code, output } = await captureCommand('tsc', args);
  await stripHandlerRefs(handlerRefs);
  const report = remapTscOutput(output, {
    cwd: process.cwd(),
    tempDir: PATHS.temp,
    templateMap: await readTemplateMap(),
    handlerRefs,
  }).trim();

  // On stdout, where tsc itself writes its diagnostics.
  if (report) console.log(report);
  if (code !== 0) throw new Error(`tsc exited with code ${code}`);
}

function writeBuildTsconfig() {
  const project = readTsconfig(path.resolve('tsconfig.json'));
  const config = {
    extends: '../tsconfig.json',
    compilerOptions: { rootDir: 'src', outDir: 'src' },
    include: (project.include ?? ['src']).map(toBuildPath),
    exclude: (project.exclude ?? []).map(toBuildPath),
  };
  if (project.files) config.files = project.files.map(toBuildPath);
  fs.writeFileSync(BUILD_TSCONFIG, JSON.stringify(config, null, 2));
}

// Paths in src/ are mirrored in dist-build/src; anything else stays where it is, one level up.
function toBuildPath(entry) {
  const normalized = entry.replace(/^\.\//, '');
  return normalized === 'src' || normalized.startsWith('src/') ? normalized : `../${normalized}`;
}

// tsconfig.json is JSONC: comments and trailing commas are allowed.
function readTsconfig(file) {
  const source = fs.readFileSync(file, 'utf-8');
  let json = '';
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      const end = endOfString(source, i);
      json += source.slice(i, end);
      i = end - 1;
    } else if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      json += '\n';
    } else if (ch === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2) + 1;
      if (i === 0) break;
    } else {
      json += ch;
    }
  }
  return JSON.parse(json.replace(/,(\s*[}\]])/g, '$1'));
}

function endOfString(source, start) {
  for (let i = start + 1; i < source.length; i++) {
    if (source[i] === '\\') i++;
    else if (source[i] === '"') return i + 1;
  }
  return source.length;
}

compileTS().catch((err) => {
  errorExit(err, 'compile-ts');
});
