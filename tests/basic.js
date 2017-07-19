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
    it("should test unary expression", () => {
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
    it("should test a multiplication", () => {
        expect(parser.parse("10 * 12")).to.be.equal(10 * 12);
        expect(parser.parse("10 / 12")).to.be.equal(10 / 12);
        expect(parser.parse("10 % 12")).to.be.equal(10 % 12);
        expect(parser.parse("10.0000 % 12.0000")).to.be.equal(10.0000 % 12.0000);

        expect(() => parser.parse("10 ** 12")).to.throw();
        expect(() => parser.parse("10 // 12")).to.throw();
        expect(() => parser.parse("10 %% 12")).to.throw();
    });
    it("should test an addition", () => {
        expect(parser.parse("10 + 12")).to.be.equal(10 + 12);
        expect(parser.parse("10 - 12")).to.be.equal(10 - 12);
        expect(parser.parse("0x10 + 0x12")).to.be.equal(0x10 + 0x12);
        expect(parser.parse("0x10 - 0x12")).to.be.equal(0x10 - 0x12);

        expect(() => parser.parse("0x10 ++ 0x12")).to.throw();
        expect(() => parser.parse("0x10 -- 0x12")).to.throw();
    });
});