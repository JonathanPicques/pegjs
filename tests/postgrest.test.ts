import * as fs from 'fs';
import * as peg from 'peggy';
import * as path from 'path';
import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const parser = peg.generate(fs.readFileSync(path.join('src', 'grammar.pegjs')).toString(), {allowedStartRules: ['Postgrest']});

describe('test postgrest', () => {
    it('should generate root comparisons', () => {
        expect(parser.parse(`age = 32`)).to.be.equal(`age=eq.32`);
        expect(parser.parse(`age < 32`)).to.be.equal(`age=lt.32`);
        expect(parser.parse(`age > 32`)).to.be.equal(`age=gt.32`);
        expect(parser.parse(`age <= 32`)).to.be.equal(`age=lte.32`);
        expect(parser.parse(`age >= 32`)).to.be.equal(`age=gte.32`);
    });
    it('should generate root function', () => {
        expect(parser.parse(`FTS(description, "findme")`)).to.be.equal(`description=fts.findme`);
    });
    it('should generate root logical expressions', () => {
        expect(parser.parse(`OR(name = "Vincent")`)).to.be.equal(`or=(name.eq.Vincent)`);
        expect(parser.parse(`OR(name = "Vincent", age > 32)`)).to.be.equal(`or=(name.eq.Vincent,age.gt.32)`);
        expect(parser.parse(`AND(name = "Vincent", age > 32)`)).to.be.equal(`and=(name.eq.Vincent,age.gt.32)`);
        expect(parser.parse(`AND(name = "Vincent", age > 32, age < 64)`)).to.be.equal(`and=(name.eq.Vincent,age.gt.32,age.lt.64)`);
    });
    it('should generate root logical expressions with NOT', () => {
        expect(parser.parse(`AND(name = "Vincent", NOT(age > 32))`)).to.be.equal(`and=(name.eq.Vincent,age.not.gt.32)`);
    });
    it('should mix and match logical expressions, functions, comparisons and NOT', () => {
        expect(parser.parse(`OR(FTS(description, "search"), age > 32, NOT(name = "Jonathan"), NOT(FTS(description, "forbid")))`)).to.be.equal(
            `or=(description.fts.search,age.gt.32,name.not.eq.Jonathan,description.not.fts.forbid)`,
        );
    });
});
