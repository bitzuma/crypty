/**
 * Based on bn.js
 * https://github.com/indutny/bn.js
 * (c) 2014 Fedor Indutny
 * Licensed under MIT License
 * 
 * Simplified and documented original source.
 *
 * (c) 2014 Richard L. Apodaca
 * Licensed under MIT License.
 */

/**
 * @constructor
 * @param {number|BigInt} number
 * @param {number} [base=10] 10 or 16
 */
var BigInt = function (number, base) {
  if (BigInt.isBigInt(number)) {
    return number;
  }

  this.sign = false;
  this.words = null;
  this.length = 0;

  if (number !== null) {
    this._init(number || 0, base || 10);
  }
};

/**
 * this + num
 *
 * @param {BigInt} num
 * @return {BigInt}
 */
BigInt.prototype.add = function (num) {
  if (num.sign && !this.sign) {
    num.sign = false;
    var res = this.sub(num);
    num.sign = true;
    
    return res;
  } else if (!num.sign && this.sign) {
    this.sign = false;
    var res = num.sub(this);
    this.sign = true;
    
    return res;
  }

  if (this.length > num.length)
    return this.clone().iadd(num);
  else
    return num.clone().iadd(this);
};

/**
 * this - num
 *
 * @param {BigInt} num
 * @reutrn {BigInt}
 */
BigInt.prototype.sub = function sub(num) {
  return this.clone()._isub(num);
};

/**
 * this * num
 * 
 * @param {BigInt} num
 * @return {BigInt}
 */
BigInt.prototype.mul = function (num) {
  var out = new BigInt(null);
  out.words = new Array(this.length + num.length);
  
  return this._mulTo(num, out);
};

/**
 * this / num
 * 
 * @param {BigInt} num
 * @return {BigInt}
 */
BigInt.prototype.div = function div(num) {
  return this.divmod(num, 'div').div;
};

/**
 * this * this
 *
 * @return {BigInt}
 */
BigInt.prototype.sqr = function sqr() {
  return this.mul(this);
};

/**
 * Modular division returning quotient and remainder
 *
 * @param {BigInt} num
 * @param {string} [mode] 'mod' or 'div'
 * @return {Object.<string, BigNum>}
 */
BigInt.prototype.divmod = function (num, mode) {
  BigInt.assert(num._cmpn(0) !== 0);

  if (this.sign && !num.sign) {
    var res = this._neg().divmod(num, mode);
    var div;
    var mod;
    if (mode !== 'mod')
      div = res.div._neg();
    if (mode !== 'div')
      mod = res.mod._cmpn(0) === 0 ? res.mod : num.sub(res.mod);
    return {
      div: div,
      mod: mod
    };
  } else if (!this.sign && num.sign) {
    var res = this.divmod(num._neg(), mode);
    var div;
    if (mode !== 'mod')
      div = res.div._neg();
    return { div: div, mod: res.mod };
  } else if (this.sign && num.sign) {
    return this._neg().divmod(num._neg(), mode);
  }

  // Both numbers are positive at this point

  // Strip both numbers to approximate shift value
  if (num.length > this.length || this.cmp(num) < 0)
    return { div: new BigInt(0), mod: this };

  // Very short reduction
  if (num.length === 1) {
    if (mode === 'div')
      return { div: this._divn(num.words[0]), mod: null };
    else if (mode === 'mod')
      return { div: null, mod: new BigInt(this._modn(num.words[0])) };
    return {
      div: this._divn(num.words[0]),
      mod: new BigInt(this._modn(num.words[0]))
    };
  }

  return this._wordDiv(num, mode);
};

/**
 * this % num
 *
 * @param {BigInt} num
 * @return {BigInt}
 */
BigInt.prototype.mod = function mod(num) {
  return this.divmod(num, 'mod').mod;
};

/**
 * 1 / this modulo num
 *
 * @param {num}
 * @return {BigInt}
 */
BigInt.prototype.invm = function invm(num) {
  return this._egcd(new BigInt(1), num).mod(num);
};

/**
 * @return {boolean}
 */
BigInt.prototype.isEven = function isEven() {
  return (this.words[0] & 1) === 0;
};

/**
 * @param {BigInt} other
 */
BigInt.prototype.equals = function (other) {
  return this.cmp(other) === 0;
};

/**
 * @return {BigInt}
 */
