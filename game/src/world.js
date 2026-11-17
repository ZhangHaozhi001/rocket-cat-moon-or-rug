// world.js — the simulation: the rocket, falling pickups and hazards, particles,
// collisions, combo scoring, shields, and the 60-second climb to the moon.
window.RC = window.RC || {};

RC.HIGH_KEY = 'rocket-cat-high-score';

RC.loadHigh = function () {
  try { return parseInt(localStorage.getItem(RC.HIGH_KEY) || '0', 10) || 0; } catch (e) { return 0; }
};
RC.saveHigh = function (v) {
  try { localStorage.setItem(RC.HIGH_KEY, String(v)); } catch (e) { /* private mode */ }
};

RC.newWorld = function () {
  const stars = [];
  for (let i = 0; i < 110; i++) {
    stars.push({ x: RC.rng() * RC.W, y: RC.rng() * RC.H, r: 0.6 + RC.rng() * 1.7, tw: RC.rng() * 6.28 });
  }
  return {
    state: 'title',           // title | play | rug | moon
    time: 0,                  // seconds survived this run
    score: 0,
    high: RC.loadHigh(),
    combo: 0,
    multiplier: 1,
    shields: RC.START_SHIELDS,
    playerX: RC.W / 2,
    tilt: 0,
    invulnUntil: -1,
    shake: 0,
    flash: 0,                 // red damage flash, 1 -> 0
    spawnIn: 0.4,
    items: [],                // {kind: coin|pump|red|rug, x, y, vy, spin}
    particles: [],            // {x, y, vx, vy, life, maxLife, color, size}
    floaters: [],             // {x, y, text, life, color}
    stars: stars,
    moonY: -140,              // the moon slides in during the last seconds
    endAt: 0,                 // when the run ended (for end-screen timing)
  };
};

RC.fallSpeed = function (w) {
  const t = Math.min(w.time / RC.RUN_SECONDS, 1);
  return RC.BASE_FALL + (RC.MAX_FALL - RC.BASE_FALL) * t;
};

RC.spawnItem = function (w) {
  const roll = RC.rng();
  let kind = 'coin';
  if (roll > 0.90) kind = 'rug';
  else if (roll > 0.74) kind = 'red';
  else if (roll > 0.62) kind = 'pump';
  const size = kind === 'rug' ? 46 : kind === 'coin' ? 30 : 26;
  w.items.push({
    kind: kind,
    x: 30 + RC.rng() * (RC.W - 60),
    y: -40,
    vy: RC.fallSpeed(w) * (0.9 + RC.rng() * 0.3),
    size: size,
    spin: RC.rng() * 6.28,
  });
  // spawns get denser as the climb speeds up
  w.spawnIn = Math.max(0.24, 0.62 - w.time * 0.006) * (0.6 + RC.rng() * 0.7);
};

RC.burst = function (w, x, y, color, n, speed) {
  for (let i = 0; i < n; i++) {
    const a = RC.rng() * 6.283, v = (0.3 + RC.rng() * 0.7) * speed;
    w.particles.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0, maxLife: 0.45 + RC.rng() * 0.4, color: color, size: 2 + RC.rng() * 3 });
  }
};

RC.floater = function (w, x, y, text, color) {
  w.floaters.push({ x: x, y: y, text: text, life: 0, color: color });
};

RC.endRun = function (w, won) {
  w.state = won ? 'moon' : 'rug';
  w.endAt = w.time;
  if (w.score > w.high) { w.high = w.score; RC.saveHigh(w.high); }
  if (won) { RC.audio.moon(); RC.burst(w, w.playerX, RC.PLAYER_Y - 30, '#ffd94d', 42, 260); }
  else { RC.audio.rug(); w.shake = 14; RC.burst(w, w.playerX, RC.PLAYER_Y, '#ff5470', 36, 240); }
};

