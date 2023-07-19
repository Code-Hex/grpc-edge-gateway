import { OpCode } from '../opcode';

export const opcodeVersion = 1;

export interface Template {
	// Version is the version number of the format.
	version: number;
	// OpCodes is a sequence of operations.
	opCodes: number[];
	// Pool is a constant pool
	pool: string[];
	// Verb is a VERB part in the template.
	verb: string;
	// Fields is a list of field paths bound in this template.
	fields: string[];
	// Original template (example: /v1/a_bit_of_everything)
	template: string;
}

export interface Compiler {
	compile: () => Template;
}

export interface Op {
	// code is the opcode of the operation
	code: OpCode;

	// str is a string operand of the code.
	// num is ignored if str is not empty.
	str: string;

	// num is a numeric operand of the code.
	num: number;
}

// Assuming wildcard, deepWildcard, literal, variable, template are defined elsewhere.
export interface Segment {
	toString: () => string;
	compile: () => Op[];
}

export class Wildcard implements Segment {
	toString() {
		return '*';
	}

	compile(): Op[] {
		return [{ code: OpCode.OpPush, str: '', num: 0 }];
	}
}

export class DeepWildcard implements Segment {
	toString(): string {
		return '**';
	}

	compile(): Op[] {
		return [{ code: OpCode.OpPushM, str: '', num: 0 }];
	}
}

export class Literal implements Segment {
	str: string;

	constructor(str: string) {
		this.str = str;
	}

	toString() {
		return this.str;
	}

	compile(): Op[] {
		return [
			{
				code: OpCode.OpLitPush,
				str: this.str,
				num: 0,
			},
		];
	}
}

export class Variable implements Segment {
	segments: Segment[];
	path: string;

	constructor(segments: Segment[], path: string) {
		this.segments = segments;
		this.path = path;
	}

	toString() {
		const segs: string[] = this.segments.map((s) => s.toString());
		return `{${this.path}=${segs.join('/')}}`;
	}

	compile(): Op[] {
		const ops: Op[] = this.segments.map((s) => s.compile()).flat();
		ops.push(
			{
				code: OpCode.OpConcatN,
				num: this.segments.length,
				str: '',
			},
			{
				code: OpCode.OpCapture,
				str: this.path,
				num: 0,
			}
		);

		return ops;
	}
}

export const eof = '\u0000';

export class TemplateCompiler implements Compiler {
	segments: Segment[];
	verb: string;
	template: string;

	constructor(segments: Segment[], verb: string, template: string) {
		this.segments = segments;
		this.verb = verb;
		this.template = template;
	}

	toString() {
		const segs = this.segments.map((s) => s.toString());
		let str = segs.join('/');
		if (this.verb !== '') {
			str = `${str}:${this.verb}`;
		}
		return `/${str}`;
	}

	compile(): Template {
		const rawOps: Op[] = this.segments.map((s) => s.compile()).flat();

		const ops: number[] = [];
		const pool: string[] = [];
		const fields: string[] = [];
		const consts: Record<string, number> = {};

		for (const op of rawOps) {
			ops.push(op.code);
			if (op.str === '') {
				ops.push(op.num);
			} else {
				// eof segment literal represents the "/" path pattern
				if (op.str === eof) {
					op.str = '';
				}
				if (!(op.str in consts)) {
					consts[op.str] = pool.length;
					pool.push(op.str);
				}
				ops.push(consts[op.str]);
			}
			if (op.code === OpCode.OpCapture) {
				fields.push(op.str);
			}
		}

		return {
			version: opcodeVersion,
			opCodes: ops,
			pool: pool,
			verb: this.verb,
			fields: fields,
			template: this.template,
		};
	}
}
