const fs = require('fs');
const peg = require('pegjs');
const path = require('path');
const chai = require('chai');
const mocha = require('mocha');

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const grammar_expression = fs.readFileSync(path.join('src', 'expression.pegjs'));
const grammar_unicode = fs.readFileSync(path.join('src', 'unicode.pegjs'));
const grammar_type = fs.readFileSync(path.join('src', 'type.pegjs'));
const parser = peg.generate(`
    ${grammar_type.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);

describe('test type', () => {
    it('should read a simple type', () => {
        expect(parser.parse(`String`)).to.be.deep.equal([{name: 'String', config: {}, fullname: 'String', templates: []}]);
    });
    it('should read a simple type with one template', () => {
        expect(parser.parse(`List<String>`)).to.be.deep.equal([
            {name: 'List', config: {}, fullname: 'List<String>', templates: [[{name: 'String', config: {}, fullname: 'String', templates: []}]]},
        ]);
    });
    it('should read a simple type with multiple templates', () => {
        expect(parser.parse(`Map<String, Number>`)).to.be.deep.equal([
            {
                name: 'Map',
                config: {},
                fullname: 'Map<String, Number>',
                templates: [
                    [{name: 'String', config: {}, fullname: 'String', templates: []}],
                    [{name: 'Number', config: {}, fullname: 'Number', templates: []}],
                ],
            },
        ]);
    });
    it('should read a union type', () => {
        expect(parser.parse(`String | Boolean`)).to.be.deep.equal([
            {name: 'String', config: {}, fullname: 'String', templates: []},
            {name: 'Boolean', config: {}, fullname: 'Boolean', templates: []},
        ]);
    });
    it('should read a union templated type', () => {
        expect(parser.parse(`Map<String, List<String>> | Boolean`)).to.be.deep.equal([
            {
                name: 'Map',
                config: {},
                fullname: 'Map<String, List<String>>',
                templates: [
                    [{name: 'String', config: {}, fullname: 'String', templates: []}],
                    [{name: 'List', config: {}, fullname: 'List<String>', templates: [[{name: 'String', config: {}, fullname: 'String', templates: []}]]}],
                ],
            },
            {name: 'Boolean', config: {}, fullname: 'Boolean', templates: []},
        ]);
    });
    it('should read a simple type with config', () => {
        expect(parser.parse(`String{value: "Hello"}`)).to.be.deep.equal([
            {name: 'String', config: {value: 'Hello'}, fullname: 'String{value: "Hello"}', templates: []},
        ]);
    });
});
