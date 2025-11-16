import { sortById } from '../../../../helpers/index.js';
import GuardsSection from './1-guards/guards.section.js';
import PipesSection from './2-pipes/pipes.section.js';
import SnackbarSection from './3-snackbar/snackbar.section.js';
import PopoverSection from './4-popover/popover.section.js';

export default sortById([
	GuardsSection,
	PipesSection,
	SnackbarSection,
	PopoverSection,
]);
