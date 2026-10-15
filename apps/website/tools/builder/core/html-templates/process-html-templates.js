import { errorExit } from '../../../utils/index.js';
import { mergeTemplates } from './merge-templates.js';

// Merges each .html template into its code file, as written: TypeScript projects type-check
// them next (compile-ts), and minify-templates.js minifies them after that.
try {
  await mergeTemplates();
} catch (err) {
  errorExit(err, 'process-html-templates');
}