BigInt.prototype.clone = function () {
  var r = new BigInt(null);
  
  this._copy(r);
  
  return r;
};

/**
 * @param {BigInt} num
 * @return {num} 1 if this > num
 *               0 if this == num
 *               -1 if this < num
 */
BigInt.prototype.cmp = function (num) {
  if (this.sign && !num.sign)
    return -1;
  else if (!this.sign && num.sign)
    return 1;

  var res = this._ucmp(num);
  if (this.sign)
    return -res;
  else
    return res;
};

/**
 * @return {Array.<boolean>}
 */
BigInt.prototype.toBits = function () {
  var result = [ ];
  var number = this;
  
  while (number._cmpn(0) === 1) {
    var div = number.divmod(BigInt.TWO);
    var bit = div.mod;
    number = div.div;
    
    result.unshift(bit._cmpn(1) === 0);
  }
  
  return result;
};

/**
 * @param {number} [base=10]
 * @return {string}
 */
BigInt.prototype.toString = function (base) {
  base = base || 10;
  if (base === 16 || base === 'hex') {
    var out = '';
    var off = 0;
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = this.words[i];
      var word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      if (carry !== 0 || i !== this.length - 1)
        out = BigInt.zero6(word) + out;
      else
        out = word + out;
      off += 2;
      if (off >= 26) {
        off -= 26;
        i--;
      }
    }
    if (carry !== 0)
      out = carry.toString(16) + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else if (base === 10) {
    var out = '';
    var c = this.clone();
    c.sign = false;
    while (c._cmpn(0) !== 0) {
      var r = c._modn(1000000);
      c = c._idivn(1000000);

      if (c._cmpn(0) !== 0)
        out = BigInt.zero6(r + '') + out;
      else
        out = r + out;
    }
    if (this._cmpn(0) === 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else {
    assert(false, 'Only 16 and 10 base are supported');
  }
};

/**
 * @private
 */
BigInt.prototype._init = function (number, base) {
  if (typeof number === 'number') {
    if (number < 0) {
      this.sign = true;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [ number & 0x3ffffff ];
      this.length = 1;
    } else {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    }
    
    return;
  } else if (typeof number === 'object') {
    // Perhaps a Uint8Array
    BigInt.assert(typeof number.length === 'number');
    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++)
      this.words[i] = 0;
  
    // Assume big-endian
    var off = 0;
    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  
    return this._strip();
  }
  
  if (base === 'hex') {
    base = 16;
  }
    
  BigInt.assert(base <= 16);
  number = number.toString().replace(/\s+/g, '');
  
  var start = 0;
  
  if (number[0] === '-') {
    start++;
  }
  
  if (base === 16) {
    this._parseHex(number, start);
  } else {
    this._parseBase(number, base, start);
  }
  
  if (number[0] === '-') {
    this.sign = true;
  }
  
  this._strip();
};

/**
 * @private
 */
BigInt.prototype._parseHex = function (number, start) {
  // Create possibly bigger array to ensure that it fits the number
  this.length = Math.ceil((number.length - start) / 6);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  // Scan 24-bit chunks and add them to the number
  var off = 0;
  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
    var w = parseInt(number.slice(i, i + 6), 16);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    off += 24;
    if (off >= 26) {
      off -= 26;
      j++;
    }
  }
  if (i + 6 !== start) {
    var w = parseInt(number.slice(start, i + 6), 16);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
  }
  this._strip();
};

/**
 * @private
 */
BigInt.prototype._parseBase = function (number, base, start) {
  this.words = [ 0 ];
  this.length = 1;

  var word = 0;
  var q = 1;
  var p = 0;
  var bigQ = null;
  for (var i = start; i < number.length; i++) {
    var digit;
    var ch = number[i];
    if (base === 10 || ch <= '9')
      digit = ch | 0;
    else if (ch >= 'a')
      digit = ch.charCodeAt(0) - 97 + 10;
    else
      digit = ch.charCodeAt(0) - 65 + 10;
    word *= base;
    word += digit;
    q *= base;
    p++;

    if (q > 0xfffff) {
      BigInt.assert(q <= 0x3ffffff);
      if (!bigQ)
        bigQ = new BigInt(q);
      this.mul(bigQ)._copy(this);
      this.iadd(new BigInt(word));
      word = 0;
      q = 1;
      p = 0;
    }
  }
  if (p !== 0) {
    this.mul(new BigInt(q))._copy(this);
    this.iadd(new BigInt(word));
  }
};

