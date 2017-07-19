// noinspection JSUnusedGlobalSymbols
const expression = (head, tail) => {
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