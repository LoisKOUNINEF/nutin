import { sectionManager } from '../../../../../helpers/index.js';
import SnackbarSnippets from './snippets/snackbar.snippets.js';
import SnackbarSection from './snackbar.section.json' with { type: "json" };

export default sectionManager(SnackbarSection, SnackbarSnippets);
