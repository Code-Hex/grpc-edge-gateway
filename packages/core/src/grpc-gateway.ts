import { Code, ConnectError } from '@bufbuild/connect';
import { MetadataForwarder, timeoutDecode, type headerMatcher } from './runtime/header';
import type { Result, Router } from './runtime/router';
import { MalformedSequenceError } from './runtime/errors';
import type { CallOptions, PromiseClient } from '@bufbuild/connect';
import { headerTimeout } from '@bufbuild/connect/protocol-grpc';
import { codeToHttpStatus } from './runtime/http-status';
import { createRegistry } from '@bufbuild/protobuf';
import { Health } from './gen/grpc/health/v1/health_connect';
import { HealthCheckResponse_ServingStatus } from './gen/grpc/health/v1/health_pb';

export interface ExecutionContext {
	waitUntil(promise: Promise<any>): void;
	passThroughOnException(): void;
}

export type IncomingMetadataAnnotator<E> = (req: Request, metadata: Headers, env?: E) => void;

export class Context<E = {}> {
	private serverMetadata?: Record<string, string>;
	private trailerMetadata?: Record<string, string>;
	private _timeoutMs?: number;

	constructor(
		public req: Request,
		public params: Record<string, string>,
		private mdForwarder: MetadataForwarder,
		private incomingMetadataAnnotators: IncomingMetadataAnnotator<E>[],
		private env?: E
	) {
		const tm = req.headers.get(headerTimeout);
		if (tm !== null) {
			this._timeoutMs = timeoutDecode(tm);
		}
	}

	private forwardRequestMetadata(): Headers {
		const md = this.mdForwarder.forwardRequestMetadata(this.req);
		for (const annotator of this.incomingMetadataAnnotators) {
			annotator(this.req, md, this.env);
		}
		return md;
	}

	setServerMetadata(serverMetadata: Headers) {
		this.serverMetadata = this.mdForwarder.forwardResponseServerMetadata(serverMetadata);
	}

	setTrailerMetadata(trailerMetadata: Headers) {
		this.trailerMetadata = this.mdForwarder.forwardResponseTrailer(trailerMetadata);
	}

	forwardResponseMetadata(): Headers {
		return new Headers({
			...this.serverMetadata,
			...this.trailerMetadata,
		});
	}

	callOptions(): CallOptions {
		return {
			timeoutMs: this._timeoutMs,
			headers: this.forwardRequestMetadata(),
			signal: this.req.signal,
			onHeader: (headers) => this.setServerMetadata(headers),
			onTrailer: (trailer) => this.setTrailerMetadata(trailer),
		};
	}
}

export type Handler<E = {}> = (ctx: Context<E>) => Promise<Response>;

type Env = unknown;

export class GrpcGateway<E extends Env> {
	private router: Router<Handler<E>>;
	private mdForwarder: MetadataForwarder;
	private incomingMetadataAnnotators: IncomingMetadataAnnotator<E>[];

	errorHandler: (err: ConnectError) => Response;

	constructor(
		router: Router<Handler<E>>,
		options?: {
			incomingHeaderMatcher?: headerMatcher;
			outgoingHeaderMatcher?: headerMatcher;
			incomingMetadataAnnotators?: IncomingMetadataAnnotator<E>[];
			healthzClient?: PromiseClient<typeof Health>;
		}
	) {
		this.router = router;
		this.mdForwarder = new MetadataForwarder(options?.incomingHeaderMatcher, options?.outgoingHeaderMatcher);
		this.incomingMetadataAnnotators = options?.incomingMetadataAnnotators ?? [];
		this.errorHandler = (err: ConnectError) => {
			return new Response(
				JSON.stringify({
					code: err.code,
					message: err.rawMessage,
					details: err.findDetails(createRegistry()),
				}),
				{ status: codeToHttpStatus(err.code) }
			);
		};
		if (options?.healthzClient) {
			const { healthzClient } = options;
			this.router.add('GET', '/healthz', async (ctx) => {
				const { searchParams } = new URL(ctx.req.url);
				try {
					const res = await healthzClient.check({
						service: searchParams.get('service') ?? undefined,
					});
					switch (res.status) {
						case HealthCheckResponse_ServingStatus.UNKNOWN:
						case HealthCheckResponse_ServingStatus.NOT_SERVING:
							throw new ConnectError(res.toJsonString(), Code.Unavailable);
						case HealthCheckResponse_ServingStatus.SERVICE_UNKNOWN:
							throw new ConnectError(res.toJsonString(), Code.NotFound);
						case HealthCheckResponse_ServingStatus.SERVING:
							return new Response(res.toJsonString());
					}
				} catch (e) {
					if (e instanceof ConnectError) {
						throw e;
					}
					throw new ConnectError('Internal Server Error', Code.Internal, ctx.forwardResponseMetadata(), undefined, e);
				}
			});
		}
	}

	async fetch(request: Request, env?: E, _executionCtx?: ExecutionContext): Promise<Response> {
		return this.dispatch(request, env);
	}

	private matchRoute(method: string, pathname: string): Result<Handler<E>> | Response {
		try {
			const result = this.router.match(method, pathname);
			if (!result) {
				// TODO(codehex): handle method not allowed here.
				//
				// {"code":12, "message":"Method Not Allowed", "details":[]}
				return this.errorHandler(new ConnectError(`Not Found`, Code.NotFound));
			}
			return result;
		} catch (e) {
			if (e instanceof MalformedSequenceError) {
				return this.errorHandler(new ConnectError(e.message, Code.InvalidArgument));
			}
		}
		return this.errorHandler(new ConnectError(`Internal Server Error`, Code.Internal));
	}

	private dispatch(req: Request, env?: E): Response | Promise<Response> {
		const { pathname } = new URL(req.url);
		const result = this.matchRoute(req.method, pathname);
		if (result instanceof Response) {
			return result;
		}
		const { handlers, params } = result;

		if (handlers.length === 0) {
			return this.errorHandler(new ConnectError(`Internal Server Error`, Code.Internal));
		}
		return (async () => {
			try {
				const ctx = new Context<E>(req, params, this.mdForwarder, this.incomingMetadataAnnotators, env);
				return await handlers[0](ctx);
			} catch (e) {
				let error: ConnectError | undefined;
				if (e instanceof ConnectError) {
					error = e;
				} else {
					error = new ConnectError('Internal Server Error', Code.Internal, undefined, undefined, e);
				}
				return this.errorHandler(error);
			}
		})();
	}
}
