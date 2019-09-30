const fs = require('fs');
const path = require('path');

const grammar_type = fs.readFileSync(path.join('src', 'grammars', 'type.pegjs'));
const grammar_unicode = fs.readFileSync(path.join('src', 'grammars', 'unicode.pegjs'));
const grammar_expression = fs.readFileSync(path.join('src', 'grammars', 'expression.pegjs'));
const grammar_abstraction = fs.readFileSync(path.join('src', 'grammars', 'abstraction.pegjs'));

fs.writeFileSync('expression.pegjs', `${grammar_abstraction}${grammar_type}${grammar_expression}${grammar_unicode}`);