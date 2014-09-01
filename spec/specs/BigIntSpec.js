/**
 * (c) 2014 Richard L. Apodaca
 * Licensed under MIT License.
 */

describe('BigInt', function () {
  describe('constructor', function () {
    it('accepts decimal number with no base', function () {
      expect(new BigInt(12345).toString(16)).toEqual('3039');
    });
    it('accepts hex number with no base', function () {
      expect(new BigInt(0x4123456).toString(16)).toEqual('4123456');
    });
    it('accepts string input with no base', function () {
      expect(new BigInt('29048849665247').toString(16)).toEqual('1a6b765d8cdf');
    });
    it('accepts negative string input with no base', function () {
      expect(new BigInt('-29048849665247').toString(16)).toEqual('-1a6b765d8cdf');
    });
    it('accepts string input with base', function () {
      expect(new BigInt('1A6B765D8CDF', 16).toString(16)).toEqual('1a6b765d8cdf');
    });
    it('accepts string input with internal whitespace', function () {
      expect(new BigInt('a89c e5af8724 c0a23e0e 0ff77500', 16).toString(16)).toEqual('a89ce5af8724c0a23e0e0ff77500');
    });
    it('accepts really big string with base', function () {
      expect(new BigInt('123456789abcdef123456789abcdef123456789abcdef', 16).toString(16)).toEqual('123456789abcdef123456789abcdef123456789abcdef');
    });
    it('accepts big-endian BigInt with three bytes', function () {
      expect(new BigInt([1,2,3]).toString(16)).toEqual('10203');
    });
    it('accepts big-endian BigInt with four bytes', function () {
      expect(new BigInt([1,2,3,4]).toString(16)).toEqual('1020304');
    });
    it('accepts big-endian BigInt with five bytes', function () {
      expect(new BigInt([1,2,3,4,5]).toString(16)).toEqual('102030405');
    });
    it('accepts big-endian BigInt with eight bytes', function () {
      expect(new BigInt([1,2,3,4,5,6,7,8]).toString(16)).toEqual('102030405060708');
    });
  });
  describe('#add', function () {
    it('adds two numbers together', function () {
      expect(new BigInt(11).add(new BigInt(31)).toString()).toEqual('42');
    });
    it('adds three numbers together', function () {
      expect(new BigInt(14).add(new BigInt(26)).toString(16)).toEqual('28');
    });
    it('adds 257 numbers together in-place', function () {
      var k = new BigInt(0x1234);
      var r = k;
      
      for (var i = 0; i < 257; i++) {
        r = r.add(k);
      }
      
      expect(r.toString(16)).toEqual('125868');
    });
  });
  describe('#sub', function () {
    it('subtracts two number giving negative', function () {
      expect(new BigInt(14).sub(new BigInt(26)).toString(16)).toEqual('-c');
    });
    it('subtracts two numbers given positive', function () {
      expect(new BigInt(26).sub(new BigInt(14)).toString(16)).toEqual('c');
    });
    it('subtracts two numbers giving 0', function () {
      expect(new BigInt(42).sub(new BigInt(42)).toString()).toEqual('0');
    });
    it('subtracts two really big numbers', function () {
      var a = new BigInt(      '31ff3c61db2db84b9823d320907a573f6ad37c437abe458b1802cda041d6384a7d8daef41395491e2', 16);
      var b = new BigInt(      '6f0e4d9f1d6071c183677f601af9305721c91d31b0bbbae8fb790000',16);
      
      expect(a.sub(b).toString(16)).toEqual('31ff3c61db2db84b9823d3208989726578fd75276287cd9516533a9acfb9a6776281f34583ddb91e2');
    });
    it('carries and copies', function () {
      var a = new BigInt('12345', 16);
      var b = new BigInt('1000000000000', 16);
      
      expect(a.sub(b).toString(16)).toEqual('-fffffffedcbb');
    });
  });
  describe('#mul', function () {
    it('multiplies two positive numbers', function () {
      expect(new BigInt(0x1001).mul(new BigInt(0x1234)).toString(16)).toEqual('1235234');
    });
    it('multiplies a positive and negative number', function () {
      expect(new BigInt(-0x1001).mul(new BigInt(0x1234)).toString(16)).toEqual('-1235234');
    });
    it('multiplies two negative numbers', function () {
      expect(new BigInt(-0x1001).mul(new BigInt(-0x1234)).toString(16)).toEqual('1235234');
    });
    it('multiplies four numbers', function () {
      var n = new BigInt(0x1001);
      var r = n;
      
      for (var i = 0; i < 4; i++) {
        r = r.mul(n);
      }
      
      expect(r.toString(16)).toEqual('100500a00a005001');
    });
    it('multiplies two really big numbers', function () {
      var n = new BigInt('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      16);
      
      expect(n.mul(n).toString(16)).toEqual('39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40');
    });
  });
  describe('#div', function () {
    it('returns 0 given divisor greater than dividend', function () {
      expect(new BigInt(42).div(new BigInt(256)).toString(16)).toEqual('0');
    });
    it('returns quotient given divisor less than dividend', function () {
      expect(new BigInt('69527932928').div(new BigInt('16974594')).toString(16)).toEqual('fff');
    });
    it('returns negative quotient', function () {
      expect(new BigInt('-69527932928').div(new BigInt('16974594')).toString(16)).toEqual('-fff');
    });
    it('divides two really big numbers', function () {
      var b = new BigInt('39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40', 16);
    var n = new BigInt('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16);
    
    expect((b.div(n).toString(16))).toEqual(n.toString(16));
    });
    it('divides two really big numbers with long stretches of repeating digits', function () {
      var p = new BigInt('ffffffff00000001000000000000000000000000ffffffffffffffffffffffff', 16);
      var a = new BigInt('fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
      
      expect(a.div(p).toString(16)).toEqual('ffffffff00000002000000000000000000000001000000000000000000000001');
    });
    it('divides numbers with word division', function () {
      var p = new BigInt('ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f', 16);
      var a = new BigInt('79be667e f9dcbbac 55a06295 ce870b07 029bfcdb 2dce28d9 59f2815b 16f81798', 16);
      var as = a.sqr();
      
      expect(as.div(p).toString(16)).toEqual('39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729e58090b9');
    });
  });
  describe('#iadd', function () {
    it('adds 257 numbers together in-place', function () {
      var k = new BigInt('abcdefabcdefabcdef', 16);
      var r = new BigInt('deadbeef', 16);
      
      for (var i = 0; i < 257; i++) {
        r.iadd(k);
      }
      
      expect(r.toString(16)).toEqual('ac79bd9b79be7a277bde');
    });
  });
  describe('#mod', function () {
    it('mods two numbers', function () {
      expect(new BigInt('10').mod(new BigInt(256)).toString(16)).toEqual('a');
    });
    it('mods two large decimals', function () {
      expect(new BigInt('69527932928').mod(new BigInt('16974594')).toString(16)).toEqual('102f302');
    });
    it('mods two large decimals, one of which is negative', function () {
      expect(new BigInt('-69527932928').mod(new BigInt('16974594')).toString(16)).toEqual('1000');
    });
    it('mods two really big numbers in which there is no remainder', function () {
      var p = new BigInt('ffffffff00000001000000000000000000000000ffffffffffffffffffffffff', 16);
      var a = new BigInt('fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);
      
      expect(a.mod(p).toString(16)).toEqual('0');
    });
  });
  describe('#divmod', function () {
    it('returns div over large prime', function () {
      var a = new BigInt('ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff', 16);
      var p = new BigInt('ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f', 16);
      var divmod = a.divmod(p);
      
      expect(divmod.div.toString(16)).toEqual('1');
    });
    it('returns mod over large prime', function () {
      var a = new BigInt('ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff', 16);
      var p = new BigInt('ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f', 16);
      var divmod = a.divmod(p);
      
      expect(divmod.mod.toString(16)).toEqual('3d0');
    });
  });
  describe('#invm', function () {
    it('returns the mod inverse of two numbers', function () {
      var p = new BigInt(257);
      var a = new BigInt(3);
      var b = a.invm(p);
      
      expect(a.mul(b).mod(p).toString(16)).toEqual('1');
    });
    it('returns the mod inverse of p192', function () {
      var p192 = new BigInt('fffffffffffffffffffffffffffffffeffffffffffffffff', 16);
      var a = new BigInt('deadbeef', 16);
      var b = a.invm(p192);
      
      expect(a.mul(b).mod(p192).toString(16)).toEqual('1');
    });
  });
  describe('#cmp', function () {
    it('returns 0 given arg equal to number', function () {
      var a = new BigInt('deadbeef', 16);
      var b = new BigInt('deadbeef', 16);
      
      expect(a.cmp(b)).toEqual(0);
    });
    it('returns -1 given arg greater than number', function () {
      var a = new BigInt('deadbeef', 16);
      var b = new BigInt('deadbef0', 16);
      
      expect(a.cmp(b)).toEqual(-1);
    });
    it('returns 1 give arg less than number', function () {
      var a = new BigInt('deadbeef', 16);
      var b = new BigInt('deadbeee', 16);
      
      expect(a.cmp(b)).toEqual(1);
    });
  });
  describe('#toBits', function () {
    it('returns [] given 0', function () {
      var a = new BigInt(0);
      
      expect(a.toBits().join(',')).toEqual('');
    });
    it('returns bits given 1', function () {
      var a = new BigInt(1);
      
      expect(a.toBits()).toEqual([true]);
    });
    it('returns bits given 0xfe', function () {
      var a = new BigInt(0xfe);
      
      expect(a.toBits()).toEqual([
        true, true, true, true,
        true, true, true, false
      ]);
    });
  });
  describe('#equals', function () {
    it('returns true given equal values', function () {
      var a = new BigInt('abcdef', 16);
      var b = new BigInt('abcdef', 16);
      
      expect(a.equals(b)).toEqual(true);
    });
    it('returns false given unequal values', function () {
      var a = new BigInt('abcdef', 16);
      var b = new BigInt('abcdee', 16);
      
      expect(a.equals(b)).toEqual(false);
    });
  });
});