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
const parser = peg.generate(`
    ${grammar_abstraction.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);

describe('test literal', () => {
    it('should test null', () => {
        expect(parser.parse('null')).to.be.equal(null);
    });
    it('should test arrays', () => {
        expect(parser.parse('[]')).to.be.deep.equal([]);
        expect(parser.parse("[1, 2, 'false']")).to.be.deep.equal([1, 2, 'false']);
    });
    it('should test objects', () => {
        expect(parser.parse('{}')).to.be.deep.equal({});
        expect(parser.parse("{a: 'a'}")).to.be.deep.equal({a: 'a'});
        expect(parser.parse("{'a': 'a'}")).to.be.deep.equal({a: 'a'});
    });
    it('should test numbers', () => {
        expect(parser.parse('0x123')).to.be.equal(0x123);
        expect(parser.parse('0x123e10')).to.be.equal(0x123e10);
        expect(parser.parse('0x123E10')).to.be.equal(0x123e10);

        expect(parser.parse('0')).to.be.equal(0);
        expect(parser.parse('00')).to.be.equal(0);
        expect(parser.parse('100')).to.be.equal(100);
        expect(parser.parse('100e10')).to.be.equal(100e10);
        expect(parser.parse('100E10')).to.be.equal(100e10);

        expect(parser.parse('0b0')).to.be.equal(0b0);
        expect(parser.parse('0b111')).to.be.equal(0b111);
        expect(parser.parse('0b0011')).to.be.equal(0b0011);

        expect(parser.parse('0.0')).to.be.equal(0.0);
        expect(parser.parse('0.1')).to.be.equal(0.1);
        expect(parser.parse('.1')).to.be.equal(0.1);
        expect(parser.parse('324.01')).to.be.equal(324.01);
        expect(parser.parse('324.01e3')).to.be.equal(324.01e3);

        expect(() => parser.parse('0b')).to.throw();
        expect(() => parser.parse('0b2')).to.throw();
        expect(() => parser.parse('0b1e3')).to.throw();
        expect(() => parser.parse('..3')).to.throw();
        expect(() => parser.parse('1.3.4')).to.throw();
        expect(() => parser.parse('12e')).to.throw();
        expect(() => parser.parse('12e0b1')).to.throw();
        expect(() => parser.parse('12e0x1')).to.throw();
        expect(() => parser.parse('0x23.5')).to.throw();
    });
    it('should test strings', () => {
        expect(parser.parse('"superb string"')).to.be.equal('superb string');
        expect(parser.parse("'superb string'")).to.be.equal('superb string');
        expect(parser.parse('`superb string`')).to.be.equal('superb string');

        expect(parser.parse('"superb \\"string\\""')).to.be.equal('superb "string"');
        expect(parser.parse("'superb \\'string\\''")).to.be.equal("superb 'string'");
        expect(parser.parse('`superb \\`string\\``')).to.be.equal('superb `string`');

        expect(parser.parse('"superb string 🎃"')).to.be.equal('superb string 🎃');

        expect(parser.parse(`"multiline\nstring\nis\ngolden"`)).to.be.equal('multiline\nstring\nis\ngolden');
        expect(parser.parse(`'multiline\nstring\nis\ngolden'`)).to.be.equal('multiline\nstring\nis\ngolden');
        expect(parser.parse('`multiline\nstring\nis\ngolden`')).to.be.equal('multiline\nstring\nis\ngolden');

        expect(() => parser.parse(`"superb string'`)).to.throw();
        expect(() => parser.parse(`"superb string`)).to.throw();
        expect(() => parser.parse(`superb string"`)).to.throw();
    });
    it('should test booleans', () => {
        expect(parser.parse('true')).to.be.equal(true);
        expect(parser.parse('false')).to.be.equal(false);
    });
});
describe('test function', () => {
    it('should test basic functions', () => {
        expect(() => parser.parse('math_sin()')).to.not.throw();
        expect(() => parser.parse('math_sin(32)')).to.not.throw();
        expect(() => parser.parse("math_sin(32, 'hello')")).to.not.throw();
        expect(() => parser.parse("math_sin(32, 'hello', false)")).to.not.throw();
        expect(() => parser.parse("math_sin(32, 'hello', false, 34 >> (2))")).to.not.throw();

        expect(() => parser.parse('math_sin(,)')).to.throw();
        expect(() => parser.parse('math_sin(, 32)')).to.throw();
        expect(() => parser.parse('math_sin(32,)')).to.throw();
        expect(() => parser.parse('math_sin(32, )')).to.throw();
    });
    it('should test default math functions', () => {
        expect(parser.parse('math_pow(2, 6)')).to.be.equal(Math.pow(2, 6));
        expect(parser.parse('math_sin(32)')).to.be.equal(Math.sin(32));

        expect(parser.parse('math_unknown(32)')).to.be.equal(null);
    });
    it('should test default number functions', () => {
        expect(parser.parse("number_parseFloat('34.8__hello')")).to.be.equal(Number.parseFloat('34.8__hello'));

        expect(parser.parse('number_unknown(32)')).to.be.equal(null);
    });
    it('should test default string functions', () => {
        expect(parser.parse("string_replace('hello dear friend', 'friend', 'love')")).to.be.equal('hello dear love');

        expect(parser.parse('string_unknown(32)')).to.be.equal(null);
    });
    it('should test custom functions', () => {
        // noinspection NonAsciiCharacters
        const options = {
            functions: {
                custom_double: a => a * 2,
                âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ: a => a * 3,
            },
        };
        expect(parser.parse('custom_double(32)', options)).to.be.equal(64);
        expect(parser.parse('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ(32)', options)).to.be.equal(96);

        expect(parser.parse('   custom_double(32)  ', options)).to.be.equal(64);
        expect(parser.parse('  âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ   (  32 )  ', options)).to.be.equal(96);

        expect(() => parser.parse('9ufo(32)')).to.throw();
    });
});
describe('test identifier', () => {
    it('should test basic identifiers', () => {
        expect(parser.parse('___$$$____')).to.be.equal(null);
        expect(parser.parse('$line$')).to.be.equal(null);
        expect(parser.parse('__dirname')).to.be.equal(null);
        expect(parser.parse('koala')).to.be.equal(null);
        expect(parser.parse('_ident900')).to.be.equal(null);
        expect(parser.parse('trues')).to.be.equal(null);
        expect(parser.parse('nulled')).to.be.equal(null);
        expect(parser.parse('falsefalse')).to.be.equal(null);
        expect(parser.parse('ffalse')).to.be.equal(null);
        expect(parser.parse('accentué')).to.be.equal(null);
        expect(parser.parse('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ_12__')).to.be.equal(null);
        expect(parser.parse('_ä_ë__$$__k_')).to.be.equal(null);

        expect(() => parser.parse('9true')).to.throw();
        expect(() => parser.parse('AND')).to.throw();
        expect(() => parser.parse('OR')).to.throw();
    });
    it('should test default math identifiers', () => {
        expect(parser.parse('math_PI')).to.be.equal(Math.PI);
        expect(parser.parse('math_E')).to.be.equal(Math.E);
        expect(parser.parse('math_Unknown')).to.be.equal(null);

        expect(parser.parse('   math_PI')).to.be.equal(Math.PI);
        expect(parser.parse('       math_E  ')).to.be.equal(Math.E);
        expect(parser.parse('  math_Unknown')).to.be.equal(null);
    });
    it('should test custom identifiers', () => {
        // noinspection NonAsciiCharacters
        const options = {
            identifiers: {
                custom_id: 0xdead,
                âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ: 0xdead,
            },
        };
        expect(parser.parse('custom_id', options)).to.be.equal(0xdead);
        expect(parser.parse('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ', options)).to.be.equal(0xdead);

        expect(parser.parse(' custom_id  ', options)).to.be.equal(0xdead);
        expect(parser.parse('   âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ    ', options)).to.be.equal(0xdead);
    });
});
describe('test identifier order', () => {
    it('should test basic identifier order', () => {
        const options = {};
        parser.parse('my + story + is + interesting', options);
        expect([...options.identifiers_order]).to.be.deep.equal(['my', 'story', 'is', 'interesting']);
    });
    it('should test identifier order with pre-existing identifiers', () => {
        const options = {};
        parser.parse('my + story + math_PI + is + interesting', options);
        expect([...options.identifiers_order]).to.be.deep.equal(['my', 'story', 'is', 'interesting']);
    });
    it('should test identifier order with pre-existing identifiers and functions', () => {
        const options = {};
        parser.parse('my + story + math_PI + is + math_sin(32) + interesting', options);
        expect([...options.identifiers_order]).to.be.deep.equal(['my', 'story', 'is', 'interesting']);
    });
});
describe('test expression', () => {
    it('should test unary expressions', () => {
        expect(parser.parse('-10')).to.be.equal(-10);
        expect(parser.parse('+10')).to.be.equal(+10);
        expect(parser.parse('-+-+100')).to.be.equal(-+-+100);
        expect(parser.parse('+-+100')).to.be.equal(+-+100);

        expect(parser.parse('!10')).to.be.equal(!10);
        expect(parser.parse('!-+10')).to.be.equal(!-+10);
        // noinspection PointlessBooleanExpressionJS
        expect(parser.parse('!true')).to.be.equal(!true);
        // noinspection PointlessBooleanExpressionJS
        expect(parser.parse('!!!!!false')).to.be.equal(!!!!!false);

        expect(parser.parse('~10')).to.be.equal(~10);
        expect(parser.parse('~100')).to.be.equal(~100);
        expect(parser.parse('~-+100')).to.be.equal(~-+100);

        expect(() => parser.parse('--10')).to.throw();
        expect(() => parser.parse('++10')).to.throw();
        expect(() => parser.parse('+++10')).to.throw();
    });
    it('should test exponentiation expressions', () => {
        expect(parser.parse('2 ** 6')).to.be.equal(2 ** 6);
    });
    it('should test multiplication expressions', () => {
        expect(parser.parse('10 * 12')).to.be.equal(10 * 12);
        expect(parser.parse('10 / 12')).to.be.equal(10 / 12);
        expect(parser.parse('10 % 12')).to.be.equal(10 % 12);
        expect(parser.parse('10.0000 % 12.0000')).to.be.equal(10.0 % 12.0);

        expect(() => parser.parse('10 *** 12')).to.throw();
        expect(() => parser.parse('10 // 12')).to.throw();
        expect(() => parser.parse('10 %% 12')).to.throw();
    });
    it('should test addition expressions', () => {
        expect(parser.parse('10 + 12')).to.be.equal(10 + 12);
        expect(parser.parse('10 - 12')).to.be.equal(10 - 12);
        expect(parser.parse('0x10 + 0x12')).to.be.equal(0x10 + 0x12);
        expect(parser.parse('0x10 - 0x12')).to.be.equal(0x10 - 0x12);

        expect(() => parser.parse('0x10 ++ 0x12')).to.throw();
        expect(() => parser.parse('0x10 -- 0x12')).to.throw();
    });
    it('should test shift expressions', () => {
        expect(parser.parse('10 << 10')).to.be.equal(10 << 10);
        expect(parser.parse('10 >>> 10')).to.be.equal(10 >>> 10);
        expect(parser.parse('10 >> 10')).to.be.equal(10 >> 10);

        expect(() => parser.parse('10 <<< 10')).to.throw();
        expect(() => parser.parse('10 <> 10')).to.throw();
        expect(() => parser.parse('10 >>>> 10')).to.throw();
    });
    it('should test relation expressions', () => {
        expect(parser.parse('true > false')).to.be.equal(true > false);
        expect(parser.parse('10 > 10')).to.be.equal(10 > 10);
        expect(parser.parse("'test' > 10")).to.be.equal('test' > 10);

        expect(parser.parse('10 >= 10')).to.be.equal(10 >= 10);
        expect(parser.parse("'length' >= 'length'")).to.be.equal('length' >= 'length');

        expect(parser.parse('10 < 10')).to.be.equal(10 < 10);
        expect(parser.parse('10 < false')).to.be.equal(10 < false);

        expect(parser.parse('10 <= 10')).to.be.equal(10 <= 10);
        expect(parser.parse('10 <= 0x10')).to.be.equal(10 <= 0x10);
    });
    it('should test bitwise expressions', () => {
        expect(parser.parse('0x0011 & 0x0111')).to.be.equal(0x0011 & 0x0111);
        expect(parser.parse('0x0011 ^ 0x0111')).to.be.equal(0x0011 ^ 0x0111);
        expect(parser.parse('0x0011 | 0x0111')).to.be.equal(0x0011 | 0x0111);

        expect(parser.parse('0b0011 & 0b1100')).to.be.equal(0b0011 & 0b1100);
        expect(parser.parse('0b0011 | 0b1100')).to.be.equal(0b0011 | 0b1100);

        expect(() => parser.parse('10 ^^ 10')).to.throw();
    });
    it('should test logical expressions', () => {
        expect(parser.parse('128 && false')).to.be.equal(128 && false);
        expect(parser.parse("'true' || 'false'")).to.be.equal('true' || 'false');

        expect(parser.parse('128 AND false')).to.be.equal(128 && false);
        expect(parser.parse("'true' OR 'false'")).to.be.equal('true' || 'false');

        expect(() => parser.parse('10 &&& 10')).to.throw();
        expect(() => parser.parse('10 ||| 10')).to.throw();

        expect(() => parser.parse('10 + AND')).to.throw();
        expect(() => parser.parse('10 + OR')).to.throw();
    });
    it('should test conditional expressions', () => {
        expect(parser.parse("123 ? 'false' : 12")).to.be.equal(123 ? 'false' : 12);
        expect(parser.parse("123? 'false' :12")).to.be.equal(123 ? 'false' : 12);
        expect(parser.parse('1 ? 0 ? 1 : 2 : 0x43')).to.be.equal(1 ? (0 ? 1 : 2) : 0x43);
        expect(parser.parse("6 > 5 ? 'him' : 'me'")).to.be.equal(6 > 5 ? 'him' : 'me');

        expect(parser.parse('19 ?: 10')).to.be.equal(19);
        expect(parser.parse('0 ?: 10')).to.be.equal(10);

        expect(parser.parse('0 ? 12 : 10 ?: false')).to.be.equal(10);

        expect(() => parser.parse('0 ? : false')).to.throw();
    });
    it('should test nested conditional expressions', () => {
        const options = {
            identifiers: {
                a: 1,
                b: 0,
            },
        };
        expect(parser.parse("a ? (b ? 32 : (64 > 2) ? 'success' : 'failure') : 128", options)).to.be.equal('success');
        expect(parser.parse("a ? b ? 32 : 64 > 2 ? 'success' : 'failure' : 128", options)).to.be.equal('success');
    });
    it('should test expressions with math and custom identifiers', () => {
        const options = {
            identifiers: {
                number: 42,
                a: 1,
                b: 2,
                c: 3,
                d: 4, 
                e: 5, 
                f: 6,
            },
        };
        expect(parser.parse('number + 10', options)).to.be.equal(52);
        expect(parser.parse('10 + number', options)).to.be.equal(52);
        expect(parser.parse('number > 10 ? 10 : 20', options)).to.be.equal(10);
        expect(parser.parse('number < 10 ? 10 : 20', options)).to.be.equal(20);
        expect(parser.parse('10 < number ? 10 : 20', options)).to.be.equal(10);
        expect(parser.parse('10 > number ? 10 : 20', options)).to.be.equal(20);
        expect(parser.parse('number > 10 ? 10 + number : 20 + number', options)).to.be.equal(52);
        expect(parser.parse('number < 10 ? 10 + number : 20 + number', options)).to.be.equal(62);
        expect(parser.parse('number > 10 ? number + 10 : number + 20', options)).to.be.equal(52);
        expect(parser.parse('number < 10 ? number + 10 : number + 20', options)).to.be.equal(62);
        expect(parser.parse('number / math_PI * 5', options)).to.be.equal(42 / Math.PI * 5);
        expect(parser.parse('math_PI / number * 5', options)).to.be.equal(Math.PI / 42 * 5);
        expect(parser.parse('a > b ? d + e + f > 0 : a + b + 1', options)).to.be.equal(4);
        expect(parser.parse('(a > b) ? (d + e + f > 0) : (a + b + 1)', options)).to.be.equal(4);
    });
    it('should test conditional expressions and identifier lazy resolution', () => {
        const options = {
            identifiers: new Proxy({
                valid_id: 42,
                invalid_id: 0xdead,
                valid_id_obj: {test: 32},
                invalid_id_obj: {test: 0xdead},
            }, {
                get(target, property, receiver) {
                    if (property === 'invalid_id' || property === 'invalid_id_obj') {
                        throw new Error('Cannot get invalid id');
                    }
                    return Reflect.get(target, property, receiver);
                }
            }),
        };
        expect(parser.parse('valid_id', options)).to.be.equal(42);
        expect(() => parser.parse('invalid_id', options)).to.throw();
        expect(parser.parse('true ? valid_id : invalid_id', options)).to.be.equal(42);
        expect(() => parser.parse('true ? invalid_id : valid_id', options)).to.throw();
        expect(parser.parse('true ? valid_id + 10 : invalid_id - 10', options)).to.be.equal(52);
        expect(() => parser.parse('false ? valid_id + 10 : invalid_id - 10', options)).to.throw();
        expect(parser.parse('valid_id_obj.test', options)).to.be.equal(32);
        expect(() => parser.parse('invalid_id_obj.test', options)).to.throw();
        expect(parser.parse('valid_id_obj.test === 32 ? valid_id_obj.test + 10 : invalid_id_obj.test + 10', options)).to.equal(42);
        expect(() =>parser.parse('valid_id_obj.test !== 32 ? valid_id_obj.test + 10 : invalid_id_obj.test + 10', options)).to.throw();
        expect(parser.parse('valid_id_obj.test === 32 ? 10 + valid_id_obj.test : 10 + invalid_id_obj.test', options)).to.equal(42);
        expect(() =>parser.parse('valid_id_obj.test !== 32 ? 10 + valid_id_obj.test : 10 + invalid_id_obj.test', options)).to.throw();
    });
    it('should test property accessors', () => {
        const options = {
            identifiers: {
                a: [1, 2, 3],
                b: {
                    inner: [1, {sub: 'yes'}, 3],
                },
                c: [[], [[20, 40], [20, {sub: 42}]], {}],
            },
        };
        expect(parser.parse('a[2]', options)).to.be.equal(3);
        expect(parser.parse('b.inner[0]', options)).to.be.equal(1);
        expect(parser.parse("b['inner'][0]", options)).to.be.equal(1);
        expect(parser.parse("b['inner'][1].sub", options)).to.be.equal('yes');
        expect(parser.parse('c[1][1][1].sub', options)).to.be.equal(42);

        expect(parser.parse('[[[{o: [[[true]]]}]]][0][0][0].o[0][0][0]', options)).to.be.equal(true);
    });
});
describe('test expression precedence', () => {
    it('should multiply before adding', () => {
        expect(parser.parse('2 + 4 * 10')).to.be.equal(2 + 4 * 10);
        expect(parser.parse('2 + 4 / 10')).to.be.equal(2 + 4 / 10);
        expect(parser.parse('2 + 4 % 10')).to.be.equal(2 + (4 % 10));
    });
    it('should add before multiply', () => {
        expect(parser.parse('(2 + 4) * 10')).to.be.equal((2 + 4) * 10);
        expect(parser.parse('(2 + 4) / 10')).to.be.equal((2 + 4) / 10);
        expect(parser.parse('(2 + 4) % 10')).to.be.equal((2 + 4) % 10);
    });
    it('should test bitwise and logical precedence', () => {
        expect(parser.parse('12 | 43 & 36')).to.be.equal(12 | (43 & 36));
        expect(parser.parse('12 || 43 && 36')).to.be.equal(12 || (43 && 36));
    });
    it('should follow natural order between same precedence', () => {
        expect(parser.parse('12 * 3 / 45 % 7')).to.be.equal(((12 * 3) / 45) % 7);
        expect(parser.parse('12 * 3 % 45 / 7')).to.be.equal(((12 * 3) % 45) / 7);
        expect(parser.parse('12 / 3 * 45 % 7')).to.be.equal(((12 / 3) * 45) % 7);
        expect(parser.parse('12 / 3 % 45 * 7')).to.be.equal(((12 / 3) % 45) * 7);
        expect(parser.parse('12 % 3 * 45 / 7')).to.be.equal(((12 % 3) * 45) / 7);
        expect(parser.parse('12 % 3 / 45 * 7')).to.be.equal(((12 % 3) / 45) * 7);
    });
    it('should access property before adding or multiplying', () => {
        const options = {
            identifiers: {
                a: {a: [[5]]},
            },
        };
        expect(parser.parse('3 * a.a[0][0] + 5 * 10', options)).to.be.equal(65);
    });
});
describe('test complex expression', () => {
    it('should test complex expressions', () => {
        // noinspection ConstantConditionalExpressionJS
        expect(parser.parse('1 -  -(- true ? (32 * ((34 + 10) - + 10) & 32 | 78) : 24 ^  321    )')).to.be.equal(
            1 - -(-true ? ((32 * (34 + 10 - +10)) & 32) | 78 : 24 ^ 321),
        );
    });
});
