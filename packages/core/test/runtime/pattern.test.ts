import { OpCode } from '../../src/opcode';
import { InvalidPatternError, NotMatchError } from '../../src/runtime/errors';
import { Pattern, UnescapingMode } from '../../src/runtime/pattern';

const anything = 0;
const validVersion = 1;

describe('NewPattern', () => {
	describe('Valid', () => {
		interface TestCase {
			ops?: number[];
			pool?: string[];
			verb?: string;

			stackSizeWant: number;
			tailLenWant: number;
		}
		const testCases: TestCase[] = [
			{
				stackSizeWant: 0,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpNop, anything],
				stackSizeWant: 0,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpPush, anything],
				stackSizeWant: 1,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpLitPush, 0],
				pool: ['abc'],
				stackSizeWant: 1,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpPushM, anything],
				stackSizeWant: 1,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpPush, anything, OpCode.OpConcatN, 1],
				stackSizeWant: 1,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpPush, anything, OpCode.OpConcatN, 1, OpCode.OpCapture, 0],
				pool: ['abc'],
				stackSizeWant: 1,
				tailLenWant: 0,
			},
			{
				ops: [
					OpCode.OpPush,
					anything,
					OpCode.OpLitPush,
					0,
					OpCode.OpLitPush,
					1,
					OpCode.OpPushM,
					anything,
					OpCode.OpConcatN,
					2,
					OpCode.OpCapture,
					2,
				],
				pool: ['lit1', 'lit2', 'var1'],
				stackSizeWant: 4,
				tailLenWant: 0,
			},
			{
				ops: [OpCode.OpPushM, anything, OpCode.OpConcatN, 1, OpCode.OpCapture, 2, OpCode.OpLitPush, 0, OpCode.OpLitPush, 1],
				pool: ['lit1', 'lit2', 'var1'],
				stackSizeWant: 2,
				tailLenWant: 2,
			},
			{
				ops: [
					OpCode.OpLitPush,
					0,
					OpCode.OpLitPush,
					1,
					OpCode.OpPushM,
					anything,
					OpCode.OpLitPush,
					2,
					OpCode.OpConcatN,
					3,
					OpCode.OpLitPush,
					3,
					OpCode.OpCapture,
					4,
				],
				pool: ['lit1', 'lit2', 'lit3', 'lit4', 'var1'],
				stackSizeWant: 4,
				tailLenWant: 2,
			},
			{
				ops: [OpCode.OpLitPush, 0],
				pool: ['abc'],
				verb: 'LOCK',
				stackSizeWant: 1,
				tailLenWant: 0,
			},
		];
		testCases.forEach((tc) => {
			test(`stackSizeWant: ${tc.stackSizeWant}, tailLenWant: ${tc.tailLenWant}`, () => {
				const p = Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], tc.verb ?? '');
				expect(p.stacksize).toEqual(tc.stackSizeWant);
				expect(p.tailLen).toEqual(tc.tailLenWant);
			});
		});
	});

	describe('with wrong op', () => {
		interface TestCase {
			name: string;
			ops?: number[];
			pool?: string[];
			verb?: string;
		}
		const testCases: TestCase[] = [
			{
				name: 'op code out of bound',
				ops: [-1, anything],
			},
			{
				name: 'op code out of bound',
				ops: [OpCode.OpEnd, 0],
			},
			{
				name: 'odd number of items',
				ops: [OpCode.OpPush],
			},
			{
				name: 'negative index',
				ops: [OpCode.OpLitPush, -1],
				pool: ['abc'],
			},
			{
				name: 'index out of bound',
				ops: [OpCode.OpLitPush, 1],
				pool: ['abc'],
			},
			{
				name: 'negative # of segments',
				ops: [OpCode.OpConcatN, -1],
				pool: ['abc'],
			},
			{
				name: 'negative index',
				ops: [OpCode.OpCapture, -1],
				pool: ['abc'],
			},
			{
				name: 'index out of bound',
				ops: [OpCode.OpCapture, 1],
				pool: ['abc'],
			},
			{
				name: 'pushM appears twice',
				ops: [OpCode.OpPushM, anything, OpCode.OpLitPush, 0, OpCode.OpPushM, anything],
				pool: ['abc'],
			},
		];
		testCases.forEach((tc) => {
			test(tc.name, () => {
				expect(() => Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], tc.verb ?? '')).toThrow(InvalidPatternError);
			});
		});
	});

	describe('with stack underflow', () => {
		interface TestCase {
			ops?: number[];
			pool?: string[];
			verb?: string;
		}
		const testCases: TestCase[] = [
			{
				ops: [OpCode.OpConcatN, 1],
			},
			{
				ops: [OpCode.OpCapture, 0],
				pool: ['abc'],
			},
		];
		testCases.forEach((tc, i) => {
			test(`test case ${i}`, () => {
				expect(() => Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], tc.verb ?? '')).toThrow(InvalidPatternError);
			});
		});
	});
});

