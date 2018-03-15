const fs = require("fs");
const peg = require("pegjs");
const path = require("path");
const chai = require("chai");
const mocha = require("mocha");

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const grammar_abstraction = fs.readFileSync(path.join("src", "abstraction.pegjs"));
const grammar_expression = fs.readFileSync(path.join("src", "expression.pegjs"));
const grammar_unicode = fs.readFileSync(path.join("src", "unicode.pegjs"));
const grammar_message2 = fs.readFileSync(path.join("src", "message2.pegjs"));
const parser = peg.generate(`
    ${grammar_abstraction.toString()}
    ${grammar_message2.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);

describe("test message", () => {
    it("should read a single message", () => {
        expect(parser.parse(`Jonathan : Bonjour Vincent`)[0]).to.be.eql({"character": "Jonathan", "content": "Bonjour Vincent"});
        expect(parser.parse(`Jonathan : Bonjour Vincent, tu as {{ 32 + 1 }} pièces.`)[0]).to.be.eql({"character": "Jonathan", "content": "Bonjour Vincent, tu as 33 pièces."});
        expect(parser.parse(`{}{{2+2}} : {} {} {{2}} {}}}`)[0]).to.be.eql({"character": "{}4", "content": "{} {} 2 {}}}"});
    });
});