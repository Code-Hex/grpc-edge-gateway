import { findCustomMessageOption } from '@bufbuild/protoplugin/ecmascript';
import { HttpRule } from './gen/google/api/http_pb';
import { DescMethod } from '@bufbuild/protobuf';

type HttpRulePattern = HttpRule['pattern'];

export function getMethodPath(pattern: HttpRulePattern) {
	switch (pattern.case) {
		case 'custom':
			return {
				path: pattern.value.path,
				method: pattern.value.kind,
			};
		case 'delete':
		case 'get':
		case 'patch':
		case 'post':
		case 'put':
			return {
				path: pattern.value,
				method: pattern.case.toUpperCase(),
			};
		default:
			throw new Error('invalid HttpRule message is empty');
	}
}

const httpRuleOption = 72295728; // See annotations.proto

export function findHttpRuleOptions(method: DescMethod) {
	return findCustomMessageOption(method, httpRuleOption, HttpRule);
}
