// audio.js — WebAudio bleeps, no audio files: coin chime, pump arpeggio,
// rug thud, and the moon fanfare. Created lazily on the first user gesture.
window.RC = window.RC || {};

RC.audio = (function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, at, dur, type, vol, slideTo) {
    if (muted || !ensure()) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.08, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock: ensure,
    toggleMute: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; },
    coin: function (combo) { tone(880 + Math.min(combo, 10) * 40, 0, 0.09, 'square', 0.06); tone(1318, 0.05, 0.1, 'square', 0.05); },
    pump: function () { tone(523, 0, 0.08, 'triangle', 0.09); tone(659, 0.06, 0.08, 'triangle', 0.09); tone(784, 0.12, 0.12, 'triangle', 0.09); },
    hit: function () { tone(220, 0, 0.22, 'sawtooth', 0.1, 55); tone(110, 0.02, 0.25, 'square', 0.07, 40); },
    launch: function () { tone(392, 0, 0.1, 'triangle', 0.08); tone(523, 0.08, 0.1, 'triangle', 0.08); tone(659, 0.16, 0.16, 'triangle', 0.08); },
    moon: function () { [523, 659, 784, 1046, 784, 1046].forEach(function (f, i) { tone(f, i * 0.11, 0.16, 'triangle', 0.09); }); },
    rug: function () { tone(440, 0, 0.5, 'sawtooth', 0.08, 82); tone(415, 0.1, 0.5, 'sawtooth', 0.06, 73); },
  };
})();
