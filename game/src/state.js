import { createRng } from './random.js';
import { buildLevelInstance, LEVEL_SPECS } from './levels.js';
import { createPlayer, updatePlayer } from './player.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { updateAlarm, triggerSpotAlarm } from './alarm.js';

export const FIXED_DT = 1 / 60;

/**
 * Creates a clean game state for the specified level and seed.
 */
export function createGameState({ seed = 1, levelIndex = 0, scene = 'title', totalLootCarry = 0 } = {}) {
  const rng = createRng(seed);
  const level = buildLevelInstance(levelIndex);
  const player = createPlayer(level.spawn);
  const guards = createGuards(level, rng);
  const cameras = createCameras(level);

  const state = {
    scene, // 'title' | 'play' | 'win' | 'lose'
    seed,
    rng,
    levelIndex,
    totalLevels: LEVEL_SPECS.length,
    level,
    player,
    guards,
    cameras,
    alarm: 0,
    alarmPeak: 0,
    alarmDecayDelay: 0,
    spottedBy: '',
    loot: totalLootCarry,
    levelStartLoot: totalLootCarry,
    smokeUsed: 0,
    elapsed: 0,
    verdictReason: '',
    popups: [],
  };

  // Compute initial vision cones so frame 0 (title/play) has full cone geometry
  updateGuards(state.guards, state.level, null, 0);
  updateCameras(state.cameras, state.level, 0);
  return state;
}

export function startLevel(state, levelIndex, carryLoot = 0) {
  const fresh = createGameState({
    seed: state.seed + levelIndex * 97,
    levelIndex,
    scene: 'play',
    totalLootCarry: carryLoot,
  });
  Object.assign(state, fresh);
}

export function restartCampaign(state) {
  const fresh = createGameState({
    seed: state.seed,
    levelIndex: 0,
    scene: 'play',
    totalLootCarry: 0,
  });
  Object.assign(state, fresh);
}

/**
 * Advances one fixed-timestep tick of the real state machine.
 */
export function stepGame(state, input, audio, dt = FIXED_DT) {
  if (input && input.consumePress('KeyM') && audio) {
    audio.toggleMute();
  }

  if (state.scene === 'title') {
    if (input && (input.consumePress('Space') || input.consumePress('Enter'))) {
      state.scene = 'play';
      input.clearTransient();
      if (audio) audio.playLoot();
    }
    return;
  }

  if (state.scene === 'win') {
    if (input && input.consumePress('KeyR')) {
      restartCampaign(state);
      input.clearTransient();
      return;
    }
    if (
      state.levelIndex + 1 < state.totalLevels &&
      input &&
      (input.consumePress('Space') || input.consumePress('Enter'))
    ) {
      startLevel(state, state.levelIndex + 1, state.loot);
      input.clearTransient();
    }
    return;
  }

  if (state.scene === 'lose') {
    if (input && input.consumePress('KeyR')) {
      restartCampaign(state);
      input.clearTransient();
    }
    return;
  }

  // Active 'play' scene
  if (input && input.consumePress('KeyR')) {
    restartCampaign(state);
    input.clearTransient();
    return;
  }

  state.elapsed += dt;

  // Update active smoke clouds
  for (let i = state.level.smokeClouds.length - 1; i >= 0; i--) {
    const s = state.level.smokeClouds[i];
    s.ttl -= dt;
    if (s.ttl <= 0) {
      state.level.smokeClouds.splice(i, 1);
    }
  }

  // Update floating popups
  for (let i = state.popups.length - 1; i >= 0; i--) {
    const p = state.popups[i];
    p.ttl -= dt;
    p.y -= 18 * dt;
    if (p.ttl <= 0) state.popups.splice(i, 1);
  }

  const playerResult = updatePlayer(state, input, audio, dt);
  updateGuards(state.guards, state.level, state.player, dt);
  updateCameras(state.cameras, state.level, dt);

  const caught = updateAlarm(state, dt, audio);
  if (caught) {
    state.scene = 'lose';
    state.verdictReason = state.spottedBy || 'Security alarm hit 100% — floor locked down.';
    if (audio) audio.playLose();
    return;
  }

  if (playerResult.escaped) {
    state.scene = 'win';
    state.verdictReason =
      state.levelIndex + 1 >= state.totalLevels
        ? 'All three vaults cleared — clean getaway with the ledger.'
        : `${state.level.spec.name} cleared — vault ledger secured.`;
    if (audio) audio.playWin();
  }
}

/**
 * Applies the URL dev hook (?scene=title|play|win|lose, ?t=<seconds>) using the real update loop.
 */
export function applyDevSceneHook(state, targetScene, tSeconds, audio = null) {
  if (targetScene === 'title') {
    state.scene = 'title';
    return;
  }

  // Run fixed-timestep simulation in play mode for tSeconds
  state.scene = 'play';
  const steps = Math.max(0, Math.round(tSeconds / FIXED_DT));
  for (let i = 0; i < steps; i++) {
    stepGame(state, null, null, FIXED_DT);
    if (state.scene !== 'play') break;
  }

  if (targetScene === 'win') {
    // Transition through real state completion: collect vault + bonus loot, reach exit
    state.level.safe.progress = state.level.safe.duration;
    state.level.safe.cracked = true;
    state.loot = state.level.safe.value;
    for (let i = 0; i < Math.min(2, state.level.loot.length); i++) {
      state.level.loot[i].collected = true;
      state.loot += state.level.loot[i].value;
    }
    state.player.x = state.level.exit.x;
    state.player.y = state.level.exit.y;
    stepGame(state, null, audio, FIXED_DT);
  } else if (targetScene === 'lose') {
    triggerSpotAlarm(state, 'Caught inside a patrol guard vision cone.');
    stepGame(state, null, audio, FIXED_DT);
  }
}
