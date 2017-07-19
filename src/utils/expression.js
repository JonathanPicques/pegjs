// noinspection JSUnusedGlobalSymbols
const unary_operation = (head, tail) => {
    return head.reduce((a, operator) => {
        switch (operator) {
            case "!":
                return !a;
            case "~":
                return ~a;
            case "+":
                return +a;
            case "-":
                return -a;
        }
    }, tail);
};
// noinspection JSUnusedGlobalSymbols
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
