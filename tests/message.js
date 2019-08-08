const fs = require('fs');
const peg = require('pegjs');
const path = require('path');
const chai = require('chai');
const mocha = require('mocha');

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const grammar_abstraction = fs.readFileSync(path.join('src', 'abstraction.pegjs'));
const grammar_expression = fs.readFileSync(path.join('src', 'expression.pegjs'));
const grammar_unicode = fs.readFileSync(path.join('src', 'unicode.pegjs'));
const grammar_message = fs.readFileSync(path.join('src', 'message.pegjs'));
const parser = peg.generate(`
    ${grammar_abstraction.toString()}
    ${grammar_message.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);

describe('test message', () => {
    it('should read a single message', () => {
        expect(parser.parse(`Jonathan : "Bonjour Vincent"`)[0]).to.be.deep.equal({character: 'Jonathan', content: 'Bonjour Vincent'});
        expect(parser.parse(`Jonathan : 'Bonjour Vincent'`)[0]).to.be.deep.equal({character: 'Jonathan', content: 'Bonjour Vincent'});
        expect(parser.parse(`'Jonathan' : "Bonjour Vincent"`)[0]).to.be.deep.equal({character: 'Jonathan', content: 'Bonjour Vincent'});
        expect(parser.parse(`'Jon' + 'athan':'Bonjour Vincent'`)[0]).to.be.deep.equal({character: 'Jonathan', content: 'Bonjour Vincent'});

        expect(() => parser.parse(':')).to.throw();
        expect(() => parser.parse('a:')).to.throw();
        expect(() => parser.parse(':a')).to.throw();
        expect(() => parser.parse('a::a')).to.throw();
    });
    it('should test string coercion', () => {
        expect(parser.parse(`32 + 32 : true ? false : true`)[0]).to.be.deep.equal({character: '64', content: 'false'});
    });
});
