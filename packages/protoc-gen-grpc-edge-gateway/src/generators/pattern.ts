import { DescMethod } from '@bufbuild/protobuf';
import { GeneratedFile, literalString } from '@bufbuild/protoplugin/ecmascript';
import { parse } from '@grpc-edge-gateway/core';
import { findHttpRuleOptions, getMethodPath } from '../httprule';
import { HttpRule } from '../gen/google/api/http_pb';
import { core } from '../pkg';

export class PatternGenerator {
	constructor(private serviceName: string) {}

	generate(f: GeneratedFile, methods: DescMethod[]) {
		for (const method of methods) {
			const httpRule = findHttpRuleOptions(method);
			if (!httpRule) continue;

			this.generatePatterns(f, httpRule, method.name, 0);
		}
	}

	generatePatterns(f: GeneratedFile, httpRule: HttpRule, methodName: string, idx: number) {
		const { path } = getMethodPath(httpRule.pattern);
		const compiler = parse(path);
		const tp = compiler.compile();
		const pattern = f.import('Pattern', core);
		const name = `pattern${this.serviceName}${methodName}`;
		f.print(
			`const ${name}${idx} = `,
			pattern,
			`.create(${tp.version}, [${tp.opCodes.join(', ')}], [${tp.pool.map((v) => literalString(v)).join(', ')}], '${tp.verb}')`
		);
		f.print();

		httpRule.additionalBindings.forEach((binding) => {
			if (binding.additionalBindings.length > 0) {
				throw new Error(`additional_binding in additional_binding not allowed: ${this.serviceName}.${methodName}`);
			}
			this.generatePatterns(f, binding, methodName, ++idx);
		});
	}
}
