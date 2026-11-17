// random.js — a tiny seeded RNG so screenshot scenes (?seed=) are deterministic,
// while normal play seeds from the clock.
window.RC = window.RC || {};

RC.makeRng = function (seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

RC.rng = RC.makeRng((Date.now() % 2147483647) + 1);
