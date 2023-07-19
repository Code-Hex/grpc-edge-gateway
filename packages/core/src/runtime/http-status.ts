import { Code } from '@bufbuild/connect';

/**
 * Returns a HTTP status code for the given Connect code.
 * See: https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
 */
export function codeToHttpStatus(code: Code): number {
	switch (code) {
		case Code.Canceled:
			return 499; // Client Closed
		case Code.Unknown:
			return 500; // Internal Server Error
		case Code.InvalidArgument:
			return 400; // Bad Request
		case Code.DeadlineExceeded:
			return 504; // Gateway Timeout
		case Code.NotFound:
			return 404; // Not Found
		case Code.AlreadyExists:
			return 409; // Conflict
		case Code.PermissionDenied:
			return 403; // Forbidden
		case Code.ResourceExhausted:
			return 429; // Too Many Requests
		case Code.FailedPrecondition:
			// Note, this deliberately doesn't translate to the similarly named '412 Precondition Failed' HTTP response status.
			return 400; // Bad Request
		case Code.Aborted:
			return 409; // Conflict
		case Code.OutOfRange:
			return 400; // Bad Request
		case Code.Unimplemented:
			return 501; // Not Implemented
		case Code.Internal:
			return 500; // Internal Server Error
		case Code.Unavailable:
			return 503; // Service Unavailable
		case Code.DataLoss:
			return 500; // Internal Server Error
		case Code.Unauthenticated:
			return 401; // Unauthorized
		default:
			return 500; // same as CodeUnknown
	}
}