RC.hitPlayer = function (w, item) {
  w.shields -= 1;
  w.combo = 0; w.multiplier = 1;
  w.shake = 11; w.flash = 1;
  w.invulnUntil = w.time + 1.1;
  RC.audio.hit();
  RC.burst(w, w.playerX, RC.PLAYER_Y, item.kind === 'rug' ? '#b06ee8' : '#ff5470', 22, 210);
  RC.floater(w, w.playerX, RC.PLAYER_Y - 56, item.kind === 'rug' ? 'RUGGED!' : 'REKT!', '#ff8296');
  if (w.shields <= 0) RC.endRun(w, false);
};

RC.collect = function (w, item) {
  w.combo += 1;
  w.multiplier = 1 + Math.floor(w.combo / RC.COMBO_STEP);
  const base = item.kind === 'pump' ? RC.CANDLE_SCORE : RC.COIN_SCORE;
  const gained = base * w.multiplier;
  w.score += gained;
  if (item.kind === 'pump') { RC.audio.pump(); RC.burst(w, item.x, item.y, '#2fe08a', 14, 170); }
  else { RC.audio.coin(w.combo); RC.burst(w, item.x, item.y, '#ffd94d', 10, 150); }
  RC.floater(w, item.x, item.y - 14, '+' + gained, item.kind === 'pump' ? '#2fe08a' : '#ffd94d');
};

RC.startRun = function (w) {
  const high = w.high;
  const stars = w.stars;
  const fresh = RC.newWorld();
  Object.keys(fresh).forEach(function (k) { w[k] = fresh[k]; });
  w.high = high; w.stars = stars;
  w.state = 'play';
  RC.audio.launch();
};

RC.update = function (w, dt) {
  // starfield always drifts, faster while playing
  const drift = (w.state === 'play' ? RC.fallSpeed(w) * 0.55 : 26) * dt;
  for (const s of w.stars) { s.y += drift * (0.4 + s.r); if (s.y > RC.H + 2) { s.y = -2; s.x = RC.rng() * RC.W; } }

  for (let i = w.particles.length - 1; i >= 0; i--) {
    const p = w.particles[i]; p.life += dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt;
    if (p.life >= p.maxLife) w.particles.splice(i, 1);
  }
  for (let i = w.floaters.length - 1; i >= 0; i--) {
    const f = w.floaters[i]; f.life += dt; f.y -= 44 * dt;
    if (f.life > 0.9) w.floaters.splice(i, 1);
  }
  w.shake = Math.max(0, w.shake - dt * 26);
  w.flash = Math.max(0, w.flash - dt * 2.4);

  if (w.state !== 'play') return;

  w.time += dt;
  if (w.time >= RC.RUN_SECONDS) { RC.endRun(w, true); return; }
  if (w.time > RC.RUN_SECONDS - 6) w.moonY = Math.min(64, w.moonY + dt * 42);

  // steering: keys give velocity, pointer gives a target to chase
  const axis = RC.input.axis();
  if (axis !== 0) w.playerX += axis * RC.PLAYER_SPEED * dt;
  const px = RC.input.pointerX();
  if (px !== null && axis === 0) {
    const dx = px - w.playerX;
    w.playerX += Math.max(-RC.PLAYER_SPEED * 1.7 * dt, Math.min(RC.PLAYER_SPEED * 1.7 * dt, dx));
  }
  w.playerX = Math.max(34, Math.min(RC.W - 34, w.playerX));
  w.tilt = Math.max(-0.35, Math.min(0.35, (axis * 0.3) + (px !== null && axis === 0 ? (px - w.playerX) * 0.001 : 0)));

  w.spawnIn -= dt;
  if (w.spawnIn <= 0) RC.spawnItem(w);

  for (let i = w.items.length - 1; i >= 0; i--) {
    const it = w.items[i];
    it.y += it.vy * dt;
    it.spin += dt * 2;
    if (it.y > RC.H + 50) { w.items.splice(i, 1); continue; }
    const dx = it.x - w.playerX, dy = it.y - RC.PLAYER_Y;
    const rr = it.size * 0.62 + 24;
    if (dx * dx + dy * dy < rr * rr) {
      w.items.splice(i, 1);
      if (it.kind === 'coin' || it.kind === 'pump') RC.collect(w, it);
      else if (w.time >= w.invulnUntil) RC.hitPlayer(w, it);
    }
  }
};
