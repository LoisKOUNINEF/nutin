import { HomeView } from '#root/dist/src/app/views/index.js';

let view;

describe('HomeView', () => {
	beforeAll(async () => {
		view = new HomeView();
	});

	it('should be defined', () => {
		expect(view).toBeDefined();
	});
})
