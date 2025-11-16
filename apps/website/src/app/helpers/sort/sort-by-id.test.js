import { sortById } from '#root/dist/src/app/helpers/index.js';

describe('sortById', () => {
	it('should sort an array by id', () => {
		const arr = [ { id: 3 }, { id: 1 }, { id: 4 }, { id: 2 } ];
		const sortedArr = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 } ];
		const sortedById = sortById(arr);

		sortedById.map((obj, i) => {
			expect(obj.id).toBe(sortedArr[i].id);
			expect(obj.id).toBeLessThan(sortedById[i + 1]);
			expect(obj.id).toBeGreaterThan(sortedById[i - 1]);
		})
	})
})