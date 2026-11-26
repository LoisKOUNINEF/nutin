import { readFileSync } from 'fs';
import path from 'path';
import { errorExit, print } from '../../../utils/index.js';
import { PATHS } from './paths.js';
import { findDuplicateRouteKeys, hasRouteKey } from './route-keys.js';

const ROUTES_FILE = path.join(PATHS.sourceApp, 'routes.ts');

async function validateRoutes() {
  let source;
  try {
    source = readFileSync(ROUTES_FILE, 'utf-8');
  } catch {
    errorExit(`Failed to read ${ROUTES_FILE}`, 'validate-routes');
  }

  if (!/\bappRoutes\b/.test(source)) {
    errorExit(`Could not find "appRoutes" in ${ROUTES_FILE}`, 'validate-routes');
  }

  const duplicates = await findDuplicateRouteKeys(source, { loader: 'ts', sourcefile: ROUTES_FILE });

  if (duplicates.length > 0) {
    const list = duplicates.map(({ key, line }) => `"${key}"${line ? ` (line ${line})` : ''}`).join(', ');
    errorExit(
      `Duplicate route key(s) in ${ROUTES_FILE}: ${list} — an earlier route with this path is silently unreachable.`,
      'validate-routes'
    );
  }

  // Not an error: the router works without it, and a '/404' spread in from another file isn't seen.
  if (!(await hasRouteKey(source, '/404', { loader: 'ts', sourcefile: ROUTES_FILE }))) {
    print.warn(
      `${path.relative(process.cwd(), ROUTES_FILE)} has no '/404' route: an unknown URL renders a blank page, and an in-app link ` +
      `to one does nothing. Add one (the scaffold's NotFoundView), or ignore this if appRoutes gets it from another file.`
    );
  }
}

validateRoutes().catch((err) => {
  errorExit(err, 'validate-routes');
});
