type VecOrNumber = Vec2 | number[] | number;

export class Vec2 extends Array {
  constructor(x: VecOrNumber = 0, y = 0) {
    super();

    if (Vec2.isVec(x)) {
      this[0] = x[0];
      this[1] = x[1];
    } else {
      this[0] = x;
      this[1] = y;
    }
  }

  get x() {
    return this[0];
  }

  set x(x: number) {
    this[0] = x;
  }

  get y() {
    return this[1];
  }

  set y(y: number) {
    this[1] = y;
  }

  get xy() {
    return [this[0], this[1]];
  }

  set xy(xy: number[]) {
    this[0] = xy[0];
    this[1] = xy[1];
  }

  add(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
      this[0] += vec[0];
      this[1] += vec[1];
    } else {
      this[0] += vec;
      this[1] += vec;
    }
    return this;
  }

  sub(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
      this[0] -= vec[0];
      this[1] -= vec[1];
    } else {
      this[0] -= vec;
      this[1] -= vec;
    }
    return this;
  }

  mul(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
      this[0] *= vec[0];
      this[1] *= vec[1];
    } else {
      this[0] *= vec;
      this[1] *= vec;
    }
    return this;
  }

  set(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
      this[0] = vec[0];
      this[1] = vec[1];
    } else {
      this[0] = vec;
      this[1] = vec;
    }
    return this;
  }

  mod(vec: VecOrNumber) {
    if (Vec2.isVec(vec)) {
      this[0] = this[0] % vec[0];
      this[1] = this[1] % vec[1];
    } else {
      this[0] = this[0] % vec;
      this[1] = this[1] % vec;
    }
    return this;
  }

  sign() {
    this[0] = Math.sign(this[0]);
    this[1] = Math.sign(this[1]);
    return this;
  }

  dist(vec: Vec2) {
    return Math.sqrt((vec[0] - this[0]) ** 2 + (vec[1] - this[1]) ** 2);
  }

  abs() {
    return Math.sqrt(this[0] ** 2 + this[1] ** 2);
  }

  abs2() {
    this[0] = Math.abs(this[0]);
    this[1] = Math.abs(this[1]);
    return this;
  }

  precision(precision: number) {
    this[0] = Math.floor(this[0] / precision) * precision;
    this[1] = Math.floor(this[1] / precision) * precision;
  }

  floor() {
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    return this;
  }

  clone() {
    return new Vec2(this);
  }

  isNaN() {
    return Number.isNaN(this[0]) || Number.isNaN(this[1]);
  }

  toString(): string {
    return `Vec{${this.join(",")}}`;
  }

  static add(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec2.isVec(vec1)) {
      return new Vec2(vec1[0], vec1[1]).add(vec2);
    }
    return new Vec2(vec1, vec1).add(vec2);
  }

  static sub(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec2.isVec(vec1)) {
      return new Vec2(vec1[0], vec1[1]).sub(vec2);
    }
    return new Vec2(vec1, vec1).sub(vec2);
  }

  static mul(vec1: VecOrNumber, vec2: VecOrNumber) {
    if (Vec2.isVec(vec1)) {
      return new Vec2(vec1[0], vec1[1]).mul(vec2);
    }
    return new Vec2(vec1, vec1).mul(vec2);
  }

  static abs(vec: Vec2) {
    return new Vec2(vec.x, vec.y).abs();
  }

  static dist2(vec1: Vec2, vec2: Vec2) {
    return new Vec2(vec1[0] - vec2[0], vec1[1] - vec2[1]);
  }

  static isVec = Array.isArray;
}
