// metadataHeaderPrefix is the http prefix that represents custom metadata
// parameters to or from a gRPC call.
const metadataHeaderPrefix = 'Grpc-Metadata-';

// metadataPrefix is prepended to permanent HTTP header keys (as specified
// by the IANA) when added to the gRPC context.
const metadataPrefix = 'grpcgateway-';

export type headerMatcher = typeof defaultHeaderMatcher;

export class MetadataForwarder {
	private incomingHeaderMatcher: headerMatcher;
	private outgoingHeaderMatcher: headerMatcher;

	constructor(incomingHeaderMatcher?: headerMatcher, outgoingHeaderMatcher?: headerMatcher) {
		this.incomingHeaderMatcher = incomingHeaderMatcher ?? defaultHeaderMatcher;
		this.outgoingHeaderMatcher =
			outgoingHeaderMatcher ??
			((key) => ({
				annotatedHeaderKey: `${metadataHeaderPrefix}${key}`,
				match: true,
			}));
	}

	forwardRequestMetadata(req: Request): Headers {
		const metadata = new Headers();
		for (const [key, value] of req.headers.entries()) {
			const canonicalKey = canonicalMIMEHeaderKey(key);
			if (canonicalKey === 'Authorization') {
				metadata.set(canonicalKey, value);
			}
			// If matcher returns true, that header will be
			// passed to gRPC metadata. To transform the header before passing to gRPC metadata, matcher should return modified header.
			const { annotatedHeaderKey, match } = this.incomingHeaderMatcher(key);
			if (match) {
				if (!isValidGRPCMetadataKey(canonicalKey)) {
					// TODO(codehex): add log
					continue;
				}
				if (!isValidGRPCMetadataTextValue(value)) {
					// TODO(codehex): add log
					continue;
				}
				metadata.set(annotatedHeaderKey, value);
			}
		}

		// TODO(codehex): implement
		//
		// const xForwardedHost = 'X-Forwarded-Host';
		// const host = req.headers.get(xForwardedHost);
		// if (host !== null) {
		// 	metadata.set(xForwardedHost, host);
		// }
		// if (this.remoteAddr) {
		// 	const xForwardedFor = 'X-Forwarded-For';
		// 	const fwd = req.headers.get(xForwardedFor);
		// 	if (fwd === null) {
		// 		metadata.set(xForwardedFor, this.remoteAddr);
		// 	} else {
		// 		metadata.set(xForwardedFor, `${fwd}, ${this.remoteAddr}`);
		// 	}
		// }
		return metadata;
	}

	forwardResponseServerMetadata(metadata: Headers): Record<string, string> {
		const result: Record<string, string> = {};
		for (const [key, value] of metadata.entries()) {
			const { annotatedHeaderKey, match } = this.outgoingHeaderMatcher(key);
			if (match) {
				result[annotatedHeaderKey] = value;
			}
		}
		// TODO(codehex): Should we handle as option?
		result['Content-Type'] = 'application/json';
		return result;
	}

	forwardResponseTrailer(trailerMetadata: Headers): Record<string, string> {
		// MetadataTrailerPrefix is prepended to gRPC metadata as it is converted to
		// HTTP headers in a response handled by grpc-gateway
		const metadataTrailerPrefix = 'Grpc-Trailer-';

		const trailers = new Headers();
		for (const [key, value] of trailerMetadata.entries()) {
			const canonicalKey = canonicalMIMEHeaderKey(key);
			trailers.append('Trailer', `${metadataTrailerPrefix}${canonicalKey}`);
			trailers.set(`${metadataTrailerPrefix}${canonicalKey}`, value);
		}
		return Object.fromEntries(trailers.entries());
	}
}

const unitToMultiplicand: Record<string, number> = {
	H: 60 * 60 * 1000, // hour
	M: 60 * 1000, // minute
	S: 1000, // second
	m: 1, // millisecond
	u: 0.001, // microsecond
	n: 0.000001, // nanosecond
} as const;

export function timeoutDecode(s: string): number {
	const size = s.length;
	if (size < 2) {
		throw new Error(`timeout string is too short: ${s}`);
	}
	const unit = s[size - 1];
	const timeoutUnit = timeoutUnitToMillisec(unit);
	const value = parseInt(s.slice(0, size - 1), 10);
	if (isNaN(value)) {
		throw new Error(`Invalid timeout value: ${s}`);
	}
	return timeoutUnit * value;
}

function timeoutUnitToMillisec(unit: string): number {
	if (unitToMultiplicand[unit]) {
		return unitToMultiplicand[unit];
	}
	throw new Error(`timeout unit is not recognized: ${unit}`);
}

export function isValidGRPCMetadataKey(key: string): boolean {
	// This regular expression corresponds to the allowed characters (0-9 a-z A-Z _ - .)
	const pattern = /^[a-zA-Z0-9\-\._]+$/;
	return pattern.test(key);
}

export function isValidGRPCMetadataTextValue(textValue: string): boolean {
	// This regular expression corresponds to the printable ASCII (including/plus spaces); 0x20 to 0x7E inclusive.
	const pattern = /^[\x20-\x7E]*$/;
	return pattern.test(textValue);
}

// DefaultHeaderMatcher is used to pass http request headers to/from gRPC context. This adds permanent HTTP header
// keys (as specified by the IANA, e.g: Accept, Cookie, Host) to the gRPC metadata with the grpcgateway- prefix. If you want to know which headers are considered permanent, you can view the isPermanentHTTPHeader function.
// HTTP headers that start with 'Grpc-Metadata-' are mapped to gRPC metadata after removing the prefix 'Grpc-Metadata-'.
// Other headers are not added to the gRPC metadata.
export function defaultHeaderMatcher(key: string): { annotatedHeaderKey: string; match: boolean } {
	const canonicalKey = canonicalMIMEHeaderKey(key);
	if (isPermanentHTTPHeader(key)) {
		return {
			annotatedHeaderKey: metadataPrefix + canonicalKey,
			match: true,
		};
	}
	if (key.startsWith(metadataHeaderPrefix)) {
		return {
			annotatedHeaderKey: key.slice(metadataHeaderPrefix.length),
			match: true,
		};
	}
	return {
		annotatedHeaderKey: '',
		match: false,
	};
}

function isPermanentHTTPHeader(hdr: string): boolean {
	const pattern =
		/^(Accept|Accept-Charset|Accept-Language|Accept-Ranges|Authorization|Cache-Control|Content-Type|Cookie|Date|Expect|From|Host|If-Match|If-Modified-Since|If-None-Match|If-Schedule-Tag-Match|If-Unmodified-Since|Max-Forwards|Origin|Pragma|Referer|User-Agent|Via|Warning)$/i;
	return pattern.test(hdr);
}

export function canonicalMIMEHeaderKey(key: string): string {
	return key
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join('-');
}
