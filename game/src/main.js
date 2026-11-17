// main.js — boot, the frame loop, screen transitions, and canvas scaling.
window.RC = window.RC || {};

(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  function fit() {
    const scale = Math.min(window.innerWidth / RC.W, window.innerHeight / RC.H) * 0.98;
    canvas.style.width = Math.floor(RC.W * scale) + 'px';
    canvas.style.height = Math.floor(RC.H * scale) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  RC.input.attach(canvas);

  const params = new URLSearchParams(location.search);
  let world = RC.newWorld();
  const shot = params.get('shot');
  if (shot) {
    world = RC.shotScene(world, shot, parseInt(params.get('seed') || '1', 10) || 1);
    // render a few frames so particles and the flame settle, then hold still
    for (let i = 0; i < 14; i++) RC.update(world, 1 / 30);
    RC.render(ctx, world);
    requestAnimationFrame(function () { RC.render(ctx, world); });
    return;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (RC.input.takePress()) {
      RC.audio.unlock();
      if (world.state === 'title') RC.startRun(world);
      else if ((world.state === 'rug' || world.state === 'moon') && now - world.endStamp > 600) RC.startRun(world);
    }
    if ((world.state === 'rug' || world.state === 'moon') && !world.endStamp) world.endStamp = now;
    if (world.state === 'play') world.endStamp = 0;
    RC.update(world, dt);
    RC.render(ctx, world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
