const fs = require('fs');
const path = require('path');

const grammar_abstraction = fs.readFileSync(path.join('src', 'grammars', 'abstraction.pegjs'));
const grammar_expression = fs.readFileSync(path.join('src', 'grammars', 'expression.pegjs'));
const grammar_unicode = fs.readFileSync(path.join('src', 'grammars', 'unicode.pegjs'));

fs.writeFileSync('expression.pegjs', `${grammar_abstraction}${grammar_expression}${grammar_unicode}`);