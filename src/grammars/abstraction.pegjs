/////////////////
// Abstraction //
/////////////////

{
    // Static functions
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] === "function").reduce((a, op) => { a[`Math_${op}`] = Math[op]; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Number).filter(n => typeof Number[n] === "function").reduce((a, op) => { a[`Number_${op}`] = Number[op]; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(String).filter(n => typeof String[n] === "function").reduce((a, op) => { a[`String_${op}`] = String[op]; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Boolean).filter(n => typeof Boolean[n] === "function").reduce((a, op) => { a[`Boolean_${op}`] = Boolean[op]; return a; }, {}));
    // Prototype functions
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Number.prototype).filter(n => n !== "constructor" && typeof Number.prototype[n] === "function").reduce((a, op) => { a[`number_${op}`] = (nb, ...args) => { return Number.prototype[op].call(nb, ...args); }; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(String.prototype).filter(n => n !== "constructor" && typeof String.prototype[n] === "function").reduce((a, op) => { a[`string_${op}`] = (str, ...args) => { return String.prototype[op].call(str, ...args); }; return a; }, {}));
	options.functions = Object.assign(options.functions || {}, Object.getOwnPropertyNames(Boolean.prototype).filter(n => n !== "constructor" && typeof Boolean.prototype[n] === "function").reduce((a, op) => { a[`boolean_${op}`] = (bool, ...args) => { return Boolean.prototype[op].call(bool, ...args); }; return a; }, {}));
    // Javascript identifiers
	options.identifiers = Object.assign(options.identifiers || {}, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] !== "function").reduce((a, op) => { a["Math_" + op] = Math[op]; return a; }, {}));
	options.identifiers = Object.assign(options.identifiers || {}, Object.getOwnPropertyNames(Number).filter(n => typeof Number[n] !== "function").reduce((a, op) => { a["Number_" + op] = Number[op]; return a; }, {}));
	options.identifiers = Object.assign(options.identifiers || {}, Object.getOwnPropertyNames(String).filter(n => typeof String[n] !== "function").reduce((a, op) => { a["String_" + op] = String[op]; return a; }, {}));
	options.identifiers = Object.assign(options.identifiers || {}, Object.getOwnPropertyNames(Boolean).filter(n => typeof Boolean[n] !== "function").reduce((a, op) => { a["Boolean_" + op] = Boolean[op]; return a; }, {}));
    // User generated identifiers order
	options.identifiers_order = [];

	const unary_operation = (head, tail) => {
		return {type: 'unary', head: head.map(operator => ({operator})), tail};
	};
	const binary_operation = (head, tail) => {
		return {type: 'binary', head, tail: tail.map(t => ({operand: t[3], operator: t[1]}))};
	};
}

