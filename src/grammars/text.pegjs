//////////////////////////////////////////////
// Custom text format                       //
//////////////////////////////////////////////

Rule
	= Node*

Node
	= ElementTag
    / LineParagraph

Leaf
	= "em" / "strong"

LeafTag
	= UnicodeLineTerminator? "[" type:Leaf "]" __ content:(LeafTag / InlineText?) __ "[/" sameType:Leaf "]" { if (type !== sameType) error(`${type} opened, but ${sameType} closed`); else return Object.assign({text: '', [type]: true}, content); }

Element
	= "h1" / "h2" / "ol" / "li"

ElementTag
	= UnicodeLineTerminator? "[" type:Element "]" __ children:(ElementTag / LeafTag / InlineText)* __ "[/" sameType:Element "]" { if (type !== sameType) error(`${type} opened, but ${sameType} closed`); else return {type, children}; }

InlineText
	= [^[]+ { return {text: text()}; }

LineParagraph
	= content:(LeafTag / LineParagraphText / LineParagraphEmpty) { return {type: 'p', children: [content]}; }

LineParagraphText
	= UnicodeLineTerminator? text:[^[\n]+ { return {text: text.join('')}; }

LineParagraphEmpty
	= UnicodeLineTerminator { return {text: ''}; }
