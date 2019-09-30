/////////////////
// Abstraction //
/////////////////

{
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] === "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Number).filter(n => typeof Number[n] === "function").reduce((a, op) => { a["number_" + op] = Number[op]; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Object.getPrototypeOf("")).filter(n => n !== "constructor" && typeof ""[n] === "function").reduce((a, op) => { a[`string_${op}`] = (arg, ...args) => { return arg[op](...args); }; return a; }, {}));
	options.identifiers = Object.assign(options.identifiers || {}, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] !== "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
	options.identifiers_order = [];

	const unary_operation = (head, tail) => {
		return {type: 'unary', head: head.map(operator => ({operator})), tail};
	};
	const binary_operation = (head, tail) => {
		return {type: 'binary', head, tail: tail.map(t => ({operand: t[3], operator: t[1]}))};
	};
}