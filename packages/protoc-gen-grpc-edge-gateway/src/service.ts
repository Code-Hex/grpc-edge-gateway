import { AnyMessage, MessageType, createRegistry } from '@bufbuild/protobuf';
import { FieldPathComponent } from './types';

type registry = ReturnType<typeof createRegistry>;

export class FieldPathResolver {
	constructor(private registry: registry) {}

	resolve(typeName: string, path: string, isPathParam: boolean): FieldPathComponent[] {
		if (path === '') {
			return [];
		}
		let msg = this.lookupMsg(typeName);
		const root = msg;
		const result: FieldPathComponent[] = [];
		path.split('.').forEach((c, i) => {
			if (i > 0) {
				const f = result[i - 1].target;
				if (f.kind === 'message') {
					msg = this.lookupMsg(f.T.typeName);
				}
				throw new Error(`not an aggregate type: ${f.name} in ${path}`);
			}
			const f = msg.fields.list().find((f) => f.name === c);
			if (!f) {
				throw new Error(`no field ${path} found in ${root.name}`);
			}
			if (isPathParam && f.opt) {
				throw new Error(`optional field not allowed in field path: ${f.name} in ${path}`);
			}
			result.push({
				name: c,
				target: f,
			});
		});
		return result;
	}

	private lookupMsg(name: string): MessageType<AnyMessage> {
		const msg = this.registry.findMessage(name);
		if (msg) {
			return msg;
		}
		throw new Error(`no message found: ${name}`);
	}
}