/**
 * Multiply `this` by `num` and store data in out
 *
 * @param {BigInt} num
 * @param {BigInt} out
 * @return {BigInt}
 */
BigInt.prototype._mulTo = function (num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = carry >>> 26;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i];
      var b = num.words[j];
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry += (r / 0x4000000) | 0;
      lo += rword;
      rword = lo & 0x3ffffff;
      ncarry += lo >>> 26;
    }
    out.words[k] = rword;
    carry = ncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out._strip();
};

/**
 * in-place this + num
 *
 * @private
 * @param {BigInt} num
 * @return {BigInt}
 */
BigInt.prototype.iadd = function (num) {
  if (this.sign && !num.sign) {
    this.sign = false;
    var r = this._isub(num);
    this.sign = !this.sign;
    
    return this._normSign();
  } else if (!this.sign && num.sign) {
    num.sign = false;
    var r = this._isub(num);
    num.sign = true;
    
    return r._normSign();
  }

  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] + b.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }
  
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }

  this.length = a.length;
  
  if (carry !== 0) {
    this.words[this.length] = carry;
    this.length++;
  } else if (a !== this) {
    // Copy the rest of the words
    for (; i < a.length; i++) {
      this.words[i] = a.words[i];
    }
  }

  return this;
};

/**
 * in-place this - num
 *
 * @private
 * @param {BigInt} num
 * @return {BigInt}
 */
BigInt.prototype._isub = function (num) {
  // this - (-num) = this + num
  if (num.sign) {
    num.sign = false;
    var r = this.iadd(num);
    num.sign = true;
    return r._normSign();

  // -this - num = -(this + num)
  } else if (this.sign) {
    this.sign = false;
    this.iadd(num);
    this.sign = true;
    return this._normSign();
  }

  // At this point both numbers are positive
  var cmp = this.cmp(num);

  // Optimization - zeroify
  if (cmp === 0) {
    this.sign = false;
    this.length = 1;
    this.words[0] = 0;
    return this;
  }

  // a > b
  if (cmp > 0) {
    var a = this;
    var b = num;
  } else {
    var a = num;
    var b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] - b.words[i] - carry;
    if (r < 0) {
      r += 0x4000000;
      carry = 1;
    } else {
      carry = 0;
    }
    this.words[i] = r;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] - carry;
    if (r < 0) {
      r += 0x4000000;
      carry = 1;
    } else {
      carry = 0;
    }
    this.words[i] = r;
  }

  // Copy rest of the words
  if (carry === 0 && i < a.length && a !== this)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  this.length = Math.max(this.length, i);

  if (a !== this)
    this.sign = true;

  return this._strip();
};

/**
 * this - num
 *
 * @param {number} num
 * @return {BigInt}
 */
BigInt.prototype._isubn = function (num) {
  BigInt.assert(typeof num === 'number');
  BigInt.assert(this._cmpn(num) >= 0, 'Sign change is not supported in _isubn');
  
  if (num < 0)
    return this.iaddn(-num);
  this.words[0] -= num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
    this.words[i] += 0x4000000;
    this.words[i + 1] -= 1;
  }

  return this._strip();
};

/**
 * Shift-left
 * 
 * @private
 * @param {number} bits
 * @return {BigInt}
 */
BigInt.prototype._shln = function (bits) {
  return this.clone()._ishln(bits);
};

/**
 * Shift-left in-place
 *
 * @private
 * @param {number} bits
 * @return {BigInt}
 */
BigInt.prototype._ishln = function (bits) {
  BigInt.assert(typeof bits === 'number' && bits >= 0);
  
  var r = bits % 26;
  var s = (bits - r) / 26;
  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

  var o = this.clone();
  if (r !== 0) {
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var newCarry = this.words[i] & carryMask;
      var c = (this.words[i] - newCarry) << r;
      this.words[i] = c | carry;
      carry = newCarry >>> (26 - r);
    }
    if (carry) {
      this.words[i] = carry;
      this.length++;
    }
  }

  if (s !== 0) {
    for (var i = this.length - 1; i >= 0; i--)
      this.words[i + s] = this.words[i];
    for (var i = 0; i < s; i++)
      this.words[i] = 0;
    this.length += s;
  }

  return this._strip();
};

