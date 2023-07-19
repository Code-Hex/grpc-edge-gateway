export const OpCode = {
	// OpNop does nothing
	OpNop: 0,
	// OpPush pushes a component to stack
	OpPush: 1,
	// OpLitPush pushes a component to stack if it matches to the literal
	OpLitPush: 2,
	// OpPushM concatenates the remaining components and pushes it to stack
	OpPushM: 3,
	// OpConcatN pops N items from stack, concatenates them and pushes it back to stack
	OpConcatN: 4,
	// OpCapture pops an item and binds it to the variable
	OpCapture: 5,
	// OpEnd is the least positive invalid opcode.
	OpEnd: 6,
} as const;

export type OpCode = (typeof OpCode)[keyof typeof OpCode];
