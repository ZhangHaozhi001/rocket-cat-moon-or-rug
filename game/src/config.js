// config.js — every tunable of Rocket Cat: Moon or Rug in one place.
window.RC = window.RC || {};

RC.W = 960;            // playfield width  (CSS pixels, canvas units)
RC.H = 540;            // playfield height
RC.RUN_SECONDS = 60;   // survive this long and the cat reaches the moon
RC.START_SHIELDS = 3;  // hits the rocket can take before it is rugged
RC.PLAYER_Y = 452;     // the rocket flies on this line, dodging left and right
RC.PLAYER_SPEED = 520; // keyboard steering speed, px per second
RC.BASE_FALL = 175;    // starting fall speed of the world, px per second
RC.MAX_FALL = 430;     // fall speed at the end of the run
RC.COIN_SCORE = 10;
RC.CANDLE_SCORE = 25;  // green "pump" candles are worth more than coins
RC.COMBO_STEP = 5;     // every 5 pickups in a row raises the combo multiplier

RC.COLORS = {
  skyTop: '#0b1233', skyBottom: '#1a2450',
  coin: '#ffd94d', coinEdge: '#e8a812',
  green: '#2fe08a', greenDark: '#12a35c',
  red: '#ff5470', redDark: '#c22547',
  rug: '#b06ee8', rugDark: '#7c3fbf',
  hull: '#f4f7ff', hullShade: '#c3cdea', accent: '#ff8a3d',
  text: '#eef2ff', dim: '#93a3d4',
};
