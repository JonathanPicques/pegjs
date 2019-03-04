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
const parser = peg.generate(`
    ${grammar_abstraction.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);

describe("test literal", () => {
    it("should test null", () => {
        expect(parser.parse("null")).to.be.equal(null);
    });
    it("should test booleans", () => {
        expect(parser.parse("true")).to.be.equal(true);
        expect(parser.parse("false")).to.be.equal(false);
    });
    it("should test numbers", () => {
        expect(parser.parse("0x123")).to.be.equal(0x123);
        expect(parser.parse("0x123e10")).to.be.equal(0x123e10);
        expect(parser.parse("0x123E10")).to.be.equal(0x123E10);

        expect(parser.parse("0")).to.be.equal(0);
        expect(parser.parse("00")).to.be.equal(0);
        expect(parser.parse("100")).to.be.equal(100);
        expect(parser.parse("100e10")).to.be.equal(100e10);
        expect(parser.parse("100E10")).to.be.equal(100E10);

        expect(parser.parse("0b0")).to.be.equal(0b0);
        expect(parser.parse("0b111")).to.be.equal(0b111);
        expect(parser.parse("0b0011")).to.be.equal(0b0011);

        expect(parser.parse("0.0")).to.be.equal(0.0);
        expect(parser.parse("0.1")).to.be.equal(0.1);
        expect(parser.parse(".1")).to.be.equal(.1);
        expect(parser.parse("324.01")).to.be.equal(324.01);
        expect(parser.parse("324.01e3")).to.be.equal(324.01e3);

        expect(() => parser.parse("0b")).to.throw();
        expect(() => parser.parse("0b2")).to.throw();
        expect(() => parser.parse("0b1e3")).to.throw();
        expect(() => parser.parse("..3")).to.throw();
        expect(() => parser.parse("1.3.4")).to.throw();
        expect(() => parser.parse("12e")).to.throw();
        expect(() => parser.parse("12e0b1")).to.throw();
        expect(() => parser.parse("12e0x1")).to.throw();
        expect(() => parser.parse("0x23.5")).to.throw();
    });
    it("should test strings", () => {
        expect(parser.parse('"superb string"')).to.be.equal("superb string");
        expect(parser.parse("'superb string'")).to.be.equal("superb string");
        expect(parser.parse("`superb string`")).to.be.equal("superb string");

        expect(parser.parse('"superb \\"string\\""')).to.be.equal('superb "string"');
        expect(parser.parse("'superb \\'string\\''")).to.be.equal("superb 'string'");
        expect(parser.parse("`superb \\`string\\``")).to.be.equal("superb `string`");

        expect(parser.parse('"superb string 🎃"')).to.be.equal("superb string 🎃");

        expect(parser.parse(`"multiline\nstring\nis\ngolden"`)).to.be.equal("multiline\nstring\nis\ngolden");
        expect(parser.parse(`'multiline\nstring\nis\ngolden'`)).to.be.equal("multiline\nstring\nis\ngolden");
        expect(parser.parse("`multiline\nstring\nis\ngolden`")).to.be.equal("multiline\nstring\nis\ngolden");

        expect(() => parser.parse(`"superb string'`)).to.throw();
        expect(() => parser.parse(`"superb string`)).to.throw();
        expect(() => parser.parse(`superb string"`)).to.throw();
    });
});
describe("test function", () => {
    it("should test basic functions", () => {
        expect(() => parser.parse("math_sin()")).to.not.throw();
        expect(() => parser.parse("math_sin(32)")).to.not.throw();
        expect(() => parser.parse("math_sin(32, 'hello')")).to.not.throw();
        expect(() => parser.parse("math_sin(32, 'hello', false)")).to.not.throw();
        expect(() => parser.parse("math_sin(32, 'hello', false, 34 >> (2))")).to.not.throw();

        expect(() => parser.parse("math_sin(,)")).to.throw();
        expect(() => parser.parse("math_sin(, 32)")).to.throw();
        expect(() => parser.parse("math_sin(32,)")).to.throw();
        expect(() => parser.parse("math_sin(32, )")).to.throw();
    });
    it("should test default math functions", () => {
        expect(parser.parse("math_pow(2, 6)")).to.be.equal(Math.pow(2, 6));
        expect(parser.parse("math_sin(32)")).to.be.equal(Math.sin(32));

        expect(parser.parse("math_unknown(32)")).to.be.equal(null);
    });
    it("should test default number functions", () => {
        expect(parser.parse("number_parseFloat('34.8__hello')")).to.be.equal(Number.parseFloat("34.8__hello"));

        expect(parser.parse("number_unknown(32)")).to.be.equal(null);
    });
    it("should test default string functions", () => {
        expect(parser.parse("string_replace('hello dear friend', 'friend', 'love')")).to.be.equal("hello dear love");

        expect(parser.parse("string_unknown(32)")).to.be.equal(null);
    });
    it("should test custom functions", () => {
        // noinspection NonAsciiCharacters
        const options = {
            "functions": {
                "custom_double": a => a * 2,
                "âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ": a => a * 3
            }
        };
        expect(parser.parse("custom_double(32)", options)).to.be.equal(64);
        expect(parser.parse("âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ(32)", options)).to.be.equal(96);

        expect(() => parser.parse("9ufo(32)")).to.throw();
    });
});
describe("test identifier", () => {
    it("should test basic identifiers", () => {
        expect(parser.parse("___$$$____")).to.be.equal(null);
        expect(parser.parse("$line$")).to.be.equal(null);
        expect(parser.parse("__dirname")).to.be.equal(null);
        expect(parser.parse("koala")).to.be.equal(null);
        expect(parser.parse("_ident900")).to.be.equal(null);
        expect(parser.parse("trues")).to.be.equal(null);
        expect(parser.parse("nulled")).to.be.equal(null);
        expect(parser.parse("falsefalse")).to.be.equal(null);
        expect(parser.parse("ffalse")).to.be.equal(null);
        expect(parser.parse("accentué")).to.be.equal(null);
        expect(parser.parse("âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ_12__")).to.be.equal(null);
        expect(parser.parse("_ä_ë__$$__k_")).to.be.equal(null);

        expect(() => parser.parse("9true")).to.throw();
        expect(() => parser.parse("AND")).to.throw();
        expect(() => parser.parse("OR")).to.throw();
    });
    it("should test default math identifiers", () => {
        expect(parser.parse("math_PI")).to.be.equal(Math.PI);
        expect(parser.parse("math_E")).to.be.equal(Math.E);
        expect(parser.parse("math_Unknown")).to.be.equal(null);
    });
    it("should test custom identifiers", () => {
        // noinspection NonAsciiCharacters
        const options = {
            "identifiers": {
                "custom_id": 0xDEAD,
                "âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ": 0xDEAD
            }
        };
        expect(parser.parse("custom_id", options)).to.be.equal(0xDEAD);
        expect(parser.parse("âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ", options)).to.be.equal(0xDEAD);
    });
});
describe("test identifier order", () => {
    it("should test basic identifier order", () => {
        const options = {};
        parser.parse("my + story + is + interesting", options);
        expect([...options.identifiers_order]).to.be.eql(["my", "story", "is", "interesting"]);
    });
    it("should test identifier order with pre-existing identifiers", () => {
        const options = {};
        parser.parse("my + story + math_PI + is + interesting", options);
        expect([...options.identifiers_order]).to.be.eql(["my", "story", "is", "interesting"]);
    });
    it("should test identifier order with pre-existing identifiers and functions", () => {
        const options = {};
        parser.parse("my + story + math_PI + is + math_sin(32) + interesting", options);
        expect([...options.identifiers_order]).to.be.eql(["my", "story", "is", "interesting"]);
    });
});
describe("test expression", () => {
    it("should test unary expressions", () => {
        expect(parser.parse("-10")).to.be.equal(-10);
        expect(parser.parse("+10")).to.be.equal(+10);
        expect(parser.parse("-+-+100")).to.be.equal(-+-+100);
        expect(parser.parse("+-+100")).to.be.equal(+-+100);

        expect(parser.parse("!10")).to.be.equal(!10);
        expect(parser.parse("!-+10")).to.be.equal(!-+10);
        // noinspection PointlessBooleanExpressionJS
        expect(parser.parse("!true")).to.be.equal(!true);
        // noinspection PointlessBooleanExpressionJS
        expect(parser.parse("!!!!!false")).to.be.equal(!!!!!false);

        expect(parser.parse("~10")).to.be.equal(~10);
        expect(parser.parse("~100")).to.be.equal(~100);
        expect(parser.parse("~-+100")).to.be.equal(~-+100);

        expect(() => parser.parse("--10")).to.throw();
        expect(() => parser.parse("++10")).to.throw();
        expect(() => parser.parse("+++10")).to.throw();
    });
    it("should test exponentiation expressions", () => {
        expect(parser.parse("2 ** 6")).to.be.equal(2 ** 6);
    });
    it("should test multiplication expressions", () => {
        expect(parser.parse("10 * 12")).to.be.equal(10 * 12);
        expect(parser.parse("10 / 12")).to.be.equal(10 / 12);
        expect(parser.parse("10 % 12")).to.be.equal(10 % 12);
        expect(parser.parse("10.0000 % 12.0000")).to.be.equal(10.0000 % 12.0000);

        expect(() => parser.parse("10 *** 12")).to.throw();
        expect(() => parser.parse("10 // 12")).to.throw();
        expect(() => parser.parse("10 %% 12")).to.throw();
    });
    it("should test addition expressions", () => {
        expect(parser.parse("10 + 12")).to.be.equal(10 + 12);
        expect(parser.parse("10 - 12")).to.be.equal(10 - 12);
        expect(parser.parse("0x10 + 0x12")).to.be.equal(0x10 + 0x12);
        expect(parser.parse("0x10 - 0x12")).to.be.equal(0x10 - 0x12);

        expect(() => parser.parse("0x10 ++ 0x12")).to.throw();
        expect(() => parser.parse("0x10 -- 0x12")).to.throw();
    });
    it("should test shift expressions", () => {
        expect(parser.parse("10 << 10")).to.be.equal(10 << 10);
        expect(parser.parse("10 >>> 10")).to.be.equal(10 >>> 10);
        expect(parser.parse("10 >> 10")).to.be.equal(10 >> 10);

        expect(() => parser.parse("10 <<< 10")).to.throw();
        expect(() => parser.parse("10 <> 10")).to.throw();
        expect(() => parser.parse("10 >>>> 10")).to.throw();
    });
    it("should test relation expressions", () => {
        expect(parser.parse("true > false")).to.be.equal(true > false);
        expect(parser.parse("10 > 10")).to.be.equal(10 > 10);
        expect(parser.parse("'test' > 10")).to.be.equal('test' > 10);

        expect(parser.parse("10 >= 10")).to.be.equal(10 >= 10);
        expect(parser.parse("'length' >= 'length'")).to.be.equal('length' >= 'length');

        expect(parser.parse("10 < 10")).to.be.equal(10 < 10);
        expect(parser.parse("10 < false")).to.be.equal(10 < false);

        expect(parser.parse("10 <= 10")).to.be.equal(10 <= 10);
        expect(parser.parse("10 <= 0x10")).to.be.equal(10 <= 0x10);
    });
    it("should test bitwise expressions", () => {
        expect(parser.parse("0x0011 & 0x0111")).to.be.equal(0x0011 & 0x0111);
        expect(parser.parse("0x0011 ^ 0x0111")).to.be.equal(0x0011 ^ 0x0111);
        expect(parser.parse("0x0011 | 0x0111")).to.be.equal(0x0011 | 0x0111);

        expect(parser.parse("0b0011 & 0b1100")).to.be.equal(0b0011 & 0b1100);
        expect(parser.parse("0b0011 | 0b1100")).to.be.equal(0b0011 | 0b1100);

        expect(() => parser.parse("10 ^^ 10")).to.throw();
    });
    it("should test logical expressions", () => {
        expect(parser.parse("128 && false")).to.be.equal(128 && false);
        expect(parser.parse("'true' || 'false'")).to.be.equal('true' || 'false');

        expect(parser.parse("128 AND false")).to.be.equal(128 && false);
        expect(parser.parse("'true' OR 'false'")).to.be.equal('true' || 'false');

        expect(() => parser.parse("10 &&& 10")).to.throw();
        expect(() => parser.parse("10 ||| 10")).to.throw();

        expect(() => parser.parse("10 + AND")).to.throw();
        expect(() => parser.parse("10 + OR")).to.throw();
    });
    it("should test conditional expressions", () => {
        expect(parser.parse("123 ? 'false' : 12")).to.be.equal(123 ? 'false' : 12);
        expect(parser.parse("123? 'false' :12")).to.be.equal(123 ? 'false' : 12);
        expect(parser.parse("1 ? 0 ? 1 : 2 : 0x43")).to.be.equal(1 ? 0 ? 1 : 2 : 0x43);
        expect(parser.parse("6 > 5 ? 'him' : 'me'")).to.be.equal((6 > 5) ? 'him' : 'me');

        expect(parser.parse("19 ?: 10")).to.be.equal(19);
        expect(parser.parse("0 ?: 10")).to.be.equal(10);

        expect(parser.parse("0 ? 12 : 10 ?: false")).to.be.equal(10);

        expect(() => parser.parse("0 ? : false")).to.throw();
    });
    it("should test nested conditional expressions", () => {
        const options = {
            "identifiers": {
                "a": 1,
                "b": 0
            }
        };
        expect(parser.parse("a ? (b ? 32 : (64 > 2) ? 'success' : 'failure') : 128", options)).to.be.equal("success");
        expect(parser.parse("a ? b ? 32 : 64 > 2 ? 'success' : 'failure' : 128", options)).to.be.equal("success");
    });
});
describe("test expression precedence", () => {
    it("should multiply before adding", () => {
        expect(parser.parse("2 + 4 * 10")).to.be.equal(2 + 4 * 10);
        expect(parser.parse("2 + 4 / 10")).to.be.equal(2 + 4 / 10);
        expect(parser.parse("2 + 4 % 10")).to.be.equal(2 + 4 % 10);
    });
    it("should add before multiply", () => {
        expect(parser.parse("(2 + 4) * 10")).to.be.equal((2 + 4) * 10);
        expect(parser.parse("(2 + 4) / 10")).to.be.equal((2 + 4) / 10);
        expect(parser.parse("(2 + 4) % 10")).to.be.equal((2 + 4) % 10);
    });
    it("should test bitwise and logical precedence", () => {
        expect(parser.parse("12 | 43 & 36")).to.be.equal(12 | 43 & 36);
        expect(parser.parse("12 || 43 && 36")).to.be.equal(12 || 43 && 36);
    });
    it("should follow natural order between same precedence", () => {
        expect(parser.parse("12 * 3 / 45 % 7")).to.be.equal(12 * 3 / 45 % 7);
        expect(parser.parse("12 * 3 % 45 / 7")).to.be.equal(12 * 3 % 45 / 7);
        expect(parser.parse("12 / 3 * 45 % 7")).to.be.equal(12 / 3 * 45 % 7);
        expect(parser.parse("12 / 3 % 45 * 7")).to.be.equal(12 / 3 % 45 * 7);
        expect(parser.parse("12 % 3 * 45 / 7")).to.be.equal(12 % 3 * 45 / 7);
        expect(parser.parse("12 % 3 / 45 * 7")).to.be.equal(12 % 3 / 45 * 7);
    });
});
describe("test complex expression", () => {
    it("should test complex expressions", () => {
        // noinspection PointlessArithmeticExpressionJS
        expect(parser.parse("((((((((32 * 2)))))))) * 1 + 1")).to.be.equal(((((((((32 * 2)))))))) * 1 + 1);
        // noinspection ConstantConditionalExpressionJS
        expect(parser.parse("1 - -(-true ? (32 * ((34 + 10) - +10) & 32 | 78) : 24 ^ 321)")).to.be.equal(1 - -(-true ? (32 * ((34 + 10) - +10) & 32 | 78) : 24 ^ 321));
    });
});