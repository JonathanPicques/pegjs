import * as fs from 'fs';
import * as peg from 'pegjs';
import * as path from 'path';
import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const grammar_text = fs.readFileSync(path.join('src', 'grammars', 'text.pegjs'));
const grammar_unicode = fs.readFileSync(path.join('src', 'grammars', 'unicode.pegjs'));
const parser = peg.generate(`
    ${grammar_text.toString()}
    ${grammar_unicode.toString()}
`);

describe('test paragraphs', () => {
    it('should test a text paragraph', async () => {
        expect(await parser.parse('Hello')).to.be.deep.equal([
            {type: 'p', children: [{text: 'Hello'}]},
            //
        ]);
    });
    it('should test two text paragraphs', async () => {
        expect(await parser.parse('Hello\nWorld')).to.be.deep.equal([
            {type: 'p', children: [{text: 'Hello'}]},
            {type: 'p', children: [{text: 'World'}]},
        ]);
    });
    it('should test a paragraph followed by a blank line', async () => {
        expect(await parser.parse('Hello\n')).to.be.deep.equal([
            {type: 'p', children: [{text: 'Hello'}]},
            {type: 'p', children: [{text: ''}]},
        ]);
    });
    it('should test a paragraph followed by two blank lines', async () => {
        expect(await parser.parse('Hello\n\n')).to.be.deep.equal([
            {type: 'p', children: [{text: 'Hello'}]},
            {type: 'p', children: [{text: ''}]},
            {type: 'p', children: [{text: ''}]},
        ]);
    });
    it('should test two text paragraphs with a blank line (collapsed)', async () => {
        expect(await parser.parse('Hello\n\nWorld')).to.be.deep.equal([
            {type: 'p', children: [{text: 'Hello'}]},
            {type: 'p', children: [{text: ''}]},
            {type: 'p', children: [{text: 'World'}]},
        ]);
    });
    // it('should test a blank line and a paragraph', async () => {
    //     expect(await parser.parse('\nHello')).to.be.deep.equal([
    //         {type: 'p', children: [{text: ''}]},
    //         {type: 'p', children: [{text: 'Hello'}]},
    //     ]);
    // });
});
