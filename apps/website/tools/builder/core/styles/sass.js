import * as sass from 'sass';
import * as fs from 'fs';
import path from 'path';
import { getFilesRecursive, errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';

const stylesOutput = path.join(PATHS.tempSource, 'main.css');

// global styles (partials)
const stylesPath = path.join(PATHS.source, 'styles');
const scssOrigins = builderConfig.sass.paths;
const scssPath = (origin) => path.join(stylesPath, origin);
const stylesInput = scssOrigins.map(origin => scssPath(origin));
const pathsToLoad = [ ...stylesInput ];
// resolves `@use "pkg:<package>/<subpath>"` through node_modules (package exports)
const importers = [ new sass.NodePackageImporter() ];

try {
  const mainResult = await sass.compileAsync(path.join(stylesPath, 'main.scss'), {
    loadPaths: [ ...pathsToLoad ],
    importers,
    style: 'compressed'
  });
  fs.writeFileSync(stylesOutput, mainResult.css);

  // features styles
  const appInput = path.join(PATHS.source, 'app');
  // Partials (_name.scss) only exist to be @use'd — compiling them standalone would duplicate their CSS.
  const appStyles = getFilesRecursive(appInput, 'scss').filter((file) => !path.basename(file).startsWith('_'));

  for (const style of appStyles) {
    const result = await sass.compileAsync(style, {
      loadPaths: [ ...pathsToLoad ],
      importers,
      style: 'compressed'
    })
    fs.appendFileSync(stylesOutput, result.css);
  }
} catch (err) {
  errorExit(err, 'sass');
}
