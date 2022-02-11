import * as fs from 'fs';
import * as peg from 'peggy';
import * as path from 'path';
import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import {generateExpressionEvaluator} from '../src/index';

chai.use(chaiAsPromised);

const it = mocha.it;
const expect = chai.expect;
const describe = mocha.describe;

const grammar_abstraction = fs.readFileSync(path.join('src', 'grammars', 'abstraction.pegjs'));
const grammar_expression = fs.readFileSync(path.join('src', 'grammars', 'expression.pegjs'));
const grammar_unicode = fs.readFileSync(path.join('src', 'grammars', 'unicode.pegjs'));
const parser = peg.generate(`
    ${grammar_abstraction.toString()}
    ${grammar_expression.toString()}
    ${grammar_unicode.toString()}
`);
const parse_and_eval = generateExpressionEvaluator(parser);

describe('test literal', () => {
    it('should test arrays', async () => {
        expect(await parse_and_eval('[]')).to.be.deep.equal([]);
        expect(await parse_and_eval("[1, 2, 'false']")).to.be.deep.equal([1, 2, 'false']);
    });
    it('should test objects', async () => {
        expect(await parse_and_eval('{}')).to.be.deep.equal({});
        expect(await parse_and_eval("{a: 'a'}")).to.be.deep.equal({a: 'a'});
        expect(await parse_and_eval("{'a': 'a'}")).to.be.deep.equal({a: 'a'});
    });
    it('should test null', async () => {
        expect(await parse_and_eval('null')).to.be.equal(null);
    });
    it('should test numbers', async () => {
        expect(await parse_and_eval('0x123')).to.be.equal(0x123);
        expect(await parse_and_eval('0x123e10')).to.be.equal(0x123e10);
        expect(await parse_and_eval('0x123E10')).to.be.equal(0x123e10);

        expect(await parse_and_eval('0')).to.be.equal(0);
        expect(await parse_and_eval('00')).to.be.equal(0);
        expect(await parse_and_eval('100')).to.be.equal(100);
        expect(await parse_and_eval('100e10')).to.be.equal(100e10);
        expect(await parse_and_eval('100E10')).to.be.equal(100e10);

        expect(await parse_and_eval('0b0')).to.be.equal(0b0);
        expect(await parse_and_eval('0b111')).to.be.equal(0b111);
        expect(await parse_and_eval('0b0011')).to.be.equal(0b0011);

        expect(await parse_and_eval('0.0')).to.be.equal(0.0);
        expect(await parse_and_eval('0.1')).to.be.equal(0.1);
        expect(await parse_and_eval('.1')).to.be.equal(0.1);
        expect(await parse_and_eval('324.01')).to.be.equal(324.01);
        expect(await parse_and_eval('324.01e3')).to.be.equal(324.01e3);

        await expect(parse_and_eval('0b')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('0b2')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('0b1e3')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('..3')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('1.3.4')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('12e')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('12e0b1')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('12e0x1')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('0x23.5')).to.be.eventually.rejectedWith(Error);
    });
    it('should test strings', async () => {
        expect(await parse_and_eval('"superb string"')).to.be.equal('superb string');
        expect(await parse_and_eval("'superb string'")).to.be.equal('superb string');
        expect(await parse_and_eval('`superb string`')).to.be.equal('superb string');

        expect(await parse_and_eval('"superb \\"string\\""')).to.be.equal('superb "string"');
        expect(await parse_and_eval("'superb \\'string\\''")).to.be.equal("superb 'string'");
        expect(await parse_and_eval('`superb \\`string\\``')).to.be.equal('superb `string`');

        expect(await parse_and_eval('"superb string 🎃"')).to.be.equal('superb string 🎃');

        expect(await parse_and_eval(`"multiline\nstring\nis\ngolden"`)).to.be.equal('multiline\nstring\nis\ngolden');
        expect(await parse_and_eval(`'multiline\nstring\nis\ngolden'`)).to.be.equal('multiline\nstring\nis\ngolden');
        expect(await parse_and_eval('`multiline\nstring\nis\ngolden`')).to.be.equal('multiline\nstring\nis\ngolden');

        await expect(parse_and_eval(`"superb string'`)).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval(`"superb string`)).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval(`superb string"`)).to.be.eventually.rejectedWith(Error);
    });
    it('should test booleans', async () => {
        expect(await parse_and_eval('true')).to.be.equal(true);
        expect(await parse_and_eval('false')).to.be.equal(false);
    });
});
describe('test function', () => {
    it('should test basic functions', async () => {
        expect(async () => await parse_and_eval('Math_sin()')).to.not.throw();
        expect(async () => await parse_and_eval('Math_sin(32)')).to.not.throw();
        expect(async () => await parse_and_eval("Math_sin(32, 'hello')")).to.not.throw();
        expect(async () => await parse_and_eval("Math_sin(32, 'hello', false)")).to.not.throw();
        expect(async () => await parse_and_eval("Math_sin(32, 'hello', false, 34 >> (2))")).to.not.throw();

        await expect(parse_and_eval('Math_sin(,)')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('Math_sin(, 32)')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('Math_sin(32,)')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('Math_sin(32, )')).to.be.eventually.rejectedWith(Error);
    });
    it('should test default math functions', async () => {
        expect(await parse_and_eval('Math_pow(2, 6)')).to.be.equal(Math.pow(2, 6));
        expect(await parse_and_eval('Math_sin(32)')).to.be.equal(Math.sin(32));

        expect(await parse_and_eval('Math_unknown(32)')).to.be.equal(null);
    });
    it('should test default number functions', async () => {
        expect(await parse_and_eval('Number_isInteger(32)')).to.be.equal(true);
        expect(await parse_and_eval('Number_isInteger(32.5)')).to.be.equal(false);
        expect(await parse_and_eval("Number_parseFloat('34.8__hello')")).to.be.equal(Number.parseFloat('34.8__hello'));

        expect(await parse_and_eval('Number_unknown(32)')).to.be.equal(null);
    });
    it('should test default string functions', async () => {
        expect(await parse_and_eval('String_fromCharCode(65)')).to.be.equal('A');
        expect(await parse_and_eval('String_fromCodePoint(65, 66)')).to.be.equal('AB');

        expect(await parse_and_eval('String_unknown(65, 66, 67)')).to.be.equal(null);
    });
    it('should test default boolean functions', async () => {
        expect(await parse_and_eval('Boolean_unknown(false, true)')).to.be.equal(null);
    });
    it('should test default number prototype functions', async () => {
        expect(await parse_and_eval('number_toExponential(3)')).to.be.equal('3e+0');

        expect(await parse_and_eval('number_unknown(32)')).to.be.equal(null);
    });
    it('should test default string prototype functions', async () => {
        expect(await parse_and_eval("string_concat('hello ', 'dear ', 'love ', 'we ', 'missed ', 'you')")).to.be.equal('hello dear love we missed you');
        expect(await parse_and_eval("string_replace('hello dear friend', 'friend', 'love')")).to.be.equal('hello dear love');

        expect(await parse_and_eval('string_unknown(32)')).to.be.equal(null);
    });
    it('should test default string prototype functions', async () => {
        expect(await parse_and_eval('boolean_toString(true)')).to.be.equal('true');
        expect(await parse_and_eval('boolean_toString(false)')).to.be.equal('false');

        expect(await parse_and_eval('boolean_unknown(true)')).to.be.equal(null);
    });
    it('should test custom functions', async () => {
        // noinspection NonAsciiCharacters
        const options = {
            functions: {
                custom_double: (a: number) => a * 2,
                âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ: (a: number) => a * 3,
            },
        };
        expect(await parse_and_eval('custom_double(32)', options)).to.be.equal(64);
        expect(await parse_and_eval('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ(32)', options)).to.be.equal(96);

        expect(await parse_and_eval('   custom_double(32)  ', options)).to.be.equal(64);
        expect(await parse_and_eval('  âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ   (  32 )  ', options)).to.be.equal(96);

        await expect(parse_and_eval('9ufo(32)')).to.be.eventually.rejectedWith(Error);
    });
});
describe('test identifier', () => {
    it('should test basic identifiers', async () => {
        expect(await parse_and_eval('___$$$____')).to.be.equal(null);
        expect(await parse_and_eval('$line$')).to.be.equal(null);
        expect(await parse_and_eval('__dirname')).to.be.equal(null);
        expect(await parse_and_eval('koala')).to.be.equal(null);
        expect(await parse_and_eval('_ident900')).to.be.equal(null);
        expect(await parse_and_eval('trues')).to.be.equal(null);
        expect(await parse_and_eval('nulled')).to.be.equal(null);
        expect(await parse_and_eval('falsefalse')).to.be.equal(null);
        expect(await parse_and_eval('ffalse')).to.be.equal(null);
        expect(await parse_and_eval('accentué')).to.be.equal(null);
        expect(await parse_and_eval('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ_12__')).to.be.equal(null);
        expect(await parse_and_eval('_ä_ë__$$__k_')).to.be.equal(null);

        await expect(parse_and_eval('9var')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('9true')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('OR')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('AND')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('NOT')).to.be.eventually.rejectedWith(Error);
    });
    it('should test default math identifiers', async () => {
        expect(await parse_and_eval('Math_PI')).to.be.equal(Math.PI);
        expect(await parse_and_eval('Math_E')).to.be.equal(Math.E);
        expect(await parse_and_eval('Math_unknown')).to.be.equal(null);

        expect(await parse_and_eval('   Math_PI')).to.be.equal(Math.PI);
        expect(await parse_and_eval('       Math_E  ')).to.be.equal(Math.E);
        expect(await parse_and_eval('  Math_unknown')).to.be.equal(null);
    });
    it('should test default number identifiers', async () => {
        expect(await parse_and_eval('Number_MAX_SAFE_INTEGER')).to.be.equal(Number.MAX_SAFE_INTEGER);
        expect(await parse_and_eval('Number_NEGATIVE_INFINITY')).to.be.equal(Number.NEGATIVE_INFINITY);
        expect(await parse_and_eval('Number_POSITIVE_INFINITY')).to.be.equal(Number.POSITIVE_INFINITY);

        expect(await parse_and_eval('Number_unknown')).to.be.equal(null);
    });
    it('should test default string identifiers', async () => {
        expect(await parse_and_eval('String_unknown')).to.be.equal(null);
    });
    it('should test default boolean identifiers', async () => {
        expect(await parse_and_eval('Boolean_unknown')).to.be.equal(null);
    });
    it('should test custom identifiers', async () => {
        // noinspection NonAsciiCharacters
        const options = {
            identifiers: {
                custom_id: 0xdead,
                âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ: 0xdeaddead,
            },
        };
        expect(await parse_and_eval('custom_id', options)).to.be.equal(0xdead);
        expect(await parse_and_eval('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ', options)).to.be.equal(0xdeaddead);

        expect(await parse_and_eval(' custom_id  ', options)).to.be.equal(0xdead);
        expect(await parse_and_eval('   âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ    ', options)).to.be.equal(0xdeaddead);
    });
    it('should test synchronous function identifiers', async () => {
        // noinspection NonAsciiCharacters
        const options = {
            identifiers: (name: string) => {
                return (
                    {
                        custom_id: 0xdead,
                        âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ: 0xdeaddead,
                    } as any
                )[name];
            },
        };
        expect(await parse_and_eval('custom_id', options)).to.be.equal(0xdead);
        expect(await parse_and_eval('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ', options)).to.be.equal(0xdeaddead);

        expect(await parse_and_eval(' custom_id  ', options)).to.be.equal(0xdead);
        expect(await parse_and_eval('   âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ    ', options)).to.be.equal(0xdeaddead);
    });
    it('should test asynchronous function identifiers', async () => {
        // noinspection NonAsciiCharacters
        const wait = () => new Promise(resolve => setTimeout(resolve, 10));
        const options = {
            identifiers: async (name: string) => {
                await wait();
                return (
                    {
                        custom_id: 0xdead,
                        âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ: 0xdeaddead,
                    } as any
                )[name];
            },
        };
        expect(await parse_and_eval('custom_id', options)).to.be.equal(0xdead);
        expect(await parse_and_eval('âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ', options)).to.be.equal(0xdeaddead);

        expect(await parse_and_eval(' custom_id  ', options)).to.be.equal(0xdead);
        expect(await parse_and_eval('   âäêëîïôöûüÂÄÊËÎÏÔÖÛÜ    ', options)).to.be.equal(0xdeaddead);
    });
    it('should test identifiers in accessors', async () => {
        // noinspection NonAsciiCharacters
        const options = {
            identifiers: {
                x: 1,
                y: 2,
                name: 'Jonathan',
            },
        };
        expect(await parse_and_eval('[[1, 2, 3], [4, 5, 6], [7, 8, 9]][y][x]', options)).to.be.equal(8);
        expect(await parse_and_eval('([[1, 2, 3], [4, 5, 6], [7, 8, 9]][y])[x]', options)).to.be.equal(8);
        expect(await parse_and_eval('{"Jonathan": {age: 32}, "Vincent": {age: 42}}[name].age', options)).to.be.eq(32);
        expect(await parse_and_eval('({"Jonathan": {age: 32}, "Vincent": {age: 42}}[name]).age', options)).to.be.eq(32);
    });
    it('should test an equality expression with a function and an identifier', async () => {
        // noinspection NonAsciiCharacters
        const options = {
            identifiers: {
                my_text: '   yes   ',
                my_text2: '  SeaRch ',
            },
        };
        expect(await parse_and_eval('string_trim(my_text)', options)).to.be.equal('yes');
        expect(await parse_and_eval('"search" === string_trim(string_toLowerCase(my_text2))', options)).to.be.equal(true);
    });
});
describe('test identifier order', () => {
    it('should test basic identifier order', async () => {
        const options = {identifiers_order: []};
        await parse_and_eval('my + story + is + interesting', options);
        expect([...options.identifiers_order]).to.be.deep.equal(['my', 'story', 'is', 'interesting']);
    });
    it('should test identifier order with pre-existing identifiers', async () => {
        const options = {identifiers_order: []};
        await parse_and_eval('my + story + Math_PI + is + interesting', options);
        expect([...options.identifiers_order]).to.be.deep.equal(['my', 'story', 'is', 'interesting']);
    });
    it('should test identifier order with pre-existing identifiers and functions', async () => {
        const options = {identifiers_order: []};
        await parse_and_eval('my + story + Math_PI + is + Math_sin(32) + interesting', options);
        expect([...options.identifiers_order]).to.be.deep.equal(['my', 'story', 'is', 'interesting']);
    });
});
describe('test expression', () => {
    it('should test unary expressions', async () => {
        expect(await parse_and_eval('-10')).to.be.equal(-10);
        expect(await parse_and_eval('+10')).to.be.equal(+10);
        expect(await parse_and_eval('-+-+100')).to.be.equal(-+-+100);
        expect(await parse_and_eval('+-+100')).to.be.equal(+-+100);

        expect(await parse_and_eval('!10')).to.be.equal(!10);
        expect(await parse_and_eval('NOT10')).to.be.equal(!10);
        expect(await parse_and_eval('NOT 10')).to.be.equal(!10);
        expect(await parse_and_eval('!-+10')).to.be.equal(!-+10);
        expect(await parse_and_eval('NOT-+10')).to.be.equal(!-+10);
        expect(await parse_and_eval('NOT -+10')).to.be.equal(!-+10);
        expect(await parse_and_eval('!true')).to.be.equal(!true);
        expect(await parse_and_eval('NOTtrue')).to.be.equal(!true);
        expect(await parse_and_eval('NOT true')).to.be.equal(!true);
        expect(await parse_and_eval('!!!!!false')).to.be.equal(!!!!!false);
        expect(await parse_and_eval('NOTNOTNOTNOTNOTfalse')).to.be.equal(!!!!!false);
        expect(await parse_and_eval('NOTNOTNOTNOTNOT false')).to.be.equal(!!!!!false);
        expect(await parse_and_eval('NOT NOTNOTNOT NOT false')).to.be.equal(!!!!!false);
        expect(await parse_and_eval('NOT NOT NOT NOT NOTfalse')).to.be.equal(!!!!!false);
        expect(await parse_and_eval('NOT NOT NOT NOT NOT false')).to.be.equal(!!!!!false);

        expect(await parse_and_eval('~10')).to.be.equal(~10);
        expect(await parse_and_eval('~100')).to.be.equal(~100);
        expect(await parse_and_eval('~-+100')).to.be.equal(~-+100);

        await expect(parse_and_eval('--10')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('++10')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('+++10')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('false NOT')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('false + NOT')).to.be.eventually.rejectedWith(Error);
    });
    it('should test exponentiation expressions', async () => {
        expect(await parse_and_eval('2 ** 6')).to.be.equal(2 ** 6);
    });
    it('should test multiplication expressions', async () => {
        expect(await parse_and_eval('10 * 12')).to.be.equal(10 * 12);
        expect(await parse_and_eval('10 / 12')).to.be.equal(10 / 12);
        expect(await parse_and_eval('10 % 12')).to.be.equal(10 % 12);
        expect(await parse_and_eval('10.0000 % 12.0000')).to.be.equal(10.0 % 12.0);

        await expect(parse_and_eval('10 *** 12')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('10 // 12')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('10 %% 12')).to.be.eventually.rejectedWith(Error);
    });
    it('should test addition expressions', async () => {
        expect(await parse_and_eval('10 + 12')).to.be.equal(10 + 12);
        expect(await parse_and_eval('10 - 12')).to.be.equal(10 - 12);
        expect(await parse_and_eval('0x10 + 0x12')).to.be.equal(0x10 + 0x12);
        expect(await parse_and_eval('0x10 - 0x12')).to.be.equal(0x10 - 0x12);

        await expect(parse_and_eval('0x10 ++ 0x12')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('0x10 -- 0x12')).to.be.eventually.rejectedWith(Error);
    });
    it('should test shift expressions', async () => {
        expect(await parse_and_eval('10 << 10')).to.be.equal(10 << 10);
        expect(await parse_and_eval('10 >>> 10')).to.be.equal(10 >>> 10);
        expect(await parse_and_eval('10 >> 10')).to.be.equal(10 >> 10);

        await expect(parse_and_eval('10 <<< 10')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('10 <> 10')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('10 >>>> 10')).to.be.eventually.rejectedWith(Error);
    });
    it('should test relation expressions', async () => {
        expect(await parse_and_eval('true > false')).to.be.equal(true > false);
        expect(await parse_and_eval('10 > 10')).to.be.equal(10 > 10);
        // @ts-ignore
        expect(await parse_and_eval("'test' > 10")).to.be.equal('test' > 10);

        expect(await parse_and_eval('10 >= 10')).to.be.equal(10 >= 10);
        expect(await parse_and_eval("'length' >= 'length'")).to.be.equal('length' >= 'length');

        expect(await parse_and_eval('10 < 10')).to.be.equal(10 < 10);
        // @ts-ignore
        expect(await parse_and_eval('10 < false')).to.be.equal(10 < false);

        expect(await parse_and_eval('10 <= 10')).to.be.equal(10 <= 10);
        expect(await parse_and_eval('10 <= 0x10')).to.be.equal(10 <= 0x10);
    });
    it('should test bitwise expressions', async () => {
        expect(await parse_and_eval('0x0011 & 0x0111')).to.be.equal(0x0011 & 0x0111);
        expect(await parse_and_eval('0x0011 ^ 0x0111')).to.be.equal(0x0011 ^ 0x0111);
        expect(await parse_and_eval('0x0011 | 0x0111')).to.be.equal(0x0011 | 0x0111);

        expect(await parse_and_eval('0b0011 & 0b1100')).to.be.equal(0b0011 & 0b1100);
        expect(await parse_and_eval('0b0011 | 0b1100')).to.be.equal(0b0011 | 0b1100);

        await expect(parse_and_eval('10 ^^ 10')).to.be.eventually.rejectedWith(Error);
    });
    it('should test logical expressions', async () => {
        expect(await parse_and_eval('128 && false')).to.be.equal(128 && false);
        expect(await parse_and_eval("'true' || 'false'")).to.be.equal('true' || 'false');

        expect(await parse_and_eval('128 AND false')).to.be.equal(128 && false);
        expect(await parse_and_eval("'true' OR 'false'")).to.be.equal('true' || 'false');

        await expect(parse_and_eval('10 &&& 10')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('10 ||| 10')).to.be.eventually.rejectedWith(Error);

        await expect(parse_and_eval('10 + AND')).to.be.eventually.rejectedWith(Error);
        await expect(parse_and_eval('10 + OR')).to.be.eventually.rejectedWith(Error);
    });
    it('should test conditional expressions', async () => {
        expect(await parse_and_eval("123 ? 'false' : 12")).to.be.equal(123 ? 'false' : 12);
        expect(await parse_and_eval("123? 'false' :12")).to.be.equal(123 ? 'false' : 12);
        expect(await parse_and_eval('1 ? 0 ? 1 : 2 : 0x43')).to.be.equal(1 ? (0 ? 1 : 2) : 0x43);
        expect(await parse_and_eval("6 > 5 ? 'him' : 'me'")).to.be.equal(6 > 5 ? 'him' : 'me');

        expect(await parse_and_eval('19 ?: 10')).to.be.equal(19);
        expect(await parse_and_eval('0 ?: 10')).to.be.equal(10);

        expect(await parse_and_eval('0 ? 12 : 10 ?: false')).to.be.equal(10);

        await expect(parse_and_eval('0 ? : false')).to.be.eventually.rejectedWith(Error);
    });
    it('should test nested conditional expressions', async () => {
        const options = {
            identifiers: {
                a: 1,
                b: 0,
            },
        };
        expect(await parse_and_eval("a ? (b ? 32 : (64 > 2) ? 'success' : 'failure') : 128", options)).to.be.equal('success');
        expect(await parse_and_eval("a ? b ? 32 : 64 > 2 ? 'success' : 'failure' : 128", options)).to.be.equal('success');
    });
    it('should test expressions with math and custom identifiers', async () => {
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
        expect(await parse_and_eval('number + 10', options)).to.be.equal(52);
        expect(await parse_and_eval('10 + number', options)).to.be.equal(52);
        expect(await parse_and_eval('number > 10 ? 10 : 20', options)).to.be.equal(10);
        expect(await parse_and_eval('number < 10 ? 10 : 20', options)).to.be.equal(20);
        expect(await parse_and_eval('10 < number ? 10 : 20', options)).to.be.equal(10);
        expect(await parse_and_eval('10 > number ? 10 : 20', options)).to.be.equal(20);
        expect(await parse_and_eval('number > 10 ? 10 + number : 20 + number', options)).to.be.equal(52);
        expect(await parse_and_eval('number < 10 ? 10 + number : 20 + number', options)).to.be.equal(62);
        expect(await parse_and_eval('number > 10 ? number + 10 : number + 20', options)).to.be.equal(52);
        expect(await parse_and_eval('number < 10 ? number + 10 : number + 20', options)).to.be.equal(62);
        expect(await parse_and_eval('number / Math_PI * 5', options)).to.be.equal((42 / Math.PI) * 5);
        expect(await parse_and_eval('Math_PI / number * 5', options)).to.be.equal((Math.PI / 42) * 5);
        expect(await parse_and_eval('a > b ? d + e + f > 0 : a + b + 1', options)).to.be.equal(4);
        expect(await parse_and_eval('(a > b) ? (d + e + f > 0) : (a + b + 1)', options)).to.be.equal(4);
    });
    it('should test conditional expressions and identifier lazy resolution', async () => {
        const options = {
            identifiers: (name: string) => {
                if (name.startsWith('invalid_')) {
                    throw new Error('Cannot get invalid property');
                }
                return (
                    {
                        value1a: 12,
                        value2a: 0,
                        valid_id: 42,
                        invalid_id: 0xdead,
                        valid_id_obj: {test: 32},
                        invalid_id_obj: {test: 0xdead},
                    } as any
                )[name];
            },
        };

        expect(await parse_and_eval('value1a != 0', options)).to.be.equal(true);
        expect(await parse_and_eval('value2a != 0', options)).to.be.equal(false);

        expect(await parse_and_eval('value1a !== 0', options)).to.be.equal(true);
        expect(await parse_and_eval('value2a !== 0', options)).to.be.equal(false);

        expect(await parse_and_eval('valid_id', options)).to.be.equal(42);
        await expect(parse_and_eval('invalid_id', options)).to.be.eventually.rejectedWith(Error);
        expect(await parse_and_eval('true ? valid_id : invalid_id', options)).to.be.equal(42);
        await expect(parse_and_eval('true ? invalid_id : valid_id', options)).to.be.eventually.rejectedWith(Error);
        expect(await parse_and_eval('true ? valid_id + 10 : invalid_id - 10', options)).to.be.equal(52);
        await expect(parse_and_eval('false ? valid_id + 10 : invalid_id - 10', options)).to.be.eventually.rejectedWith(Error);
        expect(await parse_and_eval('valid_id_obj.test', options)).to.be.equal(32);
        await expect(parse_and_eval('invalid_id_obj.test', options)).to.be.eventually.rejectedWith(Error);
        expect(await parse_and_eval('valid_id_obj.test === 32 ? valid_id_obj.test + 10 : invalid_id_obj.test + 10', options)).to.equal(42);
        await expect(parse_and_eval('valid_id_obj.test !== 32 ? valid_id_obj.test + 10 : invalid_id_obj.test + 10', options)).to.be.eventually.rejectedWith(
            Error,
        );
        expect(await parse_and_eval('valid_id_obj.test === 32 ? 10 + valid_id_obj.test : 10 + invalid_id_obj.test', options)).to.equal(42);
        await expect(parse_and_eval('valid_id_obj.test !== 32 ? 10 + valid_id_obj.test : 10 + invalid_id_obj.test', options)).to.be.eventually.rejectedWith(
            Error,
        );
    });
    it('should test property accessors', async () => {
        const options = {
            identifiers: {
                a: [1, 2, 3],
                b: {
                    inner: [1, {sub: 'yes'}, 3],
                },
                c: [
                    [],
                    [
                        [20, 40],
                        [20, {sub: 42}],
                    ],
                    {},
                ],
            },
        };
        expect(await parse_and_eval('a[2]', options)).to.be.equal(3);
        expect(await parse_and_eval('b.inner[0]', options)).to.be.equal(1);
        expect(await parse_and_eval("b['inner'][0]", options)).to.be.equal(1);
        expect(await parse_and_eval("b['inner'][1].sub", options)).to.be.equal('yes');
        expect(await parse_and_eval('c[1][1][1].sub', options)).to.be.equal(42);

        expect(await parse_and_eval('[{o: [[true]]}][0].o[0][0]', options)).to.be.equal(true);
    });
});
describe('test expression precedence', () => {
    it('should multiply before adding', async () => {
        expect(await parse_and_eval('2 + 4 * 10')).to.be.equal(2 + 4 * 10);
        expect(await parse_and_eval('2 + 4 / 10')).to.be.equal(2 + 4 / 10);
        expect(await parse_and_eval('2 + 4 % 10')).to.be.equal(2 + (4 % 10));
    });
    it('should add before multiply', async () => {
        expect(await parse_and_eval('(2 + 4) * 10')).to.be.equal((2 + 4) * 10);
        expect(await parse_and_eval('(2 + 4) / 10')).to.be.equal((2 + 4) / 10);
        expect(await parse_and_eval('(2 + 4) % 10')).to.be.equal((2 + 4) % 10);
    });
    it('should test bitwise and logical precedence', async () => {
        expect(await parse_and_eval('12 | 43 & 36')).to.be.equal(12 | (43 & 36));
        expect(await parse_and_eval('12 || 43 && 36')).to.be.equal(12 || (43 && 36));
    });
    it('should follow natural order between same precedence', async () => {
        expect(await parse_and_eval('12 * 3 / 45 % 7')).to.be.equal(((12 * 3) / 45) % 7);
        expect(await parse_and_eval('12 * 3 % 45 / 7')).to.be.equal(((12 * 3) % 45) / 7);
        expect(await parse_and_eval('12 / 3 * 45 % 7')).to.be.equal(((12 / 3) * 45) % 7);
        expect(await parse_and_eval('12 / 3 % 45 * 7')).to.be.equal(((12 / 3) % 45) * 7);
        expect(await parse_and_eval('12 % 3 * 45 / 7')).to.be.equal(((12 % 3) * 45) / 7);
        expect(await parse_and_eval('12 % 3 / 45 * 7')).to.be.equal(((12 % 3) / 45) * 7);
    });
    it('should access property before adding or multiplying', async () => {
        const options = {
            identifiers: {
                a: {a: [[5]]},
            },
        };
        expect(await parse_and_eval('3 * a.a[0][0] + 5 * 10', options)).to.be.equal(65);
    });
});
describe('test complex expression', () => {
    it('should test complex expressions', async () => {
        // noinspection ConstantConditionalExpressionJS
        expect(await parse_and_eval('1 -  -(- true ? (32 * ((34 + 10) - + 10) & 32 | 78) : 24 ^  321    )')).to.be.equal(
            1 - -(-true ? ((32 * (34 + 10 - +10)) & 32) | 78 : 24 ^ 321),
        );
    });
});
describe('test literal expression', () => {
    it('should test an object literal with an expression value', async () => {
        expect(await parse_and_eval('{value: {value: -2 + 1}.value + 3}')).to.be.deep.equal({value: 2});
    });
    it('should test an array literal with expression values', async () => {
        expect(await parse_and_eval('[1 + 1, 2 + 2, 8, {}, [1, 2, 3, 4].length * 4]')).to.be.deep.equal([2, 4, 8, {}, 16]);
    });
});
