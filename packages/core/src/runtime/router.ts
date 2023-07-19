import { parse } from '../httprule/parse';
import { MalformedSequenceError } from './errors';
import { Pattern, UnescapingMode } from './pattern';

export interface Router<T> {
	name: string;
	add(method: string, path: string, handler: T): void;
	match(method: string, path: string): Result<T> | null;
}

export interface Result<T> {
	handlers: T[];
	params: Record<string, string>;
}

type PatternHandler<T> = {
	pattern: Pattern;
	handler: T;
};

export class RuntimePatternRouter<T> implements Router<T> {
	name: string = 'RuntimePatternRouter';
	routes: Record<string, PatternHandler<T>[]> = {};
	unescapingMode: UnescapingMode = UnescapingMode.Default;

	constructor() {}

	addPattern(method: string, pattern: Pattern, handler: T) {
		this.routes[method] ||= [];
		this.routes[method].unshift({
			pattern,
			handler,
		});
	}

	add(method: string, pathPattern: string, handler: T) {
		const compiler = parse(pathPattern);
		const tp = compiler.compile();
		const pattern = Pattern.create(tp.version, tp.opCodes, tp.pool, tp.verb);

		this.addPattern(method, pattern, handler);
	}

	// https://github.com/grpc-ecosystem/grpc-gateway/blob/5069fd8a7a1fe5706824c6b19b88f845001c1533/runtime/mux.go#L346
	match(method: string, path: string): Result<T> | null {
		const separator = this.unescapingMode === UnescapingMode.AllCharacters ? /\/|%2F/ : '/';
		const pathComponents = path.slice(1).split(separator);

		for (const h of this.routes[method]) {
			const { components, verb } = extractComponentsVerb(h.pattern.verb, pathComponents);

			try {
				const params = h.pattern.matchAndEscape(components, verb, this.unescapingMode);
				return {
					handlers: [h.handler],
					params,
				};
			} catch (err) {
				// NotMatchError
				// MalformedSequenceError
				if (err instanceof MalformedSequenceError) {
					throw err;
				}
				continue;
			}
		}
		return null;
	}
}

export function extractComponentsVerb(patVerb: string, pathComponents: string[]) {
	const lastPathComponent = pathComponents[pathComponents.length - 1];
	let verb = '';
	let idx = -1;
	if (patVerb != '' && lastPathComponent.endsWith(':' + patVerb)) {
		idx = lastPathComponent.length - patVerb.length - 1;
	}
	let components = [...pathComponents];
	if (idx > 0) {
		components[components.length - 1] = lastPathComponent.slice(0, idx);
		verb = lastPathComponent.slice(idx + 1);
	}
	return {
		components,
		verb,
	};
}
