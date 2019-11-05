import * as PEG from 'pegjs';

type UnaryOperator = '~' | '!' | '+' | '-' | 'NOT';
type BinaryOperator =
    // op
    | '**'
    | '*'
    | '/'
    | '%'
    | '+'
    | '-'
    // cmp
    | '<<'
    | '>>'
    | '>>>'
    | '<'
    | '<='
    | '>'
    | '>='
    | '=='
    | '!='
    | '==='
    | '!=='
    // bit
    | '&'
    | '^'
    | '|'
    | '&&'
    | 'AND'
    | '||'
    | 'OR';

type Expression =
    | UnaryExpression
    | BinaryExpression
    | AccessorExpression
    | IdentifierExpression
    | ConditionalExpression
    | FunctionCallExpression
    | LiteralExpression
    | ArrayLiteralExpression
    | ObjectLiteralExpression
    | UnionTypeExpression
    | SingleTypeExpression
    | SingleTypeTemplateExpression;
type ExpressionResult = Expression | ExpressionLiteral;
type ExpressionLiteral = [] | {} | null | number | string | boolean;

interface ExpressionParserOptions extends PEG.ParserOptions {
    functions: Record<string, Function>;
    identifiers: Record<string, ExpressionResult> | ((identifier: string) => Promise<ExpressionResult>);
    identifiers_order: string[];
}

interface UnaryExpression {
    type: 'unary';
    //
    tail: Expression;
    head: {operator: UnaryOperator}[];
}

interface BinaryExpression {
    type: 'binary';
    //
    head: Expression;
    tail: {operand: Expression; operator: BinaryOperator}[];
}

interface AccessorExpression {
    type: 'accessor';
    //
    keys: (string | Expression)[];
    property: Expression;
}

interface IdentifierExpression {
    type: 'identifier';
    //
    name: string;
}

interface ConditionalExpression {
    type: 'conditional';
    //
    value: Expression;
    true_path: Expression;
    false_path: Expression;
}

interface FunctionCallExpression {
    type: 'function_call';
    //
    name: string;
    args: Expression[];
}

interface LiteralExpression {
    type: 'literal';
    //
    value: null | number | string | boolean;
}

interface ArrayLiteralExpression {
    type: 'array_literal';
    //
    value: Expression[];
}

interface ObjectLiteralExpression {
    type: 'object_literal';
    //
    value: Record<string, Expression>;
}

interface UnionTypeExpression {
    type: 'union_type';
    //
    types: SingleTypeExpression[];
}

interface SingleTypeExpression {
    type: 'single_type';
    //
    name: string;
    config: Expression;
    fullname: string;
    template: SingleTypeTemplateExpression;
}

interface SingleTypeTemplateExpression {
    type: 'single_type_template';
    //
    types: (UnionTypeExpression | SingleTypeExpression)[];
}

export const evaluateExpression = async (expression: Expression, options: ExpressionParserOptions): Promise<Expression | ExpressionLiteral> => {
    switch (expression.type) {
        case 'unary': {
            return await expression.head.reverse().reduce(async (a, op) => {
                const acc = (await a) as number | string | boolean;
                switch (op.operator) {
                    case '~':
                        return ~acc;
                    case '!':
                    case 'NOT':
                        return !acc;
                    case '+':
                        return +acc;
                    case '-':
                        return -acc;
                    default:
                        return acc;
                }
            }, evaluateExpression(expression.tail, options));
        }
        case 'binary': {
            return await expression.tail.reduce(async (a, op) => {
                const acc = (await a) as number;
                const operand = (await evaluateExpression(op.operand, options)) as number;
                switch (op.operator) {
                    case '**':
                        return Math.pow(acc, operand);
                    case '*':
                        return acc * operand;
                    case '/':
                        return acc / operand;
                    case '%':
                        return acc % operand;
                    case '+':
                        return acc + operand;
                    case '-':
                        return acc - operand;
                    case '<<':
                        return acc << operand;
                    case '>>':
                        return acc >> operand;
                    case '>>>':
                        return acc >>> operand;
                    case '<':
                        return acc < operand;
                    case '<=':
                        return acc <= operand;
                    case '>':
                        return acc > operand;
                    case '>=':
                        return acc >= operand;
                    case '==':
                        return acc == operand;
                    case '!=':
                        return acc != operand;
                    case '===':
                        return acc === operand;
                    case '!==':
                        return acc !== operand;
                    case '&':
                        return acc & operand;
                    case '^':
                        return acc ^ operand;
                    case '|':
                        return acc | operand;
                    case '&&':
                    case 'AND':
                        return acc && operand;
                    case '||':
                    case 'OR':
                        return acc || operand;
                    default:
                        return acc;
                }
            }, evaluateExpression(expression.head, options));
        }
        case 'conditional': {
            return await evaluateExpression((await evaluateExpression(expression.value, options)) ? expression.true_path : expression.false_path, options);
        }
        // user defined
        case 'accessor': {
            return await expression.keys.reduce(
                async (a, key) => ((await a) as any)[typeof key === 'string' ? key : ((await evaluateExpression(key, options)) as any)],
                evaluateExpression(expression.property, options),
            );
        }
        case 'identifier': {
            switch (typeof options.identifiers) {
                case 'object': {
                    const identifier = options.identifiers[expression.name];
                    return typeof identifier === 'undefined' ? null : options.identifiers[expression.name];
                }
                case 'function': {
                    return await options.identifiers(expression.name);
                }
                default:
                    return null;
            }
        }
        case 'function_call': {
            const fn = options.functions[expression.name];
            return typeof fn === 'function' ? fn.apply(fn, await Promise.all(expression.args.map(arg => evaluateExpression(arg, options)))) : null;
        }
        // literals
        case 'literal': {
            return expression.value;
        }
        case 'array_literal': {
            return await Promise.all(expression.value.map(item => evaluateExpression(item, options)));
        }
        case 'object_literal': {
            return await Object.keys(expression.value).reduce(
                async (a, key) => ({...(await a), [key]: await evaluateExpression(expression.value[key], options)}),
                Promise.resolve({}),
            );
        }
        //
        case 'union_type': {
            return await Promise.all(expression.types.map(type => evaluateExpression(type, options)));
        }
        case 'single_type': {
            return {
                name: expression.name,
                config: ((expression.config && (await evaluateExpression(expression.config, options))) || {}) as any,
                fullname: expression.fullname,
                template: ((expression.template && (await evaluateExpression(expression.template, options))) || []) as any,
            };
        }
        case 'single_type_template': {
            return await Promise.all(expression.types.map(type => evaluateExpression(type, options)));
        }
    }
};

export const generateExpressionEvaluator = (parser: PEG.Parser) => {
    return async (expression: string, options: Partial<ExpressionParserOptions> = {}) => {
        return await evaluateExpression(parser.parse(expression, options), options as ExpressionParserOptions);
    };
};
