///////////
// Utils //
///////////

{
	const parser = this;
	const expression = (head, tail) => {return tail.reduce((a,op)=>{switch(op[1]){case"**":return a**op[3];case"*":return a*op[3];case"/":return a/op[3];case"%":return a%op[3];case"+":return a+op[3];case"-":return a-op[3];case"<<":return a<<op[3];case">>":return a>>op[3];case">>>":return a>>>op[3];case"<":return a<op[3];case"<=":return a<=op[3];case">":return a>op[3];case">=":return a>=op[3];case"==":return a==op[3];case"!=":return a!=op[3];case"===":return a===op[3];case"!==":return a!==op[3];case"&":return a&op[3];case"^":return a^op[3];case"|":return a|op[3];case"&&":return a&&op[3];case"||":return a||op[3]}},head)};
	const unary_expression = (op, a) => eval(`${op}${typeof a === "string" ? `"${a}"` : a}`);

	parser.functions = Object.assign({}, parser.functions, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] === "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
	parser.identifiers = Object.assign({}, parser.identifiers, Object.getOwnPropertyNames(Math).filter(n => typeof Math[n] !== "function").reduce((a, op) => { a["math_" + op] = Math[op]; return a; }, {}));
}

/////////////////
// Expressions //
/////////////////

Expression
	= ConditionalExpression

EndExpression
	= "(" __ expression:ConditionalExpression __ ")" { return expression; }
	/ Function
	/ Identifier
	/ Literal

UnaryExpression
	= EndExpression
	/ op:$UnaryOperator* __ arg:EndExpression { return unary_expression(op, arg); }

UnaryOperator
	= $("+" !"=")
	/ $("-" !"=")
	/ $"~"+
	/ $"!"+

ExponentiationExpression
	= head:UnaryExpression tail:(__ ExponentiationOperator __ UnaryExpression)* { return expression(head, tail); }

ExponentiationOperator
	= "**"

MultiplicativeExpression
	= head:ExponentiationExpression tail:(__ MultiplicativeOperator __ ExponentiationExpression)* { return expression(head, tail); }

MultiplicativeOperator
	= $("*" !"*" !"=")
	/ $("/" !"=")
	/ $("%" !"=")

AdditiveExpression
	= head:MultiplicativeExpression tail:(__ AdditiveOperator __ MultiplicativeExpression)* { return expression(head, tail); }

AdditiveOperator
	= $("+" ![+=])
	/ $("-" ![-=])

EqualityExpression
	= head:RelationalExpression tail:(__ EqualityOperator __ RelationalExpression)* { return expression(head, tail); }

EqualityOperator
	= "==="
	/ "!=="
	/ "=="
	/ "!="

BitwiseShiftExpression
	= head:AdditiveExpression tail:(__ BitwiseShiftOperator __ AdditiveExpression)* { return expression(head, tail); }

BitwiseShiftOperator
	= $("<<"  !"=")
	/ $(">>>" !"=")
	/ $(">>"  !"=")

RelationalExpression
	= head:BitwiseShiftExpression tail:(__ RelationalOperator __ BitwiseShiftExpression)* { return expression(head, tail); }

RelationalOperator
	= "<="
	/ ">="
	/ $("<" !"<")
	/ $(">" !">")

BitwiseAndExpression
	= head:EqualityExpression tail:(__ BitwiseAndOperator __ EqualityExpression)* { return expression(head, tail); }

BitwiseAndOperator
	= "&"

BitwiseXorExpression
	= head:BitwiseAndExpression tail:(__ BitwiseXorOperator __ BitwiseAndExpression)* { return expression(head, tail); }

BitwiseXorOperator
	= "^"

BitwiseOrExpression
	= head:BitwiseXorExpression tail:(__ BitwiseOrOperator __ BitwiseXorExpression)* { return expression(head, tail); }

BitwiseOrOperator
	= "|"

LogicalAndExpression
	= head:BitwiseOrExpression tail:(__ LogicalAndOperator __ BitwiseOrExpression)* { return expression(head, tail); }

LogicalAndOperator
	= "&&"

LogicalOrExpression
	= head:LogicalAndExpression tail:(__ LogicalOrOperator __ LogicalAndExpression)* { return expression(head, tail); }

LogicalOrOperator
	= "||"

ConditionalExpression
	= conditional:LogicalOrExpression __ "?" __ truthy:ConditionalExpression __ ":" __ falsy:ConditionalExpression { return !!conditional ? truthy : falsy; }
	/ conditional:LogicalOrExpression __ "?:" falsy:ConditionalExpression { return !!conditional ? conditional : falsy; }
	/ LogicalOrExpression

///////////////
// Functions //
///////////////

