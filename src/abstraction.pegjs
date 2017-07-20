{
    const unary_operation = (op, a) => eval(`${op}${typeof a === "string" ? `"${a}"` : a}`);
    const binary_operation = (head, tail) => {return tail.reduce((a,op)=>{switch(op[1]){case"**":return a**op[3];case"*":return a*op[3];case"/":return a/op[3];case"%":return a%op[3];case"+":return a+op[3];case"-":return a-op[3];case"<<":return a<<op[3];case">>":return a>>op[3];case">>>":return a>>>op[3];case"<":return a<op[3];case"<=":return a<=op[3];case">":return a>op[3];case">=":return a>=op[3];case"==":return a==op[3];case"!=":return a!=op[3];case"===":return a===op[3];case"!==":return a!==op[3];case"&":return a&op[3];case"^":return a^op[3];case"|":return a|op[3];case"&&":return a&&op[3];case"||":return a||op[3]}},head)};

    options.functions = Object.assign({}, options.functions, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] === "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
    options.identifiers = Object.assign({}, options.identifiers, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] !== "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
}