import { FieldInfo } from '@bufbuild/protobuf';

export interface FieldPathComponent {
	name: string;
	target: FieldInfo;
}

// export const getFQMN = (msg: Message): string => {
// 	const components = [''];
// 	components.push(...msg.outers);
// 	components.push(msg.descriptor.name);
// 	return components.join('.');
// };