Function
	= name:$Identifier "(" __ args:FunctionArguments? __ ")" { const fn = parser.functions[name]; return typeof fn === "function" ? fn.apply(fn, args) : 0; }

FunctionArguments
	= exp:Expression exps:(__ "," __ Expression __ )* { return [exp, ...exps.map(e => e[3])]; }

/////////////////
// Identifiers //
/////////////////

Identifier
	= !IdentifierReserved IdentifierStart+ IdentifierPart* { const id = parser.identifiers[text()]; return typeof id === "undefined" ? 0 : id; }

IdentifierStart
	= "_"
	/ "$"
	/ [a-z]i

IdentifierPart
	= IdentifierStart
	/ [0-9]

IdentifierReserved
	= NullLiteral
	/ BooleanLiteral

//////////////
// Literals //
//////////////

Literal
	= NullLiteral
	/ BooleanLiteral
	/ NumericLiteral
	/ StringLiteral

NullLiteral "null"
	= NullLiteralToken { return null; }

NullLiteralToken
	= "null" !IdentifierPart

BooleanLiteral "boolean"
	= TrueLiteralToken { return true; }
	/ FalseLiteralToken { return false; }

TrueLiteralToken
	= "true" !IdentifierPart

FalseLiteralToken
	= "false" !IdentifierPart

NumericLiteral "number"
	= HexadecimalLiteral
	/ DecimalLiteral

HexadecimalLiteral
	= "0x"i digits:$HexadecimalDigit+ { return parseInt(digits, 16); }

HexadecimalDigit
	= [0-9a-f]i

DecimalLiteral
	= DecimalSeparator DecimalDigit+ DecimalLiteralExponentialPart? { return parseFloat(text(), 10); }
	/ DecimalDigit+ DecimalSeparator DecimalDigit* DecimalLiteralExponentialPart? { return parseFloat(text(), 10); }
	/ DecimalDigit+ DecimalLiteralExponentialPart? { return parseFloat(text(), 10); }

DecimalDigit
	= [0-9]

DecimalSeparator
	= [.]

DecimalLiteralExponentialPart
	= ExponentialLiteralToken DecimalDigit+

ExponentialLiteralToken
    = "e"i

StringLiteral "string"
	= '"' chars:DoubleStringCharacter* '"' { return chars.join(""); }
	/ "'" chars:SingleStringCharacter* "'" { return chars.join(""); }
	/ "`" chars:BackStringCharacter* "`" { return chars.join(""); }

DoubleStringCharacter
	= !('"' / "\\") Character { return text(); }
	/ "\\" sequence:EscapeSequence { return sequence; }
	/ LineContinuation

SingleStringCharacter
	= !("'" / "\\") Character { return text(); }
	/ "\\" sequence:EscapeSequence { return sequence; }
	/ LineContinuation

BackStringCharacter
	= !("`" / "\\") Character { return text(); }
	/ "\\" sequence:EscapeSequence { return sequence; }
	/ LineContinuation

LineContinuation
	= "\\" LineTerminatorSequence { return ""; }

EscapeSequence
	= CharacterEscapeSequence
	/ "0" !DecimalDigit { return "\0"; }
	/ HexEscapeSequence
	/ UnicodeEscapeSequence

CharacterEscapeSequence
	= SingleEscapeCharacter
	/ NonEscapeCharacter

SingleEscapeCharacter
	= "'"
	/ '"'
	/ "`"
	/ "\\"
	/ "b" { return "\b"; }
	/ "f" { return "\f"; }
	/ "n" { return "\n"; }
	/ "r" { return "\r"; }
	/ "t" { return "\t"; }
	/ "v" { return "\v"; }

NonEscapeCharacter
	= !(EscapeCharacter / LineTerminator) Character { return text(); }

EscapeCharacter
	= SingleEscapeCharacter
	/ DecimalDigit
	/ "x"
	/ "u"

HexEscapeSequence
	= "x" digits:$(HexadecimalDigit HexadecimalDigit) { return String.fromCharCode(parseInt(digits, 16)); }

UnicodeEscapeSequence
	= "u" digits:$(HexadecimalDigit HexadecimalDigit HexadecimalDigit HexadecimalDigit) { return String.fromCharCode(parseInt(digits, 16)); }

Character
	= .

/////////////
// Commons //
/////////////

WhiteSpace
	= "\t"
	/ "\v"
	/ "\f"
	/ " "
	/ "\u00A0"
	/ "\uFEFF"
	/ [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

LineTerminator
	= [\n\r\u2028\u2029]

LineTerminatorSequence
	= "\n"
	/ "\r\n"
	/ "\r"
	/ "\u2028"
	/ "\u2029"

/////////////
// Ignores //
/////////////

_
	= WhiteSpace
__
	= WhiteSpace*