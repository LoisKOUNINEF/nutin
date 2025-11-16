import * as sass from 'sass';
import * as fs from 'fs';
import path from 'path';
import { isVerbose, print } from '../../utils/index.js';
import { PATHS } from './paths.js';
import builderConfig from '../../../builder.config.js';

const stylesInput = path.join(PATHS.source, 'styles');
const stylesOutput = path.join(PATHS.tempSource, 'main.css');

const scssPath = (origin) => path.join(stylesInput, origin);
const scssOrigins = builderConfig.sass.paths;

const pathsToLoad = scssOrigins.map(origin => scssPath(origin));

sass.compileAsync(path.join(stylesInput, 'main.scss'), {
  loadPaths: [ ...pathsToLoad ],
  style: 'compressed'
}).then(result => {
  fs.writeFileSync(stylesOutput, result.css);
  if (isVerbose) print.boldInfo('Global styles compiled.\n');
});
