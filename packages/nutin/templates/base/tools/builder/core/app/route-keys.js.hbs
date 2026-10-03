import esbuild from 'esbuild';

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
