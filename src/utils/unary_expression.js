module.exports = (head, tail) => {
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