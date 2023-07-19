import { isValidGRPCMetadataKey, isValidGRPCMetadataTextValue, canonicalMIMEHeaderKey, timeoutDecode } from '../../src/runtime/header';

describe('isValidGRPCMetadataKey', () => {
	test('returns true for valid keys', () => {
		expect(isValidGRPCMetadataKey('valid-Key_9')).toBeTruthy();
		expect(isValidGRPCMetadataKey('also-valid.key')).toBeTruthy();
	});

	test('returns false for invalid keys', () => {
		expect(isValidGRPCMetadataKey('invalid key')).toBeFalsy();
		expect(isValidGRPCMetadataKey('invalid/key')).toBeFalsy();
	});

	test('boundary value tests', () => {
		expect(isValidGRPCMetadataKey('')).toBeFalsy();
		expect(isValidGRPCMetadataKey('-')).toBeTruthy();
		expect(isValidGRPCMetadataKey('_')).toBeTruthy();
		expect(isValidGRPCMetadataKey('.')).toBeTruthy();
	});
});

describe('isValidGRPCMetadataTextValue', () => {
	test('returns true for valid text values', () => {
		expect(isValidGRPCMetadataTextValue('valid text value')).toBeTruthy();
		expect(
			isValidGRPCMetadataTextValue("!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")
		).toBeTruthy();
	});

	test('returns false for invalid text values', () => {
		expect(isValidGRPCMetadataTextValue('invalid\ntext\nvalue')).toBeFalsy();
		expect(isValidGRPCMetadataTextValue('invalid\x7Ftext\x80value')).toBeFalsy();
	});

	test('boundary value tests', () => {
		expect(isValidGRPCMetadataTextValue('')).toBeTruthy();
		expect(isValidGRPCMetadataTextValue(' ')).toBeTruthy();
		expect(isValidGRPCMetadataTextValue('~')).toBeTruthy();
	});
});

describe('canonicalMIMEHeaderKey', () => {
	test('returns a string with each word capitalized', () => {
		expect(canonicalMIMEHeaderKey('content-type')).toEqual('Content-Type');
		expect(canonicalMIMEHeaderKey('ACCEPT-RANGES')).toEqual('Accept-Ranges');
	});

	test('returns the original string if it has no hyphens', () => {
		expect(canonicalMIMEHeaderKey('authorization')).toEqual('Authorization');
		expect(canonicalMIMEHeaderKey('HOST')).toEqual('Host');
	});

	test('boundary value tests', () => {
		expect(canonicalMIMEHeaderKey('')).toEqual('');
		expect(canonicalMIMEHeaderKey('-')).toEqual('-');
		expect(canonicalMIMEHeaderKey('a-b')).toEqual('A-B');
	});
});

describe('timeoutDecode', () => {
	test('returns correct milliseconds for given timeout string', () => {
		expect(timeoutDecode('1H')).toEqual(60 * 60 * 1000);
		expect(timeoutDecode('2M')).toEqual(2 * 60 * 1000);
		expect(timeoutDecode('3S')).toEqual(3 * 1000);
		expect(timeoutDecode('4m')).toEqual(4);
		expect(timeoutDecode('5u')).toEqual(0.005);
		expect(timeoutDecode('6n')).toEqual(0.000006);
	});

	test('throws an error for invalid timeout strings', () => {
		expect(() => timeoutDecode('H')).toThrow(Error);
		expect(() => timeoutDecode('7X')).toThrow(Error);
		expect(() => timeoutDecode('8')).toThrow(Error);
	});

	test('boundary value tests', () => {
		expect(() => timeoutDecode('')).toThrow(Error);
		expect(timeoutDecode('1m')).toEqual(1);
		expect(() => timeoutDecode('1x')).toThrow(Error);
	});
});
