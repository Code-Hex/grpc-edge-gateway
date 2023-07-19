import { expectPChars, expectIdent } from '../../src/httprule/expect';

describe('expectPChars', () => {
	it('should throw error for non pchar strings', () => {
		expect(() => expectPChars('abc{}')).toThrowError('Input contains characters not defined in pchars according to RFC3986');
	});

	it('should not throw error for valid pchar strings', () => {
		expect(() => expectPChars('abcXYZ123-._~')).not.toThrowError();
	});
});

describe('expectIdent', () => {
	it('should throw error for empty identifier', () => {
		expect(() => expectIdent('')).toThrowError('empty identifier');
	});

	it('should throw error for invalid identifier', () => {
		expect(() => expectIdent('123abc')).toThrowError('Invalid identifier: 123abc');
		expect(() => expectIdent('_123')).not.toThrowError();
	});

	it('should not throw error for valid identifier', () => {
		expect(() => expectIdent('abc')).not.toThrowError();
	});
});
