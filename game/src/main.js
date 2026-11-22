import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createGameState, stepGame, applyDevSceneHook, FIXED_DT } from './state.js';
import { renderWorld } from './render.js';
import { renderHud } from './hud.js';
import { renderTitleScreen, renderEndScreen } from './screens.js';

function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  const rawScene = params.get('scene') || params.get('shot');
  let scene = null;
  if (rawScene === 'start' || rawScene === 'title') scene = 'title';
  else if (rawScene === 'play') scene = 'play';
  else if (rawScene === 'win') scene = 'win';
  else if (rawScene === 'lose' || rawScene === 'end') scene = 'lose';

  const seedParam = params.get('seed');
  const seed = seedParam !== null ? parseInt(seedParam, 10) || 1 : 1;

  const tParam = params.get('t');
  let tSeconds = 0;
  if (tParam !== null) {
    tSeconds = Math.max(0, parseFloat(tParam) || 0);
  } else if (scene === 'play' || scene === 'win' || scene === 'lose') {
    // Default fast-forward when ?scene=play/win/lose or ?shot=play/end omits ?t=
    tSeconds = 42;
  }

  return { scene, seed, tSeconds };
}

function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // Crisp DPR rendering at 1280x720 logical coordinates
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = 1280 * dpr;
  canvas.height = 720 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const audio = createAudio();
  const input = createInput(window);
  input.setGestureCallback(() => audio.unlock());

  const { scene, seed, tSeconds } = parseQuery();
  const state = createGameState({ seed, levelIndex: 0, scene: 'title' });

  if (scene) {
    applyDevSceneHook(state, scene, tSeconds, null);
  }

  let lastTime = performance.now();
  let accumulator = 0;

  function draw() {
    renderWorld(ctx, state);
    renderHud(ctx, state);
    if (state.scene === 'title') {
      renderTitleScreen(ctx);
    } else if (state.scene === 'win' || state.scene === 'lose') {
      renderEndScreen(ctx, state);
    }
  }

  function frame(now) {
    const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    accumulator += dt;

    while (accumulator >= FIXED_DT) {
      stepGame(state, input, audio, FIXED_DT);
      accumulator -= FIXED_DT;
    }

    draw();
    requestAnimationFrame(frame);
  }

  draw();
  requestAnimationFrame(frame);
}

boot();
