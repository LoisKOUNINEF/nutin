import { TutorialView } from '#root/dist/src/app/views/index.js';
import { registerPipes } from '#root/dist/src/libs/index.js';

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
	it('should have title with i18n key', () => {
		const h1 = view.element.querySelector('h1');
		expect(h1).toBeDefined();
		expect(h1.textContent).toBe('Tutorial.title');		
	});
})