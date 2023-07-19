import { type Compiler, DeepWildcard, Literal, type Segment, TemplateCompiler, Variable, Wildcard, eof } from './compile';
import { expectIdent, expectPChars } from './expect';

// A termType is a type of terminal symbols.
//
// These constants define some of valid values of termType.
// They improve readability of parse functions.
//
// You can also use "/", "*", "**", "." or "=" as valid values.
export const TermType = {
	TypeSlash: '/',
	TypeAsterisk: '*',
	TypeDoubleAsterisk: '**',
	TypeEqual: '=',
	TypeOpenBrace: '{',
	TypeCloseBrace: '}',
	TypeDot: '.',
	TypeIndent: 'indent',
	TypeLiteral: 'literal',
	TypeEOF: '$',
} as const;

export type TermType = (typeof TermType)[keyof typeof TermType];

export class InvalidTemplateError extends Error {
	constructor(public tmpl: string, public msg: string) {
		super(`${msg}: ${tmpl}`);
		this.name = 'InvalidTemplateError';
	}
}

export function parse(tmpl: string): Compiler {
	if (!tmpl.startsWith('/')) {
		throw new InvalidTemplateError(tmpl, 'no leading /');
	}
	const { tokens, verb } = tokenize(tmpl.slice(1));

	const p = new parser(tokens);
	try {
		const segs = p.topLevelSegments();
		return new TemplateCompiler(segs, verb, tmpl);
	} catch (err: unknown) {
		throw new InvalidTemplateError(tmpl, `${err}`);
	}
}

export class parser {
	tokens: string[];
	accepted: string[];

	constructor(tokens: string[]) {
		this.tokens = tokens;
		this.accepted = [];
	}

	topLevelSegments() {
		try {
			this.accept('$');
			this.tokens = [];
			return [new Literal(eof)];
		} catch {}

		const segs = this.segments();
		try {
			this.accept('$');
			return segs;
		} catch (err) {
			throw new Error(`unexpected token ${this.tokens[0]} after segments ${this.accepted.join('')}`);
		}
	}

	segments(): Segment[] {
		const s = this.segment();
		const segs = [s];
		while (true) {
			try {
				this.accept('/');
			} catch {
				return segs;
			}
			const s = this.segment();
			segs.push(s);
		}
	}

	segment() {
		try {
			this.accept('*');
			return new Wildcard();
		} catch {}

		try {
			this.accept('**');
			return new DeepWildcard();
		} catch {}

		try {
			return this.literal();
		} catch {}

		try {
			return this.variable();
		} catch (err) {
			throw new Error(`segment neither wildcards, literal or variable: ${err}`);
		}
	}

	literal() {
		const lit = this.accept('literal');
		return new Literal(lit);
	}

	variable() {
		this.accept('{');

		const path = this.fieldPath();

		let segs: Segment[] = [];
		try {
			this.accept('=');
		} catch {
			segs = [new Wildcard()];
		}
		// success case
		if (segs.length === 0) {
			try {
				segs = this.segments();
			} catch (err) {
				throw new Error(`invalid segment in variable '${path}': ${err}`);
			}
		}

		try {
			this.accept('}');
		} catch (err) {
			throw new Error(`unterminated variable segment: ${err}`);
		}
		return new Variable(segs, path);
	}

	fieldPath() {
		const c = this.accept(TermType.TypeIndent);
		const components = [c];
		while (true) {
			try {
				this.accept('.');
			} catch (err) {
				return components.join('.');
			}

			try {
				const tok = this.accept(TermType.TypeIndent);
				components.push(tok);
			} catch (err) {
				throw new Error(`invalid field path component: ${err}`);
			}
		}
	}

	accept(term: TermType) {
		const tok = this.tokens[0];
		switch (term) {
			case '/':
			case '*':
			case '**':
			case '.':
			case '=':
			case '{':
			case '}':
				if (tok !== term && tok !== '/') {
					throw new Error(`expected "${term}" but got "${tok}"`);
				}
				break;
			case '$':
				if (tok !== eof) {
					throw new Error(`expected EOF but got "${tok}"`);
				}
				break;
			case 'indent':
				expectIdent(tok);
				break;
			case 'literal':
				expectPChars(tok);
				break;
			default:
				throw new Error(`unknown termType "${term}"`);
		}
		this.tokens = this.tokens.slice(1);
		this.accepted.push(tok);
		return tok;
	}
}

export function tokenize(path: string) {
	let tokens: string[] = [];
	let verb: string = '';

	if (path === '') {
		return {
			tokens: [eof],
			verb: '',
		};
	}

	enum State {
		init,
		field,
		nested,
	}

	let st: State = State.init;

	while (path !== '') {
		let idx: number;
		switch (st) {
			case State.init:
				idx = path.search(/[/{]/);
				break;
			case State.field:
				idx = path.search(/[.=}]/);
				break;
			case State.nested:
				idx = path.search(/[}/]/);
				break;
		}

		if (idx < 0) {
			tokens.push(path);
			break;
		}

		let r: string = path[idx];
		switch (r) {
			case '/':
			case '.':
				break;
			case '{':
				st = State.field;
				break;
			case '=':
				st = State.nested;
				break;
			case '}':
				st = State.init;
				break;
		}

		if (idx === 0) {
			tokens.push(path.slice(idx, idx + 1));
		} else {
			tokens.push(path.slice(0, idx), path.slice(idx, idx + 1));
		}
		path = path.slice(idx + 1);
	}

	let l: number = tokens.length;
	let penultimateTokenIsEndVar: boolean = false;

	if (l >= 2) {
		penultimateTokenIsEndVar = tokens[l - 2] === '}';
	}

	let t: string = tokens[l - 1];
	let idx: number;

	if (penultimateTokenIsEndVar) {
		idx = t.indexOf(':');
	} else {
		idx = t.lastIndexOf(':');
	}

	if (idx === 0) {
		tokens = tokens.slice(0, l - 1);
		verb = t.slice(1);
	} else if (idx > 0) {
		tokens[l - 1] = t.slice(0, idx);
		verb = t.slice(idx + 1);
	}
	tokens.push(eof);

	return {
		tokens,
		verb,
	};
}
