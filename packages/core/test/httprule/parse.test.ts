import { DeepWildcard, Literal, Variable, Wildcard, eof } from '../../src/httprule/compile';
import { InvalidTemplateError, parse, parser, tokenize } from '../../src/httprule/parse';

describe('Tokenize Function', () => {
	interface TestCase {
		src: string;
		tokens: string[];
		verb: string;
	}
	const testCases: TestCase[] = [
		{
			src: '',
			tokens: [eof],
			verb: '',
		},
		{
			src: 'v1',
			tokens: ['v1', eof],
			verb: '',
		},
		{
			src: 'v1/b',
			tokens: ['v1', '/', 'b', eof],
			verb: '',
		},
		{
			src: 'v1/endpoint/*',
			tokens: ['v1', '/', 'endpoint', '/', '*', eof],
			verb: '',
		},
		{
			src: 'v1/endpoint/**',
			tokens: ['v1', '/', 'endpoint', '/', '**', eof],
			verb: '',
		},
		{
			src: 'v1/b/{bucket_name=*}',
			tokens: ['v1', '/', 'b', '/', '{', 'bucket_name', '=', '*', '}', eof],
			verb: '',
		},
		{
			src: 'v1/b/{bucket_name=buckets/*}/o',
			tokens: ['v1', '/', 'b', '/', '{', 'bucket_name', '=', 'buckets', '/', '*', '}', '/', 'o', eof],
			verb: '',
		},
		{
			src: 'v1/b/{bucket_name=buckets/*}/o/{name}',
			tokens: ['v1', '/', 'b', '/', '{', 'bucket_name', '=', 'buckets', '/', '*', '}', '/', 'o', '/', '{', 'name', '}', eof],
			verb: '',
		},
		{
			src: 'v1/a=b&c=d;e=f:g/endpoint.rdf',
			tokens: ['v1', '/', 'a=b&c=d;e=f:g', '/', 'endpoint.rdf', eof],
			verb: '',
		},
		{
			src: 'v1/a/{endpoint}:a',
			tokens: ['v1', '/', 'a', '/', '{', 'endpoint', '}', eof],
			verb: 'a',
		},
		{
			src: 'v1/a/{endpoint}:b:c',
			tokens: ['v1', '/', 'a', '/', '{', 'endpoint', '}', eof],
			verb: 'b:c',
		},
	];

	testCases.forEach((tc) => {
		test(`Test case: ${tc.src}`, () => {
			const { tokens, verb } = tokenize(tc.src);
			expect(tokens).toEqual(tc.tokens);

			if (tc.verb !== '') {
				expect(verb).toEqual(tc.verb);
			} else {
				expect(verb).toEqual('');
				const { tokens: tokensWithLock, verb: verbWithLock } = tokenize(`${tc.src}:LOCK`);
				expect(tokensWithLock).toEqual(tc.tokens);
				expect(verbWithLock).toEqual('LOCK');
			}
		});
	});
});

describe('Parse Segments', () => {
	const specs = [
		{
			tokens: [eof],
			want: [new Literal(eof)],
		},
		{
			tokens: [eof, 'v1', eof],
			want: [new Literal(eof)],
		},
		{
			tokens: ['v1', eof],
			want: [new Literal('v1')],
		},
		{
			tokens: ['/', eof],
			want: [new Wildcard()],
		},
		{
			tokens: ["-._~!$&'()*+,;=:@", eof],
			want: [new Literal("-._~!$&'()*+,;=:@")],
		},
		{
			tokens: ['%e7%ac%ac%e4%b8%80%e7%89%88', eof],
			want: [new Literal('%e7%ac%ac%e4%b8%80%e7%89%88')],
		},
		{
			tokens: ['v1', '/', '*', eof],
			want: [new Literal('v1'), new Wildcard()],
		},
		{
			tokens: ['v1', '/', '**', eof],
			want: [new Literal('v1'), new DeepWildcard()],
		},
		{
			tokens: ['{', 'name', '}', eof],
			want: [new Variable([new Wildcard()], 'name')],
		},
		{
			tokens: ['{', 'name', '=', '*', '}', eof],
			want: [new Variable([new Wildcard()], 'name')],
		},
		{
			tokens: ['{', 'field', '.', 'nested', '.', 'nested2', '=', '*', '}', eof],
			want: [new Variable([new Wildcard()], 'field.nested.nested2')],
		},
		{
			tokens: ['{', 'name', '=', 'a', '/', 'b', '/', '*', '}', eof],
			want: [new Variable([new Literal('a'), new Literal('b'), new Wildcard()], 'name')],
		},
		{
			tokens: [
				'v1',
				'/',
				'{',
				'name',
				'.',
				'nested',
				'.',
				'nested2',
				'=',
				'a',
				'/',
				'b',
				'/',
				'*',
				'}',
				'/',
				'o',
				'/',
				'{',
				'another_name',
				'=',
				'a',
				'/',
				'b',
				'/',
				'*',
				'/',
				'c',
				'}',
				'/',
				'**',
				eof,
			],
			want: [
				new Literal('v1'),
				new Variable([new Literal('a'), new Literal('b'), new Wildcard()], 'name.nested.nested2'),
				new Literal('o'),
				new Variable([new Literal('a'), new Literal('b'), new Wildcard(), new Literal('c')], 'another_name'),
				new DeepWildcard(),
			],
		},
	];

	for (const spec of specs) {
		test(`tokens: ${spec.tokens.join(',')}`, () => {
			const p = new parser(spec.tokens);
			const segs = p.topLevelSegments();

			expect(segs).toEqual(spec.want);
			expect(p.tokens).toHaveLength(0);
		});
	}
});

