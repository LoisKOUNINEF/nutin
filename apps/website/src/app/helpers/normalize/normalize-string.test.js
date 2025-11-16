import { normalizeString } from '#root/dist/src/app/helpers/index.js';

describe('normalizeString', () => {
	it('should normalize', () => {
		expect(normalizeString(' a b c ')).toBe('-a-b-c-');
		expect(normalizeString(' a b ')).toBe('-a-b-');
		expect(normalizeString('a b ')).toBe('a-b-');
		expect(normalizeString(' a b')).toBe('-a-b');
		expect(normalizeString('ab')).toBe('ab');
		expect(normalizeString(' ab ')).toBe('-ab-');
		expect(normalizeString('ab ')).toBe('ab-');
		expect(normalizeString(' ab')).toBe('-ab');
		expect(normalizeString('ab')).toBe('ab');
	})
})