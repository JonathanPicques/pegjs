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

LastExpression
	= ConditionalExpression

ConditionalExpression
	= conditional:LogicalExpression __ "?" __ truthy:ConditionalExpression __ ":" __ falsy:ConditionalExpression { return !!conditional ? truthy : falsy; }
	/ conditional:LogicalExpression __ "?:" falsy:ConditionalExpression { return !!conditional ? conditional : falsy; }
	/ LogicalExpression

LogicalExpression
	= head:BitwiseExpression tail:(__ LogicalOperator __ BitwiseExpression)* { return expression(tail, head); }

LogicalOperator
	= "&&"
	/ "||"

BitwiseExpression
	= head:EqualityExpression tail:(__ BitwiseOperator __ EqualityExpression)* { return expression(tail, head); }

BitwiseOperator
	= $("&" ![&=])
	/ $("^" !"=")
	/ $("|" ![|=])

EqualityExpression
	= head:RelationalExpression tail:(__ EqualityOperator __ RelationalExpression)* { return expression(tail, head); }

EqualityOperator
	= "==="
	/ "!=="
	/ "=="
	/ "!="

RelationalExpression
	= head:ShiftExpression tail:(__ RelationalOperator __ ShiftExpression)* { return expression(tail, head); }

RelationalOperator
	= "<="
	/ ">="
	/ $("<" !"<")
	/ $(">" !">")

ShiftExpression
	= head:AdditiveExpression tail:(__ ShiftOperator __ AdditiveExpression)* { return expression(tail, head); }

ShiftOperator
	= $("<<"  !"=")
	/ $(">>>" !"=")
	/ $(">>"  !"=")

AdditiveExpression
	= head:MultiplicativeExpression tail:(__ AdditiveOperator __ MultiplicativeExpression)* { return expression(tail, head); }

AdditiveOperator
	= $("+" ![+=])
	/ $("-" ![-=])

MultiplicativeExpression
	= head:UnaryExpression tail:(__ MultiplicativeOperator __ UnaryExpression)* { return expression(tail, head); }

MultiplicativeOperator
	= $("*" !"=")
	/ $("/" !"=")
	/ $("%" !"=")

UnaryExpression
	= Expression
	/ op:$UnaryOperator* __ arg:Expression { return unary_expression(op, arg); }

UnaryOperator
	= $("+" !"=")
	/ $("-" !"=")
	/ $"~"+
	/ $"!"+

Expression
	= "(" __ expression:LastExpression __ ")" { return expression; }
	/ Identifier
	/ Literal

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

ExponentialLiteralToken
    = "e"i

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