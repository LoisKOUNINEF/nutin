import { errorExit } from '../../../utils/index.js';
import { minifyTemplates } from './merge-templates.js';

try {
  await minifyTemplates();
} catch (err) {
  errorExit(err, 'minify-templates');
}
