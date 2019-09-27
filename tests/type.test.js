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
const grammar_type = fs.readFileSync(path.join('src', 'type.pegjs'));
const parser = peg.generate(`
    ${grammar_abstraction.toString()}
    ${grammar_type.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);

describe('test type', () => {
    it('should read a simple type', () => {
        expect(parser.parse(`String`)).to.be.deep.equal([{name: 'String', config: {}, fullname: 'String', template: []}]);
    });
    it('should read a simple type with a single templated type', () => {
        expect(parser.parse(`List<String>`)).to.be.deep.equal([
            {name: 'List', config: {}, fullname: 'List<String>', template: [[{name: 'String', config: {}, fullname: 'String', template: []}]]},
        ]);
    });
    it('should read a simple type with multiple templated types', () => {
        expect(parser.parse(`Map<String, Number>`)).to.be.deep.equal([
            {
                name: 'Map',
                config: {},
                fullname: 'Map<String, Number>',
                template: [
                    [{name: 'String', config: {}, fullname: 'String', template: []}],
                    [{name: 'Number', config: {}, fullname: 'Number', template: []}],
                ],
            },
        ]);
    });
    it('should read a union type', () => {
        expect(parser.parse(`String | Boolean`)).to.be.deep.equal([
            {name: 'String', config: {}, fullname: 'String', template: []},
            {name: 'Boolean', config: {}, fullname: 'Boolean', template: []},
        ]);
    });
    it('should read a union templated type', () => {
        expect(parser.parse(`Map<String, List<String>> | Boolean`)).to.be.deep.equal([
            {
                name: 'Map',
                config: {},
                fullname: 'Map<String, List<String>>',
                template: [
                    [{name: 'String', config: {}, fullname: 'String', template: []}],
                    [{name: 'List', config: {}, fullname: 'List<String>', template: [[{name: 'String', config: {}, fullname: 'String', template: []}]]}],
                ],
            },
            {name: 'Boolean', config: {}, fullname: 'Boolean', template: []},
        ]);
    });
    it('should read a simple type with simple config', () => {
        expect(parser.parse(`String{value: "Hello"}`)).to.be.deep.equal([
            {name: 'String', config: {value: 'Hello'}, fullname: 'String{value: "Hello"}', template: []},
        ]);
    });
    it('should read a simple type with complex config', () => {
        expect(parser.parse(`String{value: "Hello", values: [1, 2, 3]}`)).to.be.deep.equal([
            {name: 'String', config: {value: 'Hello', values: [1, 2, 3]}, fullname: 'String{value: "Hello", values: [1, 2, 3]}', template: []},
        ]);
    });
});
