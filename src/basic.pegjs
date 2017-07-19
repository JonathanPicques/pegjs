///////////
// Utils //
///////////

{
	// TODO: Remove eval
	const eval_value = (value) => typeof value === "string" ? `"${value}"` : value;
	// TODO: Not production ready, should switch/case over all operators...
	const expression = (tail, head) => tail.reduce((a, op) => eval(`${eval_value(a)}${op[1]}${eval_value(op[3])}`), head);
	// TODO: Not production ready, should switch/case over all operators...
	const unary_expression = (op, a) => eval(`${op}${eval_value(a)}`);
	// TODO: Identifiers must be configurable
	const identifiers = {"one": 1, "two": 2};
}

/////////////////
// Expressions //
/////////////////

Expression
	= ConditionalExpression

EndExpression
	= "(" __ expression:ConditionalExpression __ ")" { return expression; }
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

MultiplicativeExpression
	= head:UnaryExpression tail:(__ MultiplicativeOperator __ UnaryExpression)* { return expression(tail, head); }

MultiplicativeOperator
	= $("*" !"=")
	/ $("/" !"=")
	/ $("%" !"=")

AdditiveExpression
	= head:MultiplicativeExpression tail:(__ AdditiveOperator __ MultiplicativeExpression)* { return expression(tail, head); }

AdditiveOperator
	= $("+" ![+=])
	/ $("-" ![-=])

EqualityExpression
	= head:RelationalExpression tail:(__ EqualityOperator __ RelationalExpression)* { return expression(tail, head); }

EqualityOperator
	= "==="
	/ "!=="
	/ "=="
	/ "!="

ShiftExpression
	= head:AdditiveExpression tail:(__ ShiftOperator __ AdditiveExpression)* { return expression(tail, head); }

ShiftOperator
	= $("<<"  !"=")
	/ $(">>>" !"=")
	/ $(">>"  !"=")

RelationalExpression
	= head:ShiftExpression tail:(__ RelationalOperator __ ShiftExpression)* { return expression(tail, head); }

RelationalOperator
	= "<="
	/ ">="
	/ $("<" !"<")
	/ $(">" !">")

BitwiseAndExpression
	= head:EqualityExpression tail:(__ BitwiseAndOperator __ EqualityExpression)* { return expression(tail, head); }

BitwiseAndOperator
	= "&"

BitwiseXorExpression
	= head:BitwiseAndExpression tail:(__ BitwiseXorOperator __ BitwiseAndExpression)* { return expression(tail, head); }

BitwiseXorOperator
	= "^"

BitwiseOrExpression
	= head:BitwiseXorExpression tail:(__ BitwiseOrOperator __ BitwiseXorExpression)* { return expression(tail, head); }

BitwiseOrOperator
	= "|"

LogicalAndExpression
	= head:BitwiseOrExpression tail:(__ LogicalAndOperator __ BitwiseOrExpression)* { return expression(tail, head); }

LogicalAndOperator
	= "&&"

LogicalOrExpression
	= head:LogicalAndExpression tail:(__ LogicalOrOperator __ LogicalAndExpression)* { return expression(tail, head); }

LogicalOrOperator
	= "||"

ConditionalExpression
	= conditional:LogicalOrExpression __ "?" __ truthy:ConditionalExpression __ ":" __ falsy:ConditionalExpression { return !!conditional ? truthy : falsy; }
	/ conditional:LogicalOrExpression __ "?:" falsy:ConditionalExpression { return !!conditional ? conditional : falsy; }
	/ LogicalOrExpression

/////////////////
// Identifiers //
/////////////////

Identifier
	= !IdentifierReserved IdentifierStart+ IdentifierPart* { return typeof identifiers[text()] === "undefined" ? identifiers[text()] = 0 : identifiers[text()]; }

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

ExponentialLiteralToken = "e"i

StringLiteral "string"
	= '"' chars:DoubleStringCharacter* '"' { return chars.join(""); }
	/ "'" chars:SingleStringCharacter* "'" { return chars.join(""); }
	/ "`" chars:BackStringCharacter* "`" { return chars.join(""); }

DoubleStringCharacter
	= !('"' / "\\" / LineTerminator) Character { return text(); }
	/ "\\" sequence:EscapeSequence { return sequence; }
	/ LineContinuation

SingleStringCharacter
	= !("'" / "\\" / LineTerminator) Character { return text(); }
	/ "\\" sequence:EscapeSequence { return sequence; }
	/ LineContinuation

BackStringCharacter
	= !("`" / "\\" / LineTerminator) Character { return text(); }
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