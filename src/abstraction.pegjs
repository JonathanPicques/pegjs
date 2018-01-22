/////////////////
// Abstraction //
/////////////////

{
	options.functions = Object.assign({}, options.functions, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] === "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
	options.functions = Object.assign({}, options.functions, Object.getOwnPropertyNames(Number).filter(n => typeof Number[n] === "function").reduce((a, op) => { a["number_" + op] = Number[op]; return a; }, {}));
	options.functions = Object.assign({}, options.functions, Object.getOwnPropertyNames(Object.getPrototypeOf("")).filter(n => n !== "constructor" && typeof ""[n] === "function").reduce((a, op) => { a[`string_${op}`] = (arg, ...args) => { return arg[op](...args); }; return a; }, {}));
	options.identifiers = Object.assign({}, options.identifiers, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] !== "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
	options.identifiers_order = [];

	const unary_operation = (head, tail) => {
		return head.reverse().reduce((a, op) => {
			switch (op) {
				case "~":
					return ~a;
				case "!":
					return !a;
				case "+":
					return +a;
				case "-":
					return -a;
			}
		}, tail);
	};
	const binary_operation = (head, tail) => {
		return tail.reduce((a, op) => {
			switch (op[1]) {
				case "**" :
					return Math.pow(a, op[3]);
				case "*" :
					return a * op[3];
				case "/" :
					return a / op[3];
				case "%" :
					return a % op[3];
				case "+" :
					return a + op[3];
				case "-" :
					return a - op[3];
				case "<<" :
					return a << op[3];
				case ">>" :
					return a >> op[3];
				case ">>>" :
					return a >>> op[3];
				case "<" :
					return a < op[3];
				case "<=" :
					return a <= op[3];
				case ">" :
					return a > op[3];
				case ">=" :
					return a >= op[3];
				case "==" :
					// noinspection EqualityComparisonWithCoercionJS
					return a == op[3];
				case "!=" :
					// noinspection EqualityComparisonWithCoercionJS
					return a != op[3];
				case "===" :
					return a === op[3];
				case "!==" :
					return a !== op[3];
				case "&" :
					return a & op[3];
				case "^" :
					return a ^ op[3];
				case "|" :
					return a | op[3];
				case "&&" :
				case "AND" :
					return a && op[3];
				case "||" :
				case "OR" :
					return a || op[3];
			}
		}, head);
	};
	const eval_function = (name, args) => {
		const fn = options.functions[name];
		return typeof fn === "function" ? fn.apply(fn, args) : null;
	};
	const eval_identifier = (name) => {
		const id = options.identifiers[name];
		if (typeof id === "undefined" && !options.identifiers_order.includes(name)) {
			options.identifiers_order.push(name);
		}
		return typeof id !== "undefined" ? id : null;
	};
}