describe('PatternString', () => {
	interface TestCase {
		ops?: number[];
		pool?: string[];

		want: string;
	}
	const testCases: TestCase[] = [
		{
			want: '/',
		},
		{
			ops: [OpCode.OpNop, anything],
			want: '/',
		},
		{
			ops: [OpCode.OpPush, anything],
			want: '/*',
		},
		{
			ops: [OpCode.OpLitPush, 0],
			pool: ['endpoint'],
			want: '/endpoint',
		},
		{
			ops: [OpCode.OpPushM, anything],
			want: '/**',
		},
		{
			ops: [OpCode.OpPush, anything, OpCode.OpConcatN, 1],
			want: '/*',
		},
		{
			ops: [OpCode.OpPush, anything, OpCode.OpConcatN, 1, OpCode.OpCapture, 0],
			pool: ['name'],
			want: '/{name=*}',
		},
		{
			ops: [
				OpCode.OpLitPush,
				0,
				OpCode.OpLitPush,
				1,
				OpCode.OpPush,
				anything,
				OpCode.OpConcatN,
				2,
				OpCode.OpCapture,
				2,
				OpCode.OpLitPush,
				3,
				OpCode.OpPushM,
				anything,
				OpCode.OpLitPush,
				4,
				OpCode.OpConcatN,
				3,
				OpCode.OpCapture,
				6,
				OpCode.OpLitPush,
				5,
			],
			pool: ['v1', 'buckets', 'bucket_name', 'objects', '.ext', 'tail', 'name'],
			want: '/v1/{bucket_name=buckets/*}/{name=objects/**/.ext}/tail',
		},
	];

	testCases.forEach((tc) => {
		test(`want: ${tc.want}`, () => {
			const p = Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], '');
			const got = p.toString();
			expect(got).toEqual(tc.want);
		});

		test(`want with verb: ${tc.want}`, () => {
			const verb = 'LOCK';
			const p = Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], verb);
			const got = p.toString();
			expect(got).toEqual(`${tc.want}:${verb}`);
		});
	});
});

