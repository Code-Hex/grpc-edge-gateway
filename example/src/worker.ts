import { createPromiseClient } from '@bufbuild/connect';
import { GrpcGateway, Handler, RuntimePatternRouter, Health, createGrpcTransport } from '@grpc-edge-gateway/core';
import { registerDetailHandlerClient, registerStatusHandlerClient } from './gen/testing_gw';
import { Detail, Status } from './gen/testing_connect';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

const router = new RuntimePatternRouter<Handler>();
const transport = createGrpcTransport({
	fetchFn: fetch,
	baseUrl: 'http://127.0.0.1:3000',
	useBinaryFormat: true,
	interceptors: [],
});

registerStatusHandlerClient(router, createPromiseClient(Status, transport));
registerDetailHandlerClient(router, createPromiseClient(Detail, transport));

const gateway = new GrpcGateway<Env>(router, {
	incomingMetadataAnnotators: [(req, md, env) => {}],
	healthzClient: createPromiseClient(Health, transport),
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return await gateway.fetch(request, env, ctx);
	},
};