/**
 * this / num
 *
 * Drops remainder.
 *
 * @private
 * @param {number} num
 * @return {BigInt}
 */
BigInt.prototype._divn = function _divn(num) {
  return this.clone()._idivn(num);
};

/**
 * Shift-right in-place
 *
 * @private
 * @param {number} bits
 * @param {number} hint is a lowest bit before trailing zeroes
 * @param {boolean} extended if true - { lo: ..., hi: } object will be returned
 */
BigInt.prototype._ishrn = function (bits, hint, extended) {
  BigInt.assert(typeof bits === 'number' && bits >= 0);
  
  if (hint)
    hint = (hint - (hint % 26)) / 26;
  else
    hint = 0;

  var r = bits % 26;
  var s = Math.min((bits - r) / 26, this.length);
  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
  var maskedWords = extended;

  hint -= s;
  hint = Math.max(0, hint);

  // Extended mode, copy masked part
  if (maskedWords) {
    for (var i = 0; i < s; i++)
      maskedWords.words[i] = this.words[i];
    maskedWords.length = s;
  }

  if (s === 0) {
    // No-op, we should not move anything at all
  } else if (this.length > s) {
    this.length -= s;
    for (var i = 0; i < this.length; i++)
      this.words[i] = this.words[i + s];
  } else {
    this.words[0] = 0;
    this.length = 1;
  }

  var carry = 0;
  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= hint); i--) {
    var word = this.words[i];
    this.words[i] = (carry << (26 - r)) | (word >>> r);
    carry = word & mask;
  }

  // Push carried bits as a mask
  if (maskedWords && carry !== 0)
    maskedWords.words[maskedWords.length++] = carry;

  if (this.length === 0) {
    this.words[0] = 0;
    this.length = 1;
  }

  this._strip();
  if (extended)
    return { hi: this, lo: maskedWords };

  return this;
};

/**
 * @private
 */
BigInt.prototype._normSign = function () {
  // -0 = 0
  if (this.length === 1 && this.words[0] === 0) {
    this.sign = false;
  }
  
  return this;
};

/**
 * Return negative clone of `this`
 *
 * @private
 */
BigInt.prototype._neg = function () {
  if (this._cmpn(0) === 0)
    return this.clone();

  var r = this.clone();
  r.sign = !this.sign;
  return r;
};

/**
 * @private
 */
BigInt.prototype._egcd = function _egcd(x1, p) {
  BigInt.assert(!p.sign);
  BigInt.assert(p._cmpn(0) !== 0);

  var a = this;
  var b = p.clone();

  if (a.sign)
    a = a.mod(p);
  else
    a = a.clone();

  var x2 = new BigInt(0);
  while (a._cmpn(1) > 0 && b._cmpn(1) > 0) {
    while (a.isEven()) {
      a._ishrn(1);
      if (x1.isEven())
        x1._ishrn(1);
      else
        x1.iadd(p)._ishrn(1);
    }
    while (b.isEven()) {
      b._ishrn(1);
      if (x2.isEven())
        x2._ishrn(1);
      else
        x2.iadd(p)._ishrn(1);
    }
    if (a.cmp(b) >= 0) {
      a._isub(b);
      x1._isub(x2);
    } else {
      b._isub(a);
      x2._isub(x1);
    }
  }
  if (a._cmpn(1) === 0)
    return x1;
  else
    return x2;
};

/**
 * @private
 */