describe('Parse', () => {
	interface TestCase {
		input: string;
		wantFields: string[];
		wantPool: string[];
		wantVerb: string;
	}

	const testCases: TestCase[] = [
		{
			input: '/v1/{name}:bla:baa',
			wantFields: ['name'],
			wantPool: ['v1', 'name'],
			wantVerb: 'bla:baa',
		},
		{
			input: '/v1/{name}:',
			wantFields: ['name'],
			wantPool: ['v1', 'name'],
			wantVerb: '',
		},
		{
			input: '/v1/{name=segment/wi:th}',
			wantFields: ['name'],
			wantPool: ['v1', 'segment', 'wi:th', 'name'],
			wantVerb: '',
		},
	];

	for (const tc of testCases) {
		test(`input: ${tc.input}`, () => {
			const compiler = parse(tc.input); // Parse function is expected to return a suitable object for this test case
			const tmpl = compiler.compile();

			expect(tmpl.fields).toEqual(tc.wantFields);
			expect(tmpl.pool).toEqual(tc.wantPool);
			expect(tmpl.template).toEqual(tc.input);
			expect(tmpl.verb).toEqual(tc.wantVerb);
		});
	}
});

describe('ParseError', () => {
	interface TestCase {
		input: string;
		wantError: Error;
	}

	const testCases: TestCase[] = [
		{
			input: 'v1/{name}',
			wantError: new InvalidTemplateError('v1/{name}', 'no leading /'),
		},
	];

	for (const tc of testCases) {
		test(`input: ${tc.input}`, () => {
			expect(() => parse(tc.input)).toThrowError(tc.wantError);
		});
	}
});

describe('ParseSegmentsWithErrors', () => {
	interface TestCase {
		name: string;
		tokens: string[];
	}

	const testCases: TestCase[] = [
		{
			name: 'double slash',
			tokens: ['//', eof],
		},
		{
			name: 'invalid literal',
			tokens: ['a?b', eof],
		},
		{
			name: 'invalid percent-encoding',
			tokens: ['%', eof],
		},
		{
			name: 'invalid percent-encoding',
			tokens: ['%2', eof],
		},
		{
			name: 'invalid percent-encoding',
			tokens: ['a%2z', eof],
		},
		{
			name: 'unterminated variable',
			tokens: ['{', 'name', eof],
		},
		{
			name: 'unterminated variable',
			tokens: ['{', 'name', '=', eof],
		},
		{
			name: 'unterminated variable',
			tokens: ['{', 'name', '=', '*', eof],
		},
		{
			name: 'empty component in field path',
			tokens: ['{', 'name', '.', '}', eof],
		},
		{
			name: 'empty component in field path',
			tokens: ['{', 'name', '.', '.', 'nested', '}', eof],
		},
		{
			name: 'invalid character in identifier',
			tokens: ['{', 'field-name', '}', eof],
		},
		{
			name: 'no slash between segments',
			tokens: ['v1', 'endpoint', eof],
		},
		{
			name: 'no slash between segments',
			tokens: ['v1', '{', 'name', '}', eof],
		},
	];

	for (const tc of testCases) {
		test(tc.name, () => {
			const p = new parser(tc.tokens);
			expect(p.topLevelSegments).toThrowError();
		});
	}
});
