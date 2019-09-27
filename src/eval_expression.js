const eval_expression_ast = (data, options) => {
	switch (data.type) {
		case 'unary': {
			const tail = eval_expression_ast(data.tail, options);
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
			const head = eval_expression_ast(data.head, options);
			return data.tail.reduce((a, op) => {
				const operand = eval_expression_ast(op.operand, options);
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
        	return data.keys.reduce((a, key) => a[typeof key === 'string'? key : eval_expression_ast(key, options)], eval_expression_ast(data.property, options));
        }
		case 'function': {
			const fn = options.functions[data.name];
			return typeof fn === 'function' ? fn.apply(fn, data.args && data.args.map(arg => eval_expression_ast(arg, options))) : null;
		}
		case 'identifier': {
			return options.identifiers[data.name] || null;
		}
		case 'conditional': {
			const condition = eval_expression_ast(data.value, options);
			return eval_expression_ast(condition ? data.truthy : data.falsy, options);
		}
		// literals
		case 'literal': {
			return data.value;
		}
		case 'array_literal': {
			return data.value.map(i => eval_expression_ast(i, options));
		}
		case 'object_literal': {
			return Object.keys(data.value).reduce((a, key) => ({...a, [key]: eval_expression_ast(data.value[key], options)}), {});
		}
		// types
		case 'union_type': {
			return data.value.map(type => eval_expression_ast(type, options));
		}
		case 'single_type': {
			return {name: data.name, config: (data.config && eval_expression_ast(data.config, options)) || {}, fullname: data.fullname, template: (data.template && eval_expression_ast(data.template, options)) || []};
		}
		case 'single_type_template': {
			return data.value.map(type => eval_expression_ast(type, options));
		}
		//
		default:
			throw new Error();
	}
};

const generate_parser_and_eval = (parser) => {
	return (expression, options = {}) => {
		return eval_expression_ast(parser.parse(expression, options), options, options);
	};
};

module.exports = generate_parser_and_eval;