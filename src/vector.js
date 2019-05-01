/*
 * GestureManager
 *
 * Copyright (c) 2019 Kazuyoshi Tomita
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export default class Vector {
  constructor(x, y) {
    if (typeof x == "undefined") {
      x = 0;
    }
    if (typeof y == "undefined") {
      y = 0;
    }

    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }
  get size() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  plus(vec) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  minus(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }

  scale(val) {
    this.x *= val;
    this.y *= val;
    return this;
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  normalize() {
    var size = this.size;
    this.x /= size;     // sizeのnot zero保証は呼出側で。
    this.y /= size;
    return this;
  }

  // ベクトルのx軸に対する角度(0-2*PI)を返す。
  // 時計回りを正方向とする。
  angle() {
    var vsize = this.size;

    if (vsize < 1)
      return 0;

    var cosTh = this.x / vsize;
    var rad = Math.acos(cosTh);

    // PI - 2*PI
    if (this.y < 0)
      rad = Math.PI + Math.PI - rad;

    return rad;
  }

  // radだけ回転させたベクトルを求める。
  // rPoint(Vector)を指定すると、その点を中心とした回転となる。
  rotate(rad, rPoint) {
    if (typeof rPoint == "undefined")
      rPoint = new Vector(0, 0);

    var cosTh = Math.cos(rad);
    var sinTh = Math.sin(rad);

    var x = this.x - rPoint.x;
    var y = this.y - rPoint.y;

    this.x = cosTh * x - sinTh * y + rPoint.x;
    this.y = sinTh * x + cosTh * y + rPoint.y;

    return this;
  }
}
