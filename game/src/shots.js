// shots.js — deterministic scenes for the entry screenshots. Opening the game
// with ?shot=start|play|rug|moon&seed=1 freezes a representative frame of that
// screen (seeded RNG, staged items), so the maker's screenshots are real renders
// of the game's own code. Normal visits never see this.
window.RC = window.RC || {};

RC.shotScene = function (w, name, seed) {
  RC.rng = RC.makeRng(seed * 7919 + 13);
  const again = RC.makeRng(seed * 104729 + 7);
  RC.rng = again;

  if (name === 'start') { w.state = 'title'; return w; }

  if (name === 'play') {
    w.state = 'play'; w.time = 31; w.score = 420; w.high = 640;
    w.combo = 7; w.multiplier = 2; w.shields = 2; w.playerX = 430; w.tilt = 0.14;
    const spots = [
      ['coin', 250, 120], ['coin', 292, 168], ['pump', 560, 96], ['coin', 660, 210],
      ['red', 770, 130], ['rug', 150, 300], ['coin', 520, 300], ['pump', 830, 320],
      ['red', 330, 380], ['coin', 730, 420],
    ];
    for (const [kind, x, y] of spots) {
      w.items.push({ kind: kind, x: x, y: y, vy: 260, size: kind === 'rug' ? 46 : kind === 'coin' ? 30 : 26, spin: x });
    }
    RC.burst(w, 520, 300, '#ffd94d', 8, 130);
    RC.floater(w, 520, 268, '+20', '#ffd94d');
    return w;
  }

  if (name === 'rug') {
    w.state = 'play'; w.time = 44; w.score = 610; w.shields = 1; w.playerX = 480;
    RC.endRun(w, false);
    w.score = 610; w.high = 640;
    return w;
  }

  if (name === 'moon') {
    w.state = 'play'; w.time = 60; w.score = 975; w.shields = 2; w.playerX = 620;
    RC.endRun(w, true);
    w.score = 975; w.high = 975;
    return w;
  }

  w.state = 'title';
  return w;
};
