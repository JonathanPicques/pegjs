{
    options.functions = Object.assign({}, options.functions, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] === "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
    options.identifiers = Object.assign({}, options.identifiers, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] !== "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));

    options.functions_ = [];
    options.identifiers_ = [];

    const unary_operation = (head, tail) => {
        return eval(`${head}${typeof tail === "string" ? `"${tail}"` : tail}`)
    };
    const binary_operation = (head, tail) => {
        return tail.reduce((a, op) => {
            switch (op[1]) {
                case "**" :
                    return a ** op[3];
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
                    return a && op[3];
                case "||" :
                    return a || op[3];
            }
        }, head);
    };
    const eval_functions = (name, args) => {
        const fn = options.functions[name];
        if (typeof fn !== "function") {
            options.functions_.push(name);
            return 0;
        }
        return fn.apply(fn, args);
    };
    const eval_identifiers = (name) => {
        const id = options.identifiers[name];
        if (typeof id === "undefined") {
            options.identifiers_.push(name);
            return 0;
        }
        return id;
    };
}