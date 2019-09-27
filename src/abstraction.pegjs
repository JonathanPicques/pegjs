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
	const eval_expression_ast = data => {
		switch (data.type) {
			case 'unary': {
				const tail = eval_expression_ast(data.tail);
				return data.head.reverse().reduce((a, op) => {
					switch (op.operator) {
						case '~':
							return ~a;
						case '!':
							return !a;
						case '+':
							return +a;
						case '-':
							return -a;
						default:
							return a;
					}
				}, tail);
			}
			case 'binary': {
				const head = eval_expression_ast(data.head);
				return data.tail.reduce((a, op) => {
					const operand = eval_expression_ast(op.operand);
					switch (op.operator) {
						case '**':
							return Math.pow(a, operand);
						case '*':
							return a * operand;
						case '/':
							return a / operand;
						case '%':
							return a % operand;
						case '+':
							return a + operand;
						case '-':
							return a - operand;
						case '<<':
							return a << operand;
						case '>>':
							return a >> operand;
						case '>>>':
							return a >>> operand;
						case '<':
							return a < operand;
						case '<=':
							return a <= operand;
						case '>':
							return a > operand;
						case '>=':
							return a >= operand;
						case '==':
							// noinspection EqualityComparisonWithCoercionJS
							return a == operand;
						case '!=':
							// noinspection EqualityComparisonWithCoercionJS
							return a != operand;
						case '===':
							return a === operand;
						case '!==':
							return a !== operand;
						case '&':
							return a & operand;
						case '^':
							return a ^ operand;
						case '|':
							return a | operand;
						case '&&':
						case 'AND':
							return a && operand;
						case '||':
						case 'OR':
							return a || operand;
						default:
							return a;
					}
				}, head);
			}
			case 'accessor': {
            	return data.keys.reduce((a, key) => a[typeof key === 'string'? key : eval_expression_ast(key)], eval_expression_ast(data.property));
            }
			case 'function': {
				const fn = options.functions[data.name];
				return typeof fn === 'function' ? fn.apply(fn, data.args) : null;
			}
			case 'identifier': {
				return options.identifiers[data.name] || null;
			}
			case 'conditional': {
				const condition = eval_expression_ast(data.value);
				return eval_expression_ast(condition ? data.truthy : data.falsy);
			}
			// literals
			case 'literal': {
				return data.value;
			}
			case 'array_literal': {
				return data.value.map(i => eval_expression_ast(i));
			}
			case 'object_literal': {
				return Object.keys(data.value).reduce((a, key) => ({...a, [key]: eval_expression_ast(data.value[key])}), {});
			}
			// types
			case 'union_type': {
				return data.value.map(type => eval_expression_ast(type));
			}
			case 'single_type': {
				return {name: data.name, config: (data.config && eval_expression_ast(data.config)) || {}, fullname: data.fullname, template: (data.template && eval_expression_ast(data.template)) || []};
			}
			case 'single_type_template': {
				return data.value.map(type => eval_expression_ast(type));
			}
			//
			default:
				throw new Error();
		}
	};
}