describe('Match', () => {
	function segments(path: string) {
		if (path === '') {
			return {
				components: [],
				verb: '',
			};
		}
		let verb = '';
		let components = path.split('/');
		const l = components.length;
		const c = components[l - 1];
		const idx = c.lastIndexOf(':');
		if (idx >= 0) {
			components[l - 1] = c.slice(0, idx);
			verb = c.slice(idx + 1);
		}
		return {
			components,
			verb,
		};
	}

	describe('w/o binding', () => {
		interface TestCase {
			ops?: number[];
			pool?: string[];
			verb?: string;

			match?: string[];
			notMatch?: string[];
		}
		const testCases: TestCase[] = [
			{
				match: [''],
				notMatch: ['example'],
			},
			{
				ops: [OpCode.OpNop, anything],
				match: [''],
				notMatch: ['example', 'path/to/example'],
			},
			{
				ops: [OpCode.OpPush, anything],
				match: ['abc', 'def'],
				notMatch: ['', 'abc/def'],
			},
			{
				ops: [OpCode.OpLitPush, 0],
				pool: ['v1'],
				match: ['v1'],
				notMatch: ['', 'v2'],
			},
			{
				ops: [OpCode.OpPushM, anything],
				match: ['', 'abc', 'abc/def', 'abc/def/ghi'],
			},
			{
				ops: [OpCode.OpPushM, anything, OpCode.OpLitPush, 0],
				pool: ['tail'],
				match: ['tail', 'abc/tail', 'abc/def/tail'],
				notMatch: ['', 'abc', 'abc/def', 'tail/extra', 'abc/tail/extra', 'abc/def/tail/extra'],
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpLitPush, 1, OpCode.OpPush, anything, OpCode.OpConcatN, 1, OpCode.OpCapture, 2],
				pool: ['v1', 'bucket', 'name'],
				match: ['v1/bucket/my-bucket', 'v1/bucket/our-bucket'],
				notMatch: ['', 'v1', 'v1/bucket', 'v2/bucket/my-bucket', 'v1/pubsub/my-topic'],
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpLitPush, 1, OpCode.OpPushM, anything, OpCode.OpConcatN, 2, OpCode.OpCapture, 2],
				pool: ['v1', 'o', 'name'],
				match: [
					'v1/o',
					'v1/o/my-bucket',
					'v1/o/our-bucket',
					'v1/o/my-bucket/dir',
					'v1/o/my-bucket/dir/dir2',
					'v1/o/my-bucket/dir/dir2/obj',
				],
				notMatch: ['', 'v1', 'v2/o/my-bucket', 'v1/b/my-bucket'],
			},
			{
				ops: [
					OpCode.OpLitPush,
					0,
					OpCode.OpLitPush,
					1,
					OpCode.OpPush,
					anything,
					OpCode.OpConcatN,
					2,
					OpCode.OpCapture,
					2,
					OpCode.OpLitPush,
					3,
					OpCode.OpPush,
					anything,
					OpCode.OpConcatN,
					1,
					OpCode.OpCapture,
					4,
				],
				pool: ['v2', 'b', 'name', 'o', 'oname'],
				match: ['v2/b/my-bucket/o/obj', 'v2/b/our-bucket/o/obj', 'v2/b/my-bucket/o/dir'],
				notMatch: ['', 'v2', 'v2/b', 'v2/b/my-bucket', 'v2/b/my-bucket/o'],
			},
			{
				ops: [OpCode.OpLitPush, 0],
				pool: ['v1'],
				verb: 'LOCK',
				match: ['v1:LOCK'],
				notMatch: ['v1', 'LOCK'],
			},
		];
		testCases.forEach((tc, idx) => {
			test(`test case ${idx}`, () => {
				const p = Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], tc.verb ?? '');
				tc.match?.forEach((path) => {
					const { components, verb } = segments(path);
					expect(() => p.matchAndEscape(components, verb, UnescapingMode.Default)).not.toThrow();
				});
				tc.notMatch?.forEach((path) => {
					const { components, verb } = segments(path);
					expect(() => p.matchAndEscape(components, verb, UnescapingMode.Default)).toThrow(NotMatchError);
				});
			});
		});
	});

	describe('w/ binding', () => {
		interface TestCase {
			ops?: number[];
			pool?: string[];
			path?: string;
			verb?: string;
			mode?: UnescapingMode;

			want: Record<string, string>;
		}
		const testCases: TestCase[] = [
			{
				want: {},
			},
			{
				ops: [OpCode.OpNop, anything],
				want: {},
			},
			{
				ops: [OpCode.OpPush, anything],
				path: 'abc',
				want: {},
			},
			{
				ops: [OpCode.OpPush, anything],
				verb: 'LOCK',
				path: 'abc:LOCK',
				want: {},
			},
			{
				ops: [OpCode.OpLitPush, 0],
				pool: ['endpoint'],
				path: 'endpoint',
				want: {},
			},
			{
				ops: [OpCode.OpPushM, anything],
				path: 'abc/def/ghi',
				want: {},
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpLitPush, 1, OpCode.OpPush, anything, OpCode.OpConcatN, 1, OpCode.OpCapture, 2],
				pool: ['v1', 'bucket', 'name'],
				path: 'v1/bucket/my-bucket',
				want: { name: 'my-bucket' },
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpLitPush, 1, OpCode.OpPush, anything, OpCode.OpConcatN, 1, OpCode.OpCapture, 2],
				pool: ['v1', 'bucket', 'name'],
				verb: 'LOCK',
				path: 'v1/bucket/my-bucket:LOCK',
				want: { name: 'my-bucket' },
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpLitPush, 1, OpCode.OpPushM, anything, OpCode.OpConcatN, 2, OpCode.OpCapture, 2],
				pool: ['v1', 'o', 'name'],
				path: 'v1/o/my-bucket/dir/dir2/obj',
				want: { name: 'o/my-bucket/dir/dir2/obj' },
			},
			{
				ops: [
					OpCode.OpLitPush,
					0,
					OpCode.OpLitPush,
					1,
					OpCode.OpPushM,
					anything,
					OpCode.OpLitPush,
					2,
					OpCode.OpConcatN,
					3,
					OpCode.OpCapture,
					4,
					OpCode.OpLitPush,
					3,
				],
				pool: ['v1', 'o', '.ext', 'tail', 'name'],
				path: 'v1/o/my-bucket/dir/dir2/obj/.ext/tail',
				want: { name: 'o/my-bucket/dir/dir2/obj/.ext' },
			},
			{
				ops: [
					OpCode.OpLitPush,
					0,
					OpCode.OpLitPush,
					1,
					OpCode.OpPush,
					anything,
					OpCode.OpConcatN,
					2,
					OpCode.OpCapture,
					2,
					OpCode.OpLitPush,
					3,
					OpCode.OpPush,
					anything,
					OpCode.OpConcatN,
					1,
					OpCode.OpCapture,
					4,
				],
				pool: ['v2', 'b', 'name', 'o', 'oname'],
				path: 'v2/b/my-bucket/o/obj',
				want: {
					name: 'b/my-bucket',
					oname: 'obj',
				},
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpPush, 0, OpCode.OpConcatN, 1, OpCode.OpCapture, 1, OpCode.OpLitPush, 2],
				pool: ['foo', 'id', 'bar'],
				path: 'foo/part1%2Fpart2/bar',
				want: { id: 'part1/part2' },
				mode: UnescapingMode.AllExceptReserved,
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpPushM, 0, OpCode.OpConcatN, 1, OpCode.OpCapture, 1],
				pool: ['foo', 'id'],
				path: 'foo/test%2Fbar',
				want: { id: 'test%2Fbar' },
				mode: UnescapingMode.AllExceptReserved,
			},
			{
				ops: [OpCode.OpLitPush, 0, OpCode.OpPushM, 0, OpCode.OpConcatN, 1, OpCode.OpCapture, 1],
				pool: ['foo', 'id'],
				path: 'foo/test%2Fbar',
				want: { id: 'test/bar' },
				mode: UnescapingMode.AllCharacters,
			},
		];
		testCases.forEach((tc, idx) => {
			test(`test case ${idx}`, () => {
				const p = Pattern.create(validVersion, tc.ops ?? [], tc.pool ?? [], tc.verb ?? '');
				const { components, verb } = segments(tc.path ?? '');
				expect(p.matchAndEscape(components, verb, tc.mode ?? UnescapingMode.Default)).toEqual(tc.want);
			});
		});
	});
});
