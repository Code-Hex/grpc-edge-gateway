import { InvalidTemplateError } from '../../src/httprule/parse';
import { RuntimePatternRouter, extractComponentsVerb } from '../../src/runtime/router';

describe('RuntimePatternRouter', () => {
	interface TestCase {
		method: string;
		path: string;
		checkPaths: string[];

		wantHandler: string;
		wantParams: Record<string, Record<string, string>>;
	}
	const testCases: TestCase[] = [
		{
			method: 'GET',
			path: '/',
			checkPaths: ['/'],
			wantHandler: 'GET Hello',
			wantParams: {},
		},
		{
			method: 'POST',
			path: '/',
			checkPaths: ['/'],
			wantHandler: 'POST Hello',
			wantParams: {},
		},
		{
			method: 'GET',
			path: '/bar',
			checkPaths: ['/bar'],
			wantHandler: 'GET /bar Hello',
			wantParams: {},
		},
		{
			method: 'GET',
			path: '/bar/*',
			checkPaths: ['/bar/hello', '/bar/world'],
			wantHandler: 'GET /bar/* Hello',
			wantParams: {},
		},
		{
			method: 'GET',
			path: '/bar/**/baz',
			checkPaths: ['/bar/hello/world/baz', '/bar/hello/baz'],
			wantHandler: 'GET /bar/**/baz Hello',
			wantParams: {},
		},
		{
			method: 'GET',
			path: '/shelves/{shelf}',
			checkPaths: ['/shelves/1', '/shelves/2', '/shelves/hello'],
			wantHandler: 'GET shelves w/ params',
			wantParams: {
				'/shelves/1': {
					shelf: '1',
				},
				'/shelves/2': {
					shelf: '2',
				},
				'/shelves/hello': {
					shelf: 'hello',
				},
			},
		},
		{
			method: 'GET',
			path: '/shelves/{shelf}/books/{book}',
			checkPaths: ['/shelves/1/books/1', '/shelves/1/books/2', '/shelves/2/books/1', '/shelves/hello/books/world'],
			wantHandler: 'GET shelves books w/ params',
			wantParams: {
				'/shelves/1/books/1': {
					shelf: '1',
					book: '1',
				},
				'/shelves/1/books/2': {
					shelf: '1',
					book: '2',
				},
				'/shelves/2/books/1': {
					shelf: '2',
					book: '1',
				},
				'/shelves/hello/books/world': {
					shelf: 'hello',
					book: 'world',
				},
			},
		},
		{
			method: 'POST',
			path: '/v1/{parent=publishers/*}/books',
			checkPaths: ['/v1/publishers/hello/books', '/v1/publishers/world/books'],
			wantHandler: 'POST /v1/{parent=publishers/*}/books',
			wantParams: {
				'/v1/publishers/hello/books': {
					parent: 'publishers/hello',
				},
				'/v1/publishers/world/books': {
					parent: 'publishers/world',
				},
			},
		},
		{
			method: 'GET',
			path: '/v1/{name=publishers/*/books/*}',
			checkPaths: ['/v1/publishers/taro/books/1', '/v1/publishers/jiro/books/2'],
			wantHandler: 'POST /v1/{name=publishers/*/books/*}',
			wantParams: {
				'/v1/publishers/taro/books/1': {
					name: 'publishers/taro/books/1',
				},
				'/v1/publishers/jiro/books/2': {
					name: 'publishers/jiro/books/2',
				},
			},
		},
		{
			method: 'GET',
			path: '/v1/{resource=**}/acl',
			checkPaths: ['/v1/user/1/deployment/1/acl', '/v1/user/2/logs/3/acl'],
			wantHandler: 'GET /v1/{resource=**}',
			wantParams: {
				'/v1/user/1/deployment/1/acl': {
					resource: 'user/1/deployment/1',
				},
				'/v1/user/2/logs/3/acl': {
					resource: 'user/2/logs/3',
				},
			},
		},
		{
			method: 'GET',
			path: '/v1/{resource=**}:getAcl',
			checkPaths: ['/v1/user/1/deployment/1:getAcl', '/v1/user/2/logs/3:getAcl'],
			wantHandler: 'GET /v1/{resource=**}:getAcl',
			wantParams: {
				'/v1/user/1/deployment/1:getAcl': {
					resource: 'user/1/deployment/1',
				},
				'/v1/user/2/logs/3:getAcl': {
					resource: 'user/2/logs/3',
				},
			},
		},
	];
	testCases.forEach((tc) => {
		test(`${tc.method} ${tc.path}}`, () => {
			const router = new RuntimePatternRouter<string>();
			router.add(tc.method, tc.path, tc.wantHandler);

			tc.checkPaths.forEach((checkPath) => {
				const res = router.match(tc.method, checkPath);
				expect(res).not.toBeNull();
				expect(res?.handlers).toEqual([tc.wantHandler]);
				const wantParams = tc.wantParams[checkPath] ?? {};
				expect(res?.params).toEqual(wantParams);
			});
		});
	});

	describe('invalid add router', () => {
		interface TestCase {
			method: string;
			path: string;
		}
		const testCases: TestCase[] = [
			{
				method: 'POST',
				path: 'v1/b/taro/do',
			},
		];
		testCases.forEach((tc) => {
			test(`${tc.method} ${tc.path}}`, () => {
				const router = new RuntimePatternRouter<string>();
				expect(() => router.add(tc.method, tc.path, 'test')).toThrow(InvalidTemplateError);
			});
		});
	});
});

describe('extractComponentsVerb', () => {
	interface TestCase {
		name: string;
		patternVerb: string;
		pathComponents: string[];

		wantComponents: string[];
		wantVerb: string;
	}
	const testCases: TestCase[] = [
		{
			name: `should return the same components when patVerb is empty and path does not contain ":"`,
			patternVerb: '',
			pathComponents: ['v1', 'a', 'b'],
			wantComponents: ['v1', 'a', 'b'],
			wantVerb: '',
		},
		{
			name: `should return the same components when patVerb is empty and path ends with ":"`,
			patternVerb: '',
			pathComponents: ['v1', 'a:', 'b'],
			wantComponents: ['v1', 'a:', 'b'],
			wantVerb: '',
		},
		{
			name: `should return modified components and verb when patVerb is provided and path ends with ":<patVerb>"`,
			patternVerb: 'deactivate',
			pathComponents: ['v1', 'a:deactivate'],
			wantComponents: ['v1', 'a'],
			wantVerb: 'deactivate',
		},
		{
			name: `should return the same components when patVerb is provided and path does not end with ":<patVerb>"`,
			patternVerb: 'deactivate',
			pathComponents: ['v1', 'a:post'],
			wantComponents: ['v1', 'a:post'],
			wantVerb: '',
		},
	];
	testCases.forEach((tc) => {
		test(tc.name, () => {
			const { components, verb } = extractComponentsVerb(tc.patternVerb, tc.pathComponents);
			expect(components).toEqual(tc.wantComponents);
			expect(verb).toEqual(tc.wantVerb);
		});
	});
});
