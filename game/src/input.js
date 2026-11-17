// input.js — keyboard, mouse and touch steering, plus the "any key starts"
// signal the screens use. The pointer steers by target x; keys steer by velocity.
window.RC = window.RC || {};

RC.input = (function () {
  const keys = {};
  let pointerX = null;   // canvas-space x the pointer wants the rocket at
  let pointerDown = false;
  let pressed = false;   // set on any fresh press; main.js consumes it

  function toCanvasX(canvas, clientX) {
    const r = canvas.getBoundingClientRect();
    return (clientX - r.left) * (canvas.width / r.width);
  }

  function attach(canvas) {
    window.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].indexOf(e.key) >= 0) e.preventDefault();
      if (!e.repeat) pressed = true;
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'm') RC.audio.toggleMute();
    });
    window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });

    canvas.addEventListener('mousemove', function (e) { pointerX = toCanvasX(canvas, e.clientX); });
    canvas.addEventListener('mousedown', function (e) { pointerDown = true; pressed = true; pointerX = toCanvasX(canvas, e.clientX); RC.audio.unlock(); });
    window.addEventListener('mouseup', function () { pointerDown = false; });
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); pointerDown = true; pressed = true; pointerX = toCanvasX(canvas, e.touches[0].clientX); RC.audio.unlock(); }, { passive: false });
    canvas.addEventListener('touchmove', function (e) { e.preventDefault(); pointerX = toCanvasX(canvas, e.touches[0].clientX); }, { passive: false });
    canvas.addEventListener('touchend', function (e) { e.preventDefault(); pointerDown = false; }, { passive: false });
    canvas.addEventListener('click', function () { RC.audio.unlock(); });
  }

  return {
    attach: attach,
    axis: function () {
      let a = 0;
      if (keys['arrowleft'] || keys['a']) a -= 1;
      if (keys['arrowright'] || keys['d']) a += 1;
      return a;
    },
    pointerX: function () { return pointerX; },
    pointerActive: function () { return pointerDown || pointerX !== null; },
    takePress: function () { const p = pressed; pressed = false; return p; },
  };
})();
