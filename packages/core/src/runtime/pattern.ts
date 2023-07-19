import { OpCode } from '../opcode';
import { InvalidPatternError, MalformedSequenceError, NotMatchError } from './errors';

type Op = {
	code: OpCode;
	operand: number;
};

export class Pattern {
	private ops: Op[];
	private pool: string[];
	private vars: string[];
	private _stacksize: number;
	private _tailLen: number;
	private _verb: string;

	private constructor() {
		this.ops = [];
		this.pool = [];
		this.vars = [];
		this._stacksize = 0;
		this._tailLen = 0;
		this._verb = '';
	}

	static create(version: number, ops: number[], pool: string[], verb: string): Pattern {
		if (version !== 1) {
			throw new InvalidPatternError();
		}

		const l = ops.length;
		if (l % 2 !== 0) {
			throw new InvalidPatternError();
		}

		let typedOps: Op[] = [];
		let stack = 0,
			maxstack = 0;
		let tailLen = 0;
		let pushMSeen = false;
		let vars: string[] = [];

		for (let i = 0; i < l; i += 2) {
			let op: Op = { code: ops[i] as OpCode, operand: ops[i + 1] };
			switch (op.code) {
				case OpCode.OpNop:
					continue;
				case OpCode.OpPush:
					if (pushMSeen) {
						tailLen++;
					}
					stack++;
					break;
				case OpCode.OpPushM:
					if (pushMSeen) {
						throw new InvalidPatternError();
					}
					pushMSeen = true;
					stack++;
					break;
				case OpCode.OpLitPush:
					if (op.operand < 0 || pool.length <= op.operand) {
						throw new InvalidPatternError();
					}
					if (pushMSeen) {
						tailLen++;
					}
					stack++;
					break;
				case OpCode.OpConcatN:
					if (op.operand <= 0) {
						throw new InvalidPatternError();
					}
					stack -= op.operand;
					if (stack < 0) {
						throw new InvalidPatternError();
					}
					stack++;
					break;
				case OpCode.OpCapture: {
					if (op.operand < 0 || pool.length <= op.operand) {
						throw new InvalidPatternError();
					}
					const v = pool[op.operand];
					op.operand = vars.length;
					vars.push(v);
					stack--;
					if (stack < 0) {
						throw new InvalidPatternError();
					}
					break;
				}
				default:
					throw new InvalidPatternError();
			}

			if (maxstack < stack) {
				maxstack = stack;
			}
			typedOps.push(op);
		}

		let pattern = new Pattern();
		pattern.ops = typedOps;
		pattern.pool = pool;
		pattern.vars = vars;
		pattern._stacksize = maxstack;
		pattern._tailLen = tailLen;
		pattern._verb = verb;

		return pattern;
	}

	matchAndEscape(components: string[], verb: string, unescapingMode: UnescapingMode): Record<string, string> {
		if (this.verb !== verb) {
			if (this.verb !== '') {
				throw new NotMatchError();
			}
			if (components.length === 0) {
				components = [`:${verb}`];
			} else {
				components = [...components];
				components[components.length - 1] += `:${verb}`;
			}
		}

		let pos = 0;
		let stack: string[] = [];
		let captured: string[] = new Array(this.vars.length);
		const l = components.length;
		for (let op of this.ops) {
			switch (op.code) {
				case OpCode.OpNop:
					continue;
				case OpCode.OpPush:
				case OpCode.OpLitPush:
					if (pos >= l) {
						throw new NotMatchError();
					}
					let c = components[pos];
					if (op.code === OpCode.OpLitPush) {
						if (this.pool[op.operand] !== c) {
							throw new NotMatchError();
						}
					} else if (op.code === OpCode.OpPush) {
						c = unescape(c, unescapingMode, false);
					}
					stack.push(c);
					pos++;
					break;
				case OpCode.OpPushM: {
					let end = components.length;
					if (end < pos + this._tailLen) {
						throw new NotMatchError();
					}
					end -= this._tailLen;
					let c = components.slice(pos, end).join('/');
					c = unescape(c, unescapingMode, true);
					stack.push(c);
					pos = end;
					break;
				}
				case OpCode.OpConcatN: {
					const n = op.operand;
					const sl = stack.length - n;
					stack = stack.slice(0, sl).concat([stack.slice(sl).join('/')]);
					break;
				}
				case OpCode.OpCapture: {
					const n = stack.length - 1;
					captured[op.operand] = stack[n];
					stack = stack.slice(0, n);
					break;
				}
			}
		}
		if (pos < l) {
			throw new NotMatchError();
		}
		let bindings: Record<string, string> = {};
		for (let i = 0; i < captured.length; i++) {
			bindings[this.vars[i]] = captured[i];
		}
		return bindings;
	}

