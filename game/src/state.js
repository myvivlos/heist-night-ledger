// Game state machine, 3-level progression, particles, and win/lose transitions.
import { LEVELS, buildLevelData, getSolidRects } from './levels.js';
import { createRandom } from './random.js';
import { createPlayer, updatePlayer } from './player.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { updateAlarm } from './alarm.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSE = 'lose';

function loadLevel(state, levelIndex) {
  const level = buildLevelData(levelIndex);
  state.levelIndex = levelIndex;
  state.level = level;
  state.player = createPlayer(level.spawn);
  state.guards = createGuards(level.guardSpecs, state.rng);
  state.cameras = createCameras(level.cameraSpecs, state.rng);
  state.smokes = [];
  state.ripples = [];
  state.effects = [];
  state.noiseEvents = [];
  state.alarm = 0;
  state.spotted = false;
  state.lastSpotter = null;
}

export function createGameState(seed) {
  const state = {
    seed,
    rng: createRandom(seed),
    screen: SCREEN_TITLE,
    levelIndex: 0,
    totalLevels: LEVELS.length,
    loot: 0,
    time: 0,
    alarm: 0,
    spotted: false,
    lastSpotter: null,
    verdictReason: '',
    levelBannerTimer: 0,
    levelBannerText: '',
    level: null,
    player: null,
    guards: [],
    cameras: [],
    smokes: [],
    ripples: [],
    effects: [],
    noiseEvents: [],
    pulsePhase: 0,
  };
  loadLevel(state, 0);
  return state;
}

export function startRun(state) {
  state.rng = createRandom(state.seed);
  state.loot = 0;
  state.time = 0;
  state.verdictReason = '';
  state.levelBannerTimer = 1.8;
  state.levelBannerText = `FLOOR 1: ${LEVELS[0].name}`;
  state.screen = SCREEN_PLAY;
  loadLevel(state, 0);
}

function updateParticles(state, dt) {
  for (let i = state.smokes.length - 1; i >= 0; i -= 1) {
    state.smokes[i].life -= dt;
    if (state.smokes[i].life <= 0) state.smokes.splice(i, 1);
  }
  for (let i = state.ripples.length - 1; i >= 0; i -= 1) {
    const r = state.ripples[i];
    r.life -= dt;
    const progress = 1 - Math.max(0, r.life) / r.maxLife;
    r.r = 10 + (r.maxR - 10) * progress;
    if (r.life <= 0) state.ripples.splice(i, 1);
  }
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    state.effects[i].life -= dt;
    state.effects[i].y -= dt * 18;
    if (state.effects[i].life <= 0) state.effects.splice(i, 1);
  }
}

export function stepGame(state, dt, controls, actions, audio) {
  state.pulsePhase += dt;

  if (state.screen === SCREEN_TITLE) {
    const rects = getSolidRects(state.level);
    updateGuards(state.guards, dt, rects, state.smokes, null);
    updateCameras(state.cameras, dt, rects, state.smokes);
    return;
  }

  if (state.screen !== SCREEN_PLAY) return;

  state.time += dt;
  if (state.levelBannerTimer > 0) {
    state.levelBannerTimer = Math.max(0, state.levelBannerTimer - dt);
  }

  state.noiseEvents.length = 0;
  updateParticles(state, dt);

  const playerOutcome = updatePlayer(state, dt, controls, actions, audio);
  if (playerOutcome === 'escaped') {
    if (state.levelIndex + 1 < LEVELS.length) {
      const nextIndex = state.levelIndex + 1;
      loadLevel(state, nextIndex);
      state.levelBannerTimer = 2.0;
      state.levelBannerText = `FLOOR ${nextIndex + 1}: ${LEVELS[nextIndex].name}`;
      if (audio) audio.pickup();
      return;
    }
    state.screen = SCREEN_WIN;
    state.verdictReason = 'Cracked all 3 vaults and escaped clean with the Night Ledger.';
    if (audio) audio.win();
    return;
  }

  const rects = getSolidRects(state.level);
  updateGuards(state.guards, dt, rects, state.smokes, state.noiseEvents);
  updateCameras(state.cameras, dt, rects, state.smokes);

  const caught = updateAlarm(state, dt, audio);
  if (caught) {
    state.screen = SCREEN_LOSE;
    if (state.lastSpotter && state.lastSpotter.type === 'camera') {
      state.verdictReason = 'Caught by a security camera sweep before reaching cover.';
    } else if (state.lastSpotter && state.lastSpotter.type === 'noise') {
      state.verdictReason = 'Sprint footsteps alerted a nearby guard and tripped lockdown.';
    } else {
      state.verdictReason = 'Spotted in a guard patrol vision cone; lockdown triggered.';
    }
    if (audio) audio.lose();
  }
}
