export class NotMatchError extends Error {
	constructor() {
		super('not match to the path pattern');
		this.name = 'NotMatchError';
	}
}

export class InvalidPatternError extends Error {
	constructor() {
		super('invalid pattern');
		this.name = 'InvalidPatternError';
	}
}

export class MalformedSequenceError extends Error {
	constructor(malformed: string) {
		super(`malformed path escape '${malformed}'`);
		this.name = 'MalformedSequenceError';
	}
}
