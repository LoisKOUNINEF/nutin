import { normalizeString } from '../../../../dist/src/app/helpers/normalize/normalize-string.js';

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