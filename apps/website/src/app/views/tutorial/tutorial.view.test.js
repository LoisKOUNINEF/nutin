import { TutorialView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/core/index.js';

let view;

describe('TutorialView', () => {
	beforeAll(async () => {
		setupJsdom();
		registerPipes();
		view = new TutorialView();
	});

	it('should be defined', () => {
		expect(view).toBeDefined();
	});

	it('should render an empty state when the tutorial manifest has no pages', () => {
		view.render();
		const empty = view.element.querySelector('[data-i18n="tutorial.empty"]');
		expect(empty).toBeDefined();
	});
})
