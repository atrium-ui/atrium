export function timer(start, time) {
  // 0 - 1
  return Math.min((Date.now() - start) / time, 1);
}

export const Ease = {
  easeInOutCirc(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  },
  easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  },
};

export function isTouch() {
  return !!navigator.maxTouchPoints || "ontouchstart" in window;
}
