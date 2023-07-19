import { createEcmaScriptPlugin } from '@bufbuild/protoplugin';
import { Plugin } from './plugin';

export const protocGenGrpcEdgeway = createEcmaScriptPlugin(new Plugin());
