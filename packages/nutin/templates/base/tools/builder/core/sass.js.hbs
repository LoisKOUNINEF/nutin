import * as sass from 'sass';
import * as fs from 'fs';
import path from 'path';
import { getFilesRecursive, isVerbose, print } from '../../utils/index.js';
import { PATHS } from './paths.js';
import builderConfig from '../../../builder.config.js';

const stylesOutput = path.join(PATHS.tempSource, 'main.css');

// global styles (partials)
const stylesPath = path.join(PATHS.source, 'styles');
const scssOrigins = builderConfig.sass.paths;
const scssPath = (origin) => path.join(stylesPath, origin);
const stylesInput = scssOrigins.map(origin => scssPath(origin));
const libsInput = path.join(PATHS.source, 'libs');
const pathsToLoad = [ ...stylesInput, libsInput ];

await sass.compileAsync(path.join(stylesPath, 'main.scss'), {
  loadPaths: [ ...pathsToLoad,  ],
  style: 'compressed'
}).then(result => {
  fs.writeFileSync(stylesOutput, result.css);
  if (isVerbose) print.boldInfo('Global styles compiled.\n');
});

// features styles
const appInput = path.join(PATHS.source, 'app');
// const appOrigins = [ 'components', 'views', 'libs' ];
const appStyles = [...getFilesRecursive(path.join(appInput, 'components'), 'scss'), ...getFilesRecursive(path.join(appInput, 'views'), 'scss')];

for (const style of appStyles) {
  const result = await sass.compileAsync(style, {
    loadPaths: [ ...pathsToLoad ],
    style: 'compressed'
  })
  fs.appendFileSync(stylesOutput, result.css);
  if (isVerbose) print.boldInfo(`${style} compiled.\n`);
}
