import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import { getFilesRecursive } from '../../../utils/index.js';

const DUPLICATE_KEY_TEXT = /^Duplicate key "(.*)" in object literal$/;

// esbuild warns on every duplicate key of an object literal — appRoutes' included — and
// treats '/x', "/x" and ['/x'] as the same key. Scope is the whole file, not only appRoutes.
// Rejects (with esbuild's own message) when the source doesn't parse.
export async function findDuplicateRouteKeys(source, { loader, sourcefile }) {
  const { warnings } = await esbuild.transform(source, { loader, sourcefile });
  const duplicates = new Map();

  for (const warning of warnings) {
    if (warning.id !== 'duplicate-object-key') continue;
    const key = warning.text.match(DUPLICATE_KEY_TEXT)?.[1] ?? warning.text;
    if (!duplicates.has(key)) duplicates.set(key, warning.location?.line);
  }

  return [...duplicates].map(([key, line]) => ({ key, line }));
}

// Static, bare and dynamic imports: from '…', import '…', import('…').
const IMPORT_SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(?\s*)(['"`])([^'"`]+)\1/g;
const CODE_EXTENSION = /\.(ts|js)$/;

// The app files that import the routes module. Without one, the app doesn't use the router
// (e.g. components mounted into a page), so routes.ts and #app aren't required.
//   files: [{ path, content }], absolute paths; routesFile: the routes module's absolute path.
export function findRoutesImporters(files, routesFile) {
  const routesModule = routesFile.replace(CODE_EXTENSION, '');
  return files
    .filter(({ path: file, content }) => file !== routesFile && [...content.matchAll(IMPORT_SPECIFIER)].some(
      ([, , specifier]) => specifier.startsWith('.') &&
        path.resolve(path.dirname(file), specifier).replace(CODE_EXTENSION, '') === routesModule
    ))
    .map(({ path: file }) => file);
}

// findRoutesImporters() over the app's code files (tests and .d.ts left out).
export function readRoutesImporters(appDir, routesFile) {
  const files = getFilesRecursive(appDir, ['.ts', '.js'])
    .filter((file) => !/\.test\.(ts|js)$/.test(file) && !file.endsWith('.d.ts'))
    .map((file) => ({ path: file, content: fs.readFileSync(file, 'utf-8') }));
  return findRoutesImporters(files, routesFile);
}
