const fs = require("fs");
const peg = require("pegjs");
const path = require("path");
const chai = require("chai");
const mocha = require("mocha");

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const grammar = fs.readFileSync(path.join("src", "basic.pegjs"));
const parser = peg.generate(grammar.toString());

describe("test basic literals", () => {
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

        expect(parser.parse("0.0")).to.be.equal(0.0);
        expect(parser.parse("0.1")).to.be.equal(0.1);
        expect(parser.parse(".1")).to.be.equal(.1);
        expect(parser.parse("324.01")).to.be.equal(324.01);
        expect(parser.parse("324.01e3")).to.be.equal(324.01e3);

        expect(() => parser.parse("..3")).to.throw();
        expect(() => parser.parse("1.3.4")).to.throw();
        expect(() => parser.parse("0x23.5")).to.throw();
    });
});
describe("test basic expressions", () => {
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
    it("should test multiplication expressions", () => {
        expect(parser.parse("10 * 12")).to.be.equal(10 * 12);
        expect(parser.parse("10 / 12")).to.be.equal(10 / 12);
        expect(parser.parse("10 % 12")).to.be.equal(10 % 12);
        expect(parser.parse("10.0000 % 12.0000")).to.be.equal(10.0000 % 12.0000);

        expect(() => parser.parse("10 ** 12")).to.throw();
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

        expect(() => parser.parse("10 ^^ 10")).to.throw();
    });
    it("should test logical expressions", () => {
        expect(parser.parse("128 && false")).to.be.equal(128 && false);
        expect(parser.parse("'true' || 'false'")).to.be.equal('true' || 'false');

        expect(() => parser.parse("10 &&& 10")).to.throw();
        expect(() => parser.parse("10 ||| 10")).to.throw();
    });
    it("should test conditional expressions", () => {
        expect(parser.parse("123 ? 'false' : 12")).to.be.equal(123 ? 'false' : 12);
        expect(parser.parse("123? 'false' :12")).to.be.equal(123 ? 'false' : 12);
        expect(parser.parse("1 ? 0 ? 1 : 2 : 0x43")).to.be.equal(1 ? 0 ? 1 : 2 : 0x43);

        expect(parser.parse("19 ?: 10")).to.be.equal(19);
        expect(parser.parse("0 ?: 10")).to.be.equal(10);

        expect(parser.parse("0 ? 12 : 10 ?: false")).to.be.equal(10);

        expect(() => parser.parse("0 ? : false")).to.throw();
    });
});
describe("test priority expressions", () => {
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
});