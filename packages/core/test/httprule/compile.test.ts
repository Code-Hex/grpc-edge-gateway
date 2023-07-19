import { Segment, Literal, TemplateCompiler, Wildcard, DeepWildcard, Variable, eof } from '../../src/httprule/compile';
import { OpCode } from '../../src/opcode';

const operandFiller = 0;

interface TestCase {
	segs: Segment[];
	verb: string;

	ops: number[];
	pool: string[];
	fields: string[];
}

describe('Template Compile Function', () => {
	const testCases: TestCase[] = [
		{
			segs: [],
			verb: '',
			ops: [],
			pool: [],
			fields: [],
		},
		{
			segs: [new Literal(eof)],
			verb: '',
			ops: [OpCode.OpLitPush, 0],
			pool: [''],
			fields: [],
		},
		{
			segs: [new Wildcard()],
			verb: '',
			ops: [OpCode.OpPush, operandFiller],
			pool: [],
			fields: [],
		},
		{
			segs: [new DeepWildcard()],
			verb: '',
			ops: [OpCode.OpPushM, operandFiller],
			pool: [],
			fields: [],
		},
		{
			segs: [new Literal('v1')],
			verb: '',
			ops: [OpCode.OpLitPush, 0],
			pool: ['v1'],
			fields: [],
		},
		{
			segs: [new Literal('v1')],
			verb: 'LOCK',
			ops: [OpCode.OpLitPush, 0],
			pool: ['v1'],
			fields: [],
		},
		{
			segs: [new Variable([new Wildcard()], 'name.nested')],
			verb: '',
			ops: [OpCode.OpPush, operandFiller, OpCode.OpConcatN, 1, OpCode.OpCapture, 0],
			pool: ['name.nested'],
			fields: ['name.nested'],
		},
		{
			segs: [
				new Literal('obj'),
				new Variable([new Literal('a'), new Wildcard(), new Literal('b')], 'name.nested'),
				new Variable([new DeepWildcard()], 'obj'),
			],
			verb: '',
			ops: [
				OpCode.OpLitPush,
				0,
				OpCode.OpLitPush,
				1,
				OpCode.OpPush,
				operandFiller,
				OpCode.OpLitPush,
				2,
				OpCode.OpConcatN,
				3,
				OpCode.OpCapture,
				3,
				OpCode.OpPushM,
				operandFiller,
				OpCode.OpConcatN,
				1,
				OpCode.OpCapture,
				0,
			],
			pool: ['obj', 'a', 'b', 'name.nested'],
			fields: ['name.nested', 'obj'],
		},
	];

	testCases.forEach((tc, index) => {
		const template = '/v1';
		const opcodeVersion = 1; // Update this to your actual version.
		test(`Test case ${index}`, () => {
			const tmpl = new TemplateCompiler(tc.segs, tc.verb, template);
			const compiled = tmpl.compile();

			expect(compiled.version).toEqual(opcodeVersion);
			expect(compiled.opCodes).toEqual(tc.ops);
			expect(compiled.pool).toEqual(tc.pool);
			expect(compiled.verb).toEqual(tc.verb);
			expect(compiled.fields).toEqual(tc.fields);
			expect(compiled.template).toEqual(template);
		});
	});
});
