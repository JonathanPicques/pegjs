//////////
// Type //
//////////

UnionType "union type"
	= types:(__ SingleType __ "|" __)* __ type:SingleType { return {type: 'union_type', types: [...types.map(t => t[1]), type]}; }

SingleType "single type"
	= name:IdentifierName template:SingleTypeTemplate? config:ObjectLiteral? { return ({type: 'single_type', name, config, fullname: text(), template}); }

SingleTypeTemplate "single type template"
	= "<" __ types:(__ UnionType __ "," __)* __ type:UnionType __ ">" { return {type: 'single_type_template', types: [...types.map(t => t[1]), type]}; }

