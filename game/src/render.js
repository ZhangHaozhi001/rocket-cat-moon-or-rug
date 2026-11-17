// render.js — all drawing: the sky, the moon, the cat rocket, pickups and
// hazards, particles, the HUD, and the title / rugged / moon screens.
window.RC = window.RC || {};

RC.render = function (ctx, w) {
  ctx.save();
  if (w.shake > 0) ctx.translate((Math.random() - 0.5) * w.shake, (Math.random() - 0.5) * w.shake);
  drawSky(ctx, w);
  drawMoon(ctx, w);
  for (const it of w.items) drawItem(ctx, w, it);
  if (w.state === 'play' || w.state === 'moon') drawRocket(ctx, w);
  drawParticles(ctx, w);
  drawFloaters(ctx, w);
  ctx.restore();

  if (w.flash > 0) { ctx.fillStyle = 'rgba(255,40,70,' + (w.flash * 0.28) + ')'; ctx.fillRect(0, 0, RC.W, RC.H); }
  if (w.state === 'play') drawHud(ctx, w);
  if (w.state === 'title') drawTitle(ctx, w);
  if (w.state === 'rug') drawEnd(ctx, w, false);
  if (w.state === 'moon') drawEnd(ctx, w, true);
};

function drawSky(ctx, w) {
  const g = ctx.createLinearGradient(0, 0, 0, RC.H);
  g.addColorStop(0, RC.COLORS.skyTop); g.addColorStop(1, RC.COLORS.skyBottom);
  ctx.fillStyle = g; ctx.fillRect(-20, -20, RC.W + 40, RC.H + 40);
  for (const s of w.stars) {
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(s.tw + performance.now() / 700);
    ctx.fillStyle = '#cdd8ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMoon(ctx, w) {
  if (w.moonY < -120 && w.state !== 'moon') return;
  const x = RC.W - 150, y = w.state === 'moon' ? 92 : w.moonY;
  ctx.fillStyle = '#f7ead1';
  ctx.beginPath(); ctx.arc(x, y, 58, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#e8d5ae';
  ctx.beginPath(); ctx.arc(x - 18, y - 10, 11, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 14, y + 16, 8, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 22, y - 22, 6, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(247,234,209,.35)'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(x, y, 70, 0, 6.283); ctx.stroke();
}

function drawItem(ctx, w, it) {
  ctx.save(); ctx.translate(it.x, it.y);
  if (it.kind === 'coin') {
    const sq = Math.abs(Math.cos(it.spin)) * 0.55 + 0.45;
    ctx.scale(sq, 1);
    ctx.fillStyle = RC.COLORS.coin; ctx.strokeStyle = RC.COLORS.coinEdge; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a86e00'; ctx.font = 'bold 17px Trebuchet MS'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);
  } else if (it.kind === 'pump' || it.kind === 'red') {
    const up = it.kind === 'pump';
    ctx.fillStyle = up ? RC.COLORS.green : RC.COLORS.red;
    ctx.strokeStyle = up ? RC.COLORS.greenDark : RC.COLORS.redDark; ctx.lineWidth = 2;
    ctx.fillRect(-6, -16, 12, 32); ctx.strokeRect(-6, -16, 12, 32);
    ctx.fillRect(-1.5, -23, 3, 7); ctx.fillRect(-1.5, 16, 3, 7);
    ctx.fillStyle = up ? '#0d5c36' : '#6e1030';
    ctx.font = 'bold 13px Trebuchet MS'; ctx.textAlign = 'center';
    ctx.fillText(up ? '▲' : '▼', 0, -26);
  } else { // rug — a little flying carpet
    ctx.rotate(Math.sin(it.spin) * 0.16);
    ctx.fillStyle = RC.COLORS.rug; ctx.strokeStyle = RC.COLORS.rugDark; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-26, -8); ctx.quadraticCurveTo(0, -16, 26, -8);
    ctx.quadraticCurveTo(0, 2, -26, -8); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-26, 4); ctx.quadraticCurveTo(0, -4, 26, 4);
    ctx.quadraticCurveTo(0, 14, -26, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e9d5ff'; ctx.font = 'bold 10px Trebuchet MS'; ctx.textAlign = 'center';
    ctx.fillText('RUG', 0, 3);
  }
  ctx.restore();
}

function drawRocket(ctx, w) {
  const x = w.playerX, y = RC.PLAYER_Y;
  const blink = w.state === 'play' && w.time < w.invulnUntil && Math.floor(w.time * 12) % 2 === 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(w.tilt);
  if (blink) ctx.globalAlpha = 0.35;
  // flame
  const fl = 16 + Math.random() * 10;
  ctx.fillStyle = RC.COLORS.accent;
  ctx.beginPath(); ctx.moveTo(-9, 26); ctx.lineTo(0, 26 + fl); ctx.lineTo(9, 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath(); ctx.moveTo(-5, 26); ctx.lineTo(0, 26 + fl * 0.6); ctx.lineTo(5, 26); ctx.closePath(); ctx.fill();
  // fins
  ctx.fillStyle = RC.COLORS.red;
  ctx.beginPath(); ctx.moveTo(-13, 8); ctx.lineTo(-24, 28); ctx.lineTo(-11, 28); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(13, 8); ctx.lineTo(24, 28); ctx.lineTo(11, 28); ctx.closePath(); ctx.fill();
  // hull
  ctx.fillStyle = RC.COLORS.hull; ctx.strokeStyle = RC.COLORS.hullShade; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.quadraticCurveTo(15, -14, 14, 10); ctx.lineTo(12, 28); ctx.lineTo(-12, 28); ctx.lineTo(-14, 10);
  ctx.quadraticCurveTo(-15, -14, 0, -34); ctx.fill(); ctx.stroke();
  // window with the cat pilot
  ctx.fillStyle = '#bfe3ff'; ctx.beginPath(); ctx.arc(0, -6, 10.5, 0, 6.283); ctx.fill();
  ctx.strokeStyle = RC.COLORS.hullShade; ctx.stroke();
  ctx.fillStyle = '#ffb35c'; // cat head
  ctx.beginPath(); ctx.arc(0, -4, 7, 0, 6.283); ctx.fill();
  ctx.beginPath(); // ears
  ctx.moveTo(-6.5, -8); ctx.lineTo(-5, -13.5); ctx.lineTo(-2, -9.5); ctx.closePath();
  ctx.moveTo(6.5, -8); ctx.lineTo(5, -13.5); ctx.lineTo(2, -9.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#26304d'; // eyes
  ctx.fillRect(-3.6, -5.4, 2, 2.6); ctx.fillRect(1.6, -5.4, 2, 2.6);
  ctx.restore();
}

function drawParticles(ctx, w) {
  for (const p of w.particles) {
    ctx.globalAlpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx, w) {
  ctx.textAlign = 'center'; ctx.font = 'bold 17px Trebuchet MS';
  for (const f of w.floaters) {
    ctx.globalAlpha = 1 - f.life / 0.9;
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function panel(ctx, x, y, pw, ph) {
  ctx.fillStyle = 'rgba(8,12,32,.82)';
  ctx.strokeStyle = '#2c3d78'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 14); ctx.fill(); ctx.stroke();
}

function drawHud(ctx, w) {
  ctx.fillStyle = RC.COLORS.text; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 22px Trebuchet MS';
  ctx.fillText('SCORE ' + w.score, 18, 34);
  ctx.font = 'bold 14px Trebuchet MS'; ctx.fillStyle = RC.COLORS.dim;
  ctx.fillText('BEST ' + Math.max(w.high, w.score), 18, 56);
  if (w.multiplier > 1) { ctx.fillStyle = '#ffd94d'; ctx.fillText('COMBO ×' + w.multiplier, 18, 78); }
  // shields
  ctx.textAlign = 'right'; ctx.fillStyle = RC.COLORS.text; ctx.font = 'bold 14px Trebuchet MS';
  ctx.fillText('SHIELDS', RC.W - 18, 24);
  for (let i = 0; i < RC.START_SHIELDS; i++) {
    ctx.fillStyle = i < w.shields ? '#2fe08a' : 'rgba(120,135,180,.35)';
    ctx.beginPath(); ctx.arc(RC.W - 30 - i * 26, 42, 9, 0, 6.283); ctx.fill();
  }
  // altitude to the moon
  const p = Math.min(w.time / RC.RUN_SECONDS, 1);
  ctx.fillStyle = 'rgba(120,135,180,.3)'; ctx.fillRect(RC.W / 2 - 130, 16, 260, 10);
  ctx.fillStyle = '#ffd94d'; ctx.fillRect(RC.W / 2 - 130, 16, 260 * p, 10);
  ctx.font = 'bold 15px Trebuchet MS'; ctx.fillStyle = RC.COLORS.text; ctx.textAlign = 'center';
  ctx.fillText('🌕 MOON IN ' + Math.max(0, Math.ceil(RC.RUN_SECONDS - w.time)) + 's', RC.W / 2, 44);
  if (RC.audio.isMuted()) { ctx.fillStyle = RC.COLORS.dim; ctx.textAlign = 'right'; ctx.font = '12px Trebuchet MS'; ctx.fillText('MUTED (M)', RC.W - 18, RC.H - 12); }
}

function drawTitle(ctx, w) {
  // a parked rocket under the title, drawn by hand here (the world rocket only flies in play)
  const saved = w.playerX; w.playerX = RC.W / 2;
  const tw = { playerX: RC.W / 2, tilt: 0, time: 9, invulnUntil: -1, state: 'title' };
  drawRocket(ctx, tw); w.playerX = saved;
  panel(ctx, RC.W / 2 - 300, 56, 600, 196);
  ctx.textAlign = 'center'; ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 46px Trebuchet MS';
  ctx.fillText('ROCKET CAT', RC.W / 2, 118);
  ctx.fillStyle = RC.COLORS.text; ctx.font = 'bold 27px Trebuchet MS';
  ctx.fillText('MOON OR RUG', RC.W / 2, 154);
  ctx.fillStyle = RC.COLORS.dim; ctx.font = '16px Trebuchet MS';
  ctx.fillText('Grab coins $ and green candles ▲ — dodge red candles ▼ and rugs.', RC.W / 2, 188);
  ctx.fillText('Survive 60 seconds to reach the moon. Three hits and you are rugged.', RC.W / 2, 212);
  ctx.fillStyle = '#2fe08a'; ctx.font = 'bold 19px Trebuchet MS';
  ctx.fillText('CLICK OR PRESS ANY KEY TO LAUNCH', RC.W / 2, 240 + Math.sin(performance.now() / 300) * 2);
  ctx.fillStyle = RC.COLORS.dim; ctx.font = '13px Trebuchet MS';
  ctx.fillText('Steer: ← → keys · mouse · touch        Sound: M', RC.W / 2, RC.H - 16);
  if (w.high > 0) { ctx.fillStyle = '#ffd94d'; ctx.font = 'bold 15px Trebuchet MS'; ctx.fillText('BEST ' + w.high, RC.W / 2, 282); }
}

function drawEnd(ctx, w, won) {
  panel(ctx, RC.W / 2 - 280, 130, 560, 250);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd94d' : '#ff8296';
  ctx.font = 'bold 44px Trebuchet MS';
  ctx.fillText(won ? '🌕 MOONED!' : '💥 RUGGED!', RC.W / 2, 196);
  ctx.fillStyle = RC.COLORS.text; ctx.font = '17px Trebuchet MS';
  ctx.fillText(won ? 'Rocket Cat rode the candles all the way to the moon.'
                   : 'The rug was pulled at ' + Math.floor(w.endAt) + ' seconds. The cat has seen things.', RC.W / 2, 232);
  ctx.font = 'bold 26px Trebuchet MS'; ctx.fillStyle = '#ffd94d';
  ctx.fillText('SCORE ' + w.score, RC.W / 2, 276);
  ctx.font = '15px Trebuchet MS'; ctx.fillStyle = RC.COLORS.dim;
  ctx.fillText(w.score >= w.high && w.score > 0 ? '★ NEW BEST! ★' : 'BEST ' + w.high, RC.W / 2, 302);
  ctx.fillStyle = '#2fe08a'; ctx.font = 'bold 19px Trebuchet MS';
  ctx.fillText('CLICK OR PRESS ANY KEY TO FLY AGAIN', RC.W / 2, 348);
}