BigInt.prototype._wordDiv = function (num, mode) {
  var shift = this.length - num.length;

  var a = this.clone();
  var b = num;

  var q = mode !== 'mod' && new BigInt(0);
  var sign = false;

  // Approximate quotient at each step
  while (a.length > b.length) {
    // NOTE: a.length is always >= 2, because of the condition .div()
    var hi = a.words[a.length - 1] * 0x4000000 + a.words[a.length - 2];
    var sq = (hi / b.words[b.length - 1]);
    var sqhi = (sq / 0x4000000) | 0;
    var sqlo = sq & 0x3ffffff;
    sq = new BigInt(null);
    sq.words = [ sqlo, sqhi ];
    sq.length = 2;

    // Collect quotient
    var shift = (a.length - b.length - 1) * 26;
    if (q) {
      var t = sq._shln(shift);
      if (a.sign)
        q._isub(t);
      else
        q.iadd(t);
    }

    sq = sq.mul(b)._ishln(shift);
    if (a.sign)
      a.iadd(sq)
    else
      a._isub(sq);
  }
  // At this point a.length <= b.length
  while (a._ucmp(b) >= 0) {
    // NOTE: a.length is always >= 2, because of the condition above
    var hi = a.words[a.length - 1];
    var sq = new BigInt((hi / b.words[b.length - 1]) | 0);
    var shift = (a.length - b.length) * 26;

    if (q) {
      var t = sq._shln(shift);
      if (a.sign)
        q._isub(t);
      else
        q.iadd(t);
    }

    sq = sq.mul(b)._ishln(shift);

    if (a.sign)
      a.iadd(sq);
    else
      a._isub(sq);
  }

  if (a.sign) {
    if (q)
      q._isubn(1);
    a.iadd(b);
  }
  return { div: q ? q : null, mod: a };
};

/**
 * @private
 * @param {BigInt} dest
 */
BigInt.prototype._copy = function (dest) {
  dest.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    dest.words[i] = this.words[i];
  dest.length = this.length;
  dest.sign = this.sign;
  dest.red = this.red;
};

/**
 * Remove leading `0` from `this`
 *
 * @private
 * @return {BigInt}
 */
BigInt.prototype._strip = function () {
  while (this.length > 1 && this.words[this.length - 1] === 0) {
    this.length--;
  }
  
  return this._normSign();
};

/**
 * Unsigned comparison
 *
 * @private
 */
BigInt.prototype._ucmp = function (num) {
  // At this point both numbers have the same sign
  if (this.length > num.length)
    return 1;
  else if (this.length < num.length)
    return -1;

  var res = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var a = this.words[i];
    var b = num.words[i];

    if (a === b)
      continue;
    if (a < b)
      res = -1;
    else if (a > b)
      res = 1;
    break;
  }
  return res;
};

/**
 * @private
 * @param {number} num
 * @return {number}
 */
BigInt.prototype._cmpn = function (num) {
  var sign = num < 0;
  if (sign)
    num = -num;

  if (this.sign && !sign)
    return -1;
  else if (!this.sign && sign)
    return 1;

  num &= 0x3ffffff;
  this._strip();

  var res;
  if (this.length > 1) {
    res = 1;
  } else {
    var w = this.words[0];
    res = w === num ? 0 : w < num ? -1 : 1;
  }
  if (this.sign)
    res = -res;
  return res;
};

/**
 * @private
 * @param {number} num
 * @return num
 */
BigInt.prototype._modn = function (num) {
  BigInt.assert(num <= 0x3ffffff);
  
  var p = (1 << 26) % num;

  var acc = 0;
  for (var i = this.length - 1; i >= 0; i--)
    acc = (p * acc + this.words[i]) % num;

  return acc;
};

/**
 * In-place division by number
 *
 * @private
 * @param {number} num
 * @return {BigInt}
 */
BigInt.prototype._idivn = function (num) {
  BigInt.assert(num <= 0x3ffffff);

  var carry = 0;
  
  for (var i = this.length - 1; i >= 0; i--) {
    var w = this.words[i] + carry * 0x4000000;
    this.words[i] = (w / num) | 0;
    carry = w % num;
  }

  return this._strip();
};

/**
 * @param {object} object
 * @return {boolean}
 */
BigInt.isBigInt = function (object) {
  return object !== null &&
    typeof object === 'object' &&
    Array.isArray(object.words);
};

/**
 * @param {number} word
 * @return {string}
 */
BigInt.zero6 = function (word) {
  switch (word.length) {
    case 1:
      return '00000' + word;
    case 2:
      return '0000' + word;
    case 3:
      return '000' + word;
    case 4:
      return '00' + word;
    case 5:
      return '0' + word;
  }
  
  return word;
};

/**
 * @param {object} value
 * @param {string} [message='Assertion failed']
 */
BigInt.assert = function (value, message) {
  if (!value) {
    throw new Error(message || 'Assertion failed');
  }
};

BigInt.ZERO = new BigInt(0);
BigInt.ONE = new BigInt(1);
BigInt.TWO = new BigInt(2);
BigInt.THREE = new BigInt(3);