	get verb() {
		return this._verb;
	}

	get stacksize() {
		return this._stacksize;
	}

	get tailLen() {
		return this._tailLen;
	}

	toString(): string {
		let stack: string[] = [];
		for (let op of this.ops) {
			switch (op.code) {
				case OpCode.OpNop:
					continue;
				case OpCode.OpPush:
					stack.push('*');
					break;
				case OpCode.OpLitPush:
					stack.push(this.pool[op.operand]);
					break;
				case OpCode.OpPushM:
					stack.push('**');
					break;
				case OpCode.OpConcatN: {
					const n = op.operand;
					const l = stack.length - n;
					stack = stack.slice(0, l).concat([stack.slice(l).join('/')]);
					break;
				}
				case OpCode.OpCapture: {
					const n = stack.length - 1;
					stack[n] = `{${this.vars[op.operand]}=${stack[n]}}`;
					break;
				}
			}
		}
		let segs = stack.join('/');
		if (this.verb !== '') {
			return `/${segs}:${this.verb}`;
		}
		return `/${segs}`;
	}
}

export const UnescapingMode = {
	// Legacy is the default V2 behavior, which escapes the entire
	// path string before doing any routing.
	Legacy: 0,
	// AllExceptReserved unescapes all path parameters except RFC 6570
	// reserved characters.
	AllExceptReserved: 1,
	// AllExceptSlash unescapes URL path parameters except path
	// separators, which will be left as "%2F".
	AllExceptSlash: 2,
	// AllCharacters unescapes all URL path parameters.
	AllCharacters: 3,
	// Default is the default escaping type.
	// TODO(v3): default this to AllExceptReserved per grpc-httpjson-transcoding's
	// reference implementation in grpc-gateway.
	Default: 0,
} as const;

export type UnescapingMode = (typeof UnescapingMode)[keyof typeof UnescapingMode];

const ishex = (c: string) => /^[0-9a-fA-F]$/.test(c);
const isRFC6570Reserved = (c: string) => /[!#$&'()*+,/:;=?@\[\]]/.test(c);

// shouldUnescapeWithMode returns true if the character is escapable with the
// given mode
function shouldUnescapeWithMode(c: string, mode: UnescapingMode): boolean {
	switch (mode) {
		case UnescapingMode.AllExceptReserved:
			return !isRFC6570Reserved(c);
		case UnescapingMode.AllExceptSlash:
			return c !== '/';
		case UnescapingMode.AllCharacters:
			return true;
		default:
			return true;
	}
}

const unhex = (c: string) => parseInt(c, 16);

function unescape(s: string, mode: UnescapingMode, multisegment: boolean): string {
	if (mode === UnescapingMode.Legacy) {
		return s;
	}

	if (!multisegment) {
		mode = UnescapingMode.AllCharacters;
	}

	const match = s.match(/%[0-9a-fA-F]{2}/g);
	const malformed = match && match.find((m) => !ishex(m[1]) || !ishex(m[2]));
	if (malformed) {
		throw new MalformedSequenceError(malformed);
	}

	// remove?
	if (!match) {
		return s;
	}

	let t = '';
	for (let i = 0; i < s.length; i++) {
		if (s[i] === '%') {
			const c = String.fromCharCode(unhex(s.slice(i + 1, i + 3)));
			if (shouldUnescapeWithMode(c, mode)) {
				t += c;
				i += 2;
				continue;
			}
		}
		t += s[i];
	}

	return t;
}
