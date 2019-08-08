//////////
// Type //
//////////

UnionType "union type"
	= types:(__ UnaryType __ "|" __)* __ type:UnaryType { return [...types.map(t => t[1]), type]; }

UnaryType "type"
	= name:IdentifierName templates:TemplateList? config:ObjectLiteral? { return ({name: name, config: config || {}, fullname: text(), templates: templates || []}); }

TemplateList "template list"
	= "<" __ types:(__ UnionType __ "," __)* __ type:UnionType __ ">" { return [...types.map(t => t[1]), type] }
