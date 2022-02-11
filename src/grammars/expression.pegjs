////////////////
// Expression //
////////////////

Expression
	= expression:ConditionalExpression

EndExpression
	= "(" __ expression:ConditionalExpression __ ")" { return expression; }
	/ Literal
	/ Function
	/ Identifier

TrimmedExpression
	= __ expression:EndExpression __ { return expression; }

PropertyAccessorKey
	= "." __ key:IdentifierName { return key; }
    / "[" __ key:TrimmedExpression __ "]" { return key; }

PropertyAccessorExpression
	= property:TrimmedExpression keys:PropertyAccessorKey+ { return {type: 'accessor', keys, property}; }
	/ TrimmedExpression

UnaryExpression
	= PropertyAccessorExpression
	/ head:(__ UnaryOperator)* __ tail:PropertyAccessorExpression { return unary_operation(head.map(h => h[1]), tail); }

UnaryOperator
	= $("+" !"+")
	/ $("-" !"-")
	/ $"~"
	/ $"!"
    / $"NOT"

ExponentiationExpression
	= head:UnaryExpression tail:(__ ExponentiationOperator __ UnaryExpression)* { return binary_operation(head, tail); }

ExponentiationOperator
	= "**"

MultiplicativeExpression
	= head:ExponentiationExpression tail:(__ MultiplicativeOperator __ ExponentiationExpression)* { return binary_operation(head, tail); }

MultiplicativeOperator
	= $("*" !"*")
	/ $("/")
	/ $("%")

AdditiveExpression
	= head:MultiplicativeExpression tail:(__ AdditiveOperator __ MultiplicativeExpression)* { return binary_operation(head, tail); }

AdditiveOperator
	= $("+" ![+=])
	/ $("-" ![-=])

EqualityExpression
	= head:RelationalExpression tail:(__ EqualityOperator __ RelationalExpression)* { return binary_operation(head, tail); }

EqualityOperator
	= "==="
	/ "!=="
	/ "=="
	/ "!="

BitwiseShiftExpression
	= head:AdditiveExpression tail:(__ BitwiseShiftOperator __ AdditiveExpression)* { return binary_operation(head, tail); }

BitwiseShiftOperator
	= $("<<" )
	/ $(">>>")
	/ $(">>" )

RelationalExpression
	= head:BitwiseShiftExpression tail:(__ RelationalOperator __ BitwiseShiftExpression)* { return binary_operation(head, tail); }

RelationalOperator
	= "<="
	/ ">="
	/ $("<" !"<")
	/ $(">" !">")

BitwiseAndExpression
	= head:EqualityExpression tail:(__ BitwiseAndOperator __ EqualityExpression)* { return binary_operation(head, tail); }

BitwiseAndOperator
	= "&"

BitwiseXorExpression
	= head:BitwiseAndExpression tail:(__ BitwiseXorOperator __ BitwiseAndExpression)* { return binary_operation(head, tail); }

BitwiseXorOperator
	= "^"

BitwiseOrExpression
	= head:BitwiseXorExpression tail:(__ BitwiseOrOperator __ BitwiseXorExpression)* { return binary_operation(head, tail); }

BitwiseOrOperator
	= "|"

LogicalAndExpression
	= head:BitwiseOrExpression tail:(__ LogicalAndOperator __ BitwiseOrExpression)* { return binary_operation(head, tail); }

LogicalAndOperator
	= "&&" / "AND"

LogicalOrExpression
	= head:LogicalAndExpression tail:(__ LogicalOrOperator __ LogicalAndExpression)* { return binary_operation(head, tail); }

LogicalOrOperator
	= "||" / "OR"

ConditionalExpression
	= value:LogicalOrExpression __ "?" __ true_path:ConditionalExpression __ ":" __ false_path:ConditionalExpression { return {type: 'conditional', value, true_path, false_path}; }
	/ value:LogicalOrExpression __ "?:" __ false_path:ConditionalExpression { return {type: 'conditional', value, true_path: value, false_path}; }
	/ LogicalOrExpression

///////////////
// Functions //
///////////////

Function
	= name:IdentifierName __ "(" __ args:FunctionArguments? __ ")" { return {type: 'function_call', name, args: args || []}; }

FunctionArguments
	= expression:Expression expressions:(__ "," __ Expression __ )* { return [expression, ...expressions.map(e => e[3])]; }

/////////////////
// Identifiers //
/////////////////

Identifier
	= name:IdentifierName { 
		if (!(name in options.identifiers) && !options.identifiers_order.includes(name)) {
			options.identifiers_order.push(name);
		}
		return {type: 'identifier', name};
	}

IdentifierName
    = !IdentifierReserved IdentifierStart+ IdentifierPart* { return text(); }

IdentifierStart
	= UnicodeLatinLetter
	/ "_"
	/ "$"

IdentifierPart
	= IdentifierStart
	/ [0-9]

IdentifierReserved
	= NullLiteral
	/ BooleanLiteral
	/ "AND"
	/ "OR"
    / "NOT"

//////////////
// Literals //
//////////////

Literal
	= ArrayLiteral
	/ ObjectLiteral
	/ value:NullLiteral { return {type: 'literal', value}; }
	/ value:NumberLiteral { return {type: 'literal', value}; }
	/ value:StringLiteral { return {type: 'literal', value}; }
	/ value:BooleanLiteral { return {type: 'literal', value}; }

ArrayLiteral "array"
	= '[' __ items:ArrayLiteralItem? __ ']' { return {type: 'array_literal', value: items || [] }; }

ArrayLiteralItem
	= head:Expression __ ',' __ tail:ArrayLiteralItem { return [head, ...tail]; }
    / value:Expression { return [value]; }

ObjectLiteral "object"
	= "{" __ entries:(ObjectKeyValue ","? __)* "}" { return {type: 'object_literal', value: entries.reduce((a, op) => Object.assign(a, op[0]), {})}; }
    
ObjectKey
	= IdentifierName / NullLiteral / StringLiteral / BooleanLiteral

ObjectValue
	= Expression

ObjectKeyValue
	= __ key:ObjectKey __ ":" __ value:ObjectValue __ { return {[key]: value} }

NullLiteral "null"
	= NullLiteralToken { return null; }

NullLiteralToken
	= "null" !IdentifierPart

NumberLiteral "number"
	= HexaLiteral
	/ BinaryLiteral
	/ DecimalLiteral

HexaLiteral
	= "0x"i digits:$HexaDigit+ { return parseInt(digits, 16); }

HexaDigit
	= [0-9a-f]i

BinaryLiteral
	= "0b"i digits:$BinaryDigit+ { return parseInt(digits, 2); }

BinaryDigit
	= [01]

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
	= "\\" UnicodeLineTerminatorSequence { return ""; }

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
	= !(EscapeCharacter / UnicodeLineTerminator) Character { return text(); }

EscapeCharacter
	= SingleEscapeCharacter
	/ DecimalDigit
	/ "x"
	/ "u"

HexEscapeSequence
	= "x" digits:$(HexaDigit HexaDigit) { return String.fromCharCode(parseInt(digits, 16)); }

UnicodeEscapeSequence
	= "u" digits:$(HexaDigit HexaDigit HexaDigit HexaDigit) { return String.fromCharCode(parseInt(digits, 16)); }

Character
	= .

BooleanLiteral "boolean"
	= TrueLiteralToken { return true; }
	/ FalseLiteralToken { return false; }

TrueLiteralToken
	= "true" !IdentifierPart

FalseLiteralToken
	= "false" !IdentifierPart

