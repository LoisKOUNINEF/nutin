import { errorExit } from '../../../utils/index.js';
import { resolveTemplates } from './merge-templates.js';

try {
  await resolveTemplates();
} catch (err) {
  errorExit(err);
}
