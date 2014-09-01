/**
 * (c) 2014 Richard L. Apodaca
 * Licensed under MIT License.
 */

/**
 * @constructor
 * @param {Curve.Params} params
 */
var Curve = function (params) {
  this._p = params.p;
  this._n = params.n;
};

/**
 * Elliptic curve point addition.
 * 
 * http://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_addition
 * 
 * @param {Point} point1
 * @param {Point} point2
 * @return {Point} the ECC sum of point1 and point2
 */
Curve.prototype.add = function (point1, point2) {
 var lambda = ((point2.y.sub(point1.y)).mul((point2.x.sub(point1.x)).invm(this._p)))
           ;
 var xr = lambda.sqr().sub(point1.x).sub(point2.x)
            .mod(this._p);
 var yr = lambda.mul(point1.x.sub(xr)).sub(point1.y)
            .mod(this._p);
 
 return new Point(xr, yr);
};

/**
 * Elliptic curve point doubling.
 * 
 * http://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_doubling
 * 
 * @param {Point} point
 * @return {Point} 2*point
 */
 Curve.prototype.double = function (point) {
   var lambdaNumerator = BigInt.THREE.mul(point.x.sqr());
   var lambdaDenominator = BigInt.TWO.mul(point.y);
   var lambda = lambdaNumerator.mul(lambdaDenominator.invm(this._p));
   
   var xr = lambda.sqr().sub(BigInt.TWO.mul(point.x))
              .mod(this._p);
   var yr = lambda.mul(point.x.sub(xr)).sub(point.y)
              .mod(this._p);
   
   return new Point(xr, yr);
 };

/**
 * Elliptic curve multiplication using double-and-add algorithm.
 *
 * http://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Double-and-add
 *
 * @param {BigInt} scalar
 * @param {Point} point
 * @return {Point} scalar*point
 */
Curve.prototype.multiply = function (scalar, point) {
  if (scalar.equals(BigInt.ZERO) || scalar.cmp(this._n) === 1) {
    throw Error('Scalar out of range');
  }
  
  var bits = scalar.toBits();
  var q = point.clone();
  
  for (var i = 1; i < bits.length; i++) {
    q = this.double(q);
    
    if (bits[i]) {
      q = this.add(q, point);
    }
  }
  
  return q;
};

Curve.Params = {
  secp256k1: {
    p: new BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F', 16),
    n: new BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 16),
    G: new Point(
      '79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
      '483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8'
    )
  }
}