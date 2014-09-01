/**
 * (c) 2014 Richard L. Apodaca
 * Licensed under MIT License.
 */

/**
 * An elliptic curve point.
 *
 * @param {string} x
 * @param {string} y
 */
var Point = function (x, y) {
  this.x = new BigInt(x, 16);
  this.y = new BigInt(y, 16);
};

/**
 * @param {Point} other
 * @return {boolean}
 */
Point.prototype.equals = function (other) {
  return this.x.equals(other.x) && this.y.equals(other.y);
};

/**
 * @return {string}
 */
Point.prototype.toString = function () {
  return '(' + this.x.toString(16) + ', ' + this.y.toString(16) + ')';
};

Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};