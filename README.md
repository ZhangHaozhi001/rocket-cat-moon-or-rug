# Rocket Cat: Moon or Rug

A 60-second arcade dodger about the oldest story in crypto: a cat, a rocket,
and a chart that wants to kill her.

**Play it:** https://zhanghaozhi001.github.io/rocket-cat-moon-or-rug/game/

## The game

You pilot Rocket Cat straight up a live candlestick chart. Golden coins and
green *pump* candles rain down as points — chain them together to raise the
combo multiplier. Red *dump* candles and flying **rugs** cost a shield. You
have three shields and sixty seconds: survive the climb and you reach the
moon; take three hits and the rug is pulled.

- **Steer** with ←/→ or A/D, the mouse, or touch — the rocket chases your pointer
- **Score** — coin 10, green candle 25, both × your combo multiplier
- **Feedback** — particles, screen shake, damage flash, floating score popups,
  WebAudio bleeps (no audio files), and a moon-progress bar that fills as you climb
- **Loop** — title screen → play → MOONED! / RUGGED! → one click or keypress to fly again
- Best score is kept in `localStorage`

Everything is original: code, canvas-drawn art, and synthesized sound were
made for this entry. No libraries, no build step, no network requests — the
game is plain static files under `game/`.

## Run it locally

```sh
node serve.ts          # serves game/ at http://localhost:8080
# or any static server pointed at game/
```

## Hand it in (make.fun best-game-01)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`
(the kit's library, unchanged).

The screenshots in `screenshots/` are real renders of this code, taken in
headless Chrome from the game's deterministic screenshot scenes
(`game/index.html?shot=start|play|rug|moon&seed=1`, see `shots.json` and
`game/src/shots.js`).

## Layout

- `game/index.html` — page shell and script order
- `game/src/config.js` — all tunables
- `game/src/random.js` — seeded RNG (deterministic screenshot scenes)
- `game/src/audio.js` — WebAudio sound effects
- `game/src/input.js` — keyboard / mouse / touch
- `game/src/world.js` — simulation: spawning, collisions, combo, shields
- `game/src/render.js` — all drawing: rocket, items, HUD, screens
- `game/src/shots.js` — staged scenes for the screenshots
- `game/src/main.js` — boot and the frame loop

MIT licensed (see `LICENSE`).
