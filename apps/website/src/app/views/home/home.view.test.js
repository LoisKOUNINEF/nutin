import { HomeView } from '#root/dist/src/app/views/index.js';

let view;

describe('HomeView', () => {
	beforeAll(async () => {
		view = new HomeView();
	});

	it('should be defined', () => {
		expect(view).toBeDefined();
	});
	it('should have title with i18n key', () => {
		const h1 = view.element.querySelector('h1');
		expect(h1).toBeDefined();
		expect(h1.textContent).toBe('home.title');		
	});
})
