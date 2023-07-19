import { GeneratedFile, Schema, localName } from '@bufbuild/protoplugin/ecmascript';
import { createEcmaScriptPlugin } from '@bufbuild/protoplugin';
import { version } from '../package.json';
import { DescService, createDescriptorSet, createRegistryFromDescriptors } from '@bufbuild/protobuf';
import { PatternGenerator } from './generators/pattern';
import { RouterGenerator } from './generators/router';
import { FieldPathResolver } from './service';

type pluginInit = Parameters<typeof createEcmaScriptPlugin>[0];

export class Plugin implements pluginInit {
	name = 'protoc-gen-grpc-edge-gateway';
	version = `v${String(version)}`;
	private _fieldPathResolver?: FieldPathResolver;

	constructor() {}

	generateJs(_schema: Schema) {}

	generateDts(_schema: Schema) {}

	parseOption(key: string, value?: string) {
		console.log({ key, value });
	}

	generateTs(schema: Schema) {
		for (const protoFile of schema.files) {
			const file = schema.generateFile(protoFile.name + '_gw.ts');
			file.preamble(protoFile);
			const services = protoFile.services.map((s) => localName(s)).join(', ');
			file.print(`import { ${services} } from './${protoFile.name}_connect'`);
			for (const service of protoFile.services) {
				this.generateService(schema, file, service);
			}
		}
	}

	generateService(schema: Schema, f: GeneratedFile, service: DescService) {
		const patternGenerator = new PatternGenerator(service.name);
		patternGenerator.generate(f, service.methods);

		const routerGenerator = new RouterGenerator(service, this.fieldPathResolver(schema));
		routerGenerator.generate(f, service.methods);
	}

	private createRegistry(schema: Schema) {
		const fileProtos = schema.allFiles.map((file) => file.proto);
		const descriptorSet = createDescriptorSet(fileProtos);
		return createRegistryFromDescriptors(descriptorSet);
	}

	private fieldPathResolver(schema: Schema) {
		if (this._fieldPathResolver) {
			return this._fieldPathResolver;
		}
		this._fieldPathResolver = new FieldPathResolver(this.createRegistry(schema));
		return this._fieldPathResolver;
	}
}
