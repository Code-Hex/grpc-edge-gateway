import { DescMethod, DescService, FieldInfo } from '@bufbuild/protobuf';
import { GeneratedFile, localName } from '@bufbuild/protoplugin/ecmascript';
import { findHttpRuleOptions, getMethodPath } from '../httprule';
import { HttpRule } from '../gen/google/api/http_pb';
import { core } from '../pkg';
import { FieldPathComponent } from '../types';
import { FieldPathResolver } from '../service';
import { parse } from '@grpc-edge-gateway/core';

export interface Parameter {
	fieldPath: FieldPathComponent[];
	target: FieldInfo;
	method: DescMethod;
}

export class RouterGenerator {
	constructor(private service: DescService, private fieldPathResolver: FieldPathResolver) {}

	generate(f: GeneratedFile, methods: DescMethod[]) {
		const serviceT = `${localName(this.service)}T`;
		f.print(`type ${serviceT} = typeof `, localName(this.service));
		f.print();

		const RuntimePatternRouter = f.import('RuntimePatternRouter', core);
		const HandlerT = f.import('Handler', core);
		const PromiseClient = f.import('PromiseClient', '@bufbuild/connect').toTypeOnly();

		f.print(`export function register${localName(this.service)}HandlerClient(`);
		f.print(`  router: `, RuntimePatternRouter, `<`, HandlerT, `>,`);
		f.print(`  client: `, PromiseClient, `<${serviceT}>,`);
		f.print(') {');

		for (const method of methods) {
			const httpRule = findHttpRuleOptions(method);
			if (!httpRule) continue;
			this.generateRoutes(f, httpRule, serviceT, method, 0);
		}

		f.print('}');
		f.print();
	}

	generateRoutes(f: GeneratedFile, httpRule: HttpRule, serviceT: string, method: DescMethod, idx: number) {
		const { method: httpMethod, path } = getMethodPath(httpRule.pattern);
		const compiler = parse(path);
		const tp = compiler.compile();

		const params = tp.fields.map((f) => this.newParam(method, f));

		const context = f.import('Context', core);
		const pattern = `pattern${this.service.name}${method.name}${idx}`;
		const ConnectError = f.import('ConnectError', '@bufbuild/connect');
		const Code = f.import('Code', '@bufbuild/connect');
		f.print(`  router.addPattern('${httpMethod}', ${pattern}, async (ctx: `, context, `) => {`);
		f.print(`    try {`);
		f.print(`      const body = (await ctx.req.json()) as any;`);
		if (params.length > 0) {
			f.print(`      let param = ""`);
		}
		for (const param of params) {
			const path = param.fieldPath.map((field) => field.name).join('.');
			f.print(`      param = ctx.params["${path}"]`);
			f.print(`      if (param === undefined) {`);
			f.print(`        throw new `, ConnectError, `("missing parameter ${path}", `, Code, `.InvalidArgument)`);
			f.print(`      }`);
			// TODO(codehex): add type check
			// const target = param.target
			// if (target.kind === "enum") {
			// 	target.T.findName()
			// }
			f.print(`      body.${path} = param`);
		}
		f.print(`      const res = await client.${localName(method)}(body, ctx.callOptions());`);
		f.print(`      return new Response(JSON.stringify(res), {`);
		f.print(`        status: 200,`);
		f.print(`        headers: ctx.forwardResponseMetadata(),`);
		f.print(`      });`);
		f.print(`    } catch (e) {`);
		f.print(`      if (e instanceof `, ConnectError, `) {`);
		f.print(`        throw e;`);
		f.print(`      }`);
		f.print(
			`      throw new `,
			ConnectError,
			`('Internal Server Error', `,
			Code,
			`.Internal, ctx.forwardResponseMetadata(), undefined, e);`
		);
		f.print(`    }`);
		f.print(`  });`);
		f.print();

		httpRule.additionalBindings.forEach((binding) => {
			if (binding.additionalBindings.length > 0) {
				throw new Error(`additional_binding in additional_binding not allowed: ${this.service.name}.${method.name}`);
			}
			this.generateRoutes(f, binding, serviceT, method, ++idx);
		});
	}

	newParam(methodDesc: DescMethod, path: string) {
		const inputMsg = methodDesc.input.typeName;
		const fields = this.fieldPathResolver.resolve(inputMsg, path, true);
		if (fields.length === 0) {
			throw new Error(`invalid field access list for ${path}`);
		}
		const target = fields[fields.length - 1].target;
		if (target.kind === 'message') {
			// TODO(codehex): check well known type
			const method = `${methodDesc.parent.name}.${methodDesc.name}`;
			throw new Error(
				`${method}: ${path} is a protobuf message type. Protobuf message types cannot be used as path parameters, use a scalar value type (such as string) instead`
			);
		}
		return {
			fieldPath: fields,
			method: methodDesc,
			target,
		};
	}
}
