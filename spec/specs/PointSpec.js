/**
 * (c) 2014 Richard L. Apodaca
 * Licensed under MIT License.
 */

describe('Point', function () {
  describe('constructor', function () {
    it('sets x', function () {
      var p = new Point('ff', '0');
      
      expect(p.x.cmp(new BigInt(0xff))).toEqual(0);
    });
    it('sets y', function () {
      var p = new Point('0', 'ff');
      
      expect(p.y.cmp(new BigInt(0xff))).toEqual(0);
    });
  });
  describe('#toString', function () {
    it('formats coordinate', function () {
      var p = new Point('aa', 'bb');
      
      expect(p.toString()).toEqual('(aa, bb)');
    });
  });
  describe('#equals', function () {
    it('returns false given two unequal points', function () {
      var p1 = new Point('aa', 'bb');
      var p2 = new Point('aa', 'ba');
      
      expect(p1.equals(p2)).toEqual(false);
    });
    it('returns true given two equal points', function () {
      var p1 = new Point('aa', 'bb');
      var p2 = new Point('aa', 'bb');
      
      expect(p1.equals(p2)).toEqual(true);
    });
  });
  describe('#clone', function () {
    it('returns a new point with identical coordinates', function () {
      var p = new Point('aa', 'bb');
      var clone = p.clone();
      
      expect(p.x.cmp(clone.x)).toEqual(0);
      expect(p.y.cmp(clone.y)).toEqual(0);
    });
  });
});