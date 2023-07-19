//	unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
const unreserved = '[\\w-.~]';
//	sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
//	              / "*" / "+" / "," / ";" / "="
const subDelims = "[!$&'()*+,;=]";
//	pct-encoded   = "%" HEXDIG HEXDIG
const pctEncoded = '%[0-9a-fA-F]{2}';

// https://www.ietf.org/rfc/rfc3986.txt, P.49
//
//	pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
const pcharRegex = new RegExp(`^(${unreserved}|${pctEncoded}|${subDelims}|[:@])*$`);

// expectPChars determines if "s" consists of only pchars defined in RFC3986. throw error if unexpected
export function expectPChars(s: string): void {
	// test s against the regular expression
	if (!pcharRegex.test(s)) {
		throw new Error('Input contains characters not defined in pchars according to RFC3986');
	}
}

// regular expression for .proto schema identifier
const identRegex = /^[a-zA-Z_]\w*$/;

export function expectIdent(ident: string): void {
	// check if ident is empty
	if (ident === '') {
		throw new Error('empty identifier');
	}

	// test ident against the regular expression
	if (!identRegex.test(ident)) {
		throw new Error(`Invalid identifier: ${ident}`);
	}
}
