const fs = require('fs');
const path = require('path');

const grammar_abstraction = fs.readFileSync(path.join("src", "abstraction.pegjs"));
const grammar_expression = fs.readFileSync(path.join("src", "expression.pegjs"));
const grammar_unicode = fs.readFileSync(path.join("src", "unicode.pegjs"));

fs.writeFileSync('expression.pegjs', `${grammar_abstraction}${grammar_expression}${grammar_unicode}`);