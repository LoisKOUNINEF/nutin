import { sortById } from '#root/dist/src/app/helpers/index.js';

describe('sortById', () => {
	it('should sort an array by id', () => {
		const sorted = sortById([ { id: 3 }, { id: 1 }, { id: 4 }, { id: 2 } ]);
		expect(sorted.map((obj) => obj.id)).toEqual([1, 2, 3, 4]);
	});

	it('should keep items with equal ids in their original order', () => {
		const sorted = sortById([ { id: 2, name: 'b' }, { id: 1, name: 'a' }, { id: 2, name: 'c' } ]);
		expect(sorted.map((obj) => obj.name)).toEqual(['a', 'b', 'c']);
	});
});
