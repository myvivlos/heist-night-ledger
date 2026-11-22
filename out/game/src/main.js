// Boot, fixed-timestep loop, and URL dev hook (?scene=title|play|win|lose, ?shot=..., ?seed=<int>, ?t=<seconds>).
import { createAudio } from './audio.js';
import {
  ACTION_INTERACT_PRESS,
  ACTION_MUTE,
  ACTION_RESTART,
  ACTION_SMOKE,
  ACTION_START,
  createInput,
} from './input.js';
import { createRenderer } from './render.js';
import {
  SCREEN_LOSE,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
  createGameState,
  startRun,
  stepGame,
} from './state.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const SHOT_ALIAS = {
  start: SCREEN_TITLE,
  title: SCREEN_TITLE,
  play: SCREEN_PLAY,
  win: SCREEN_WIN,
  lose: SCREEN_LOSE,
  end: SCREEN_LOSE,
};

function parseHookParams() {
  const params = new URLSearchParams(window.location.search);
  const rawScene = (params.get('scene') || params.get('shot') || '').toLowerCase();
  const targetScene = SHOT_ALIAS[rawScene] || null;
  const seedRaw = Number.parseInt(params.get('seed') ?? '', 10);
  const seed = Number.isInteger(seedRaw) ? seedRaw : targetScene ? 1 : Math.floor(Math.random() * 1e9);
  const tRaw = Number.parseFloat(params.get('t') ?? '');
  const t = Number.isFinite(tRaw) && tRaw >= 0 ? tRaw : null;
  return { targetScene, seed, t };
}

function steerControls(player, tx, ty, options = {}) {
  const { crouch = false, sprint = false, interact = false } = options;
  const dx = tx - player.x;
  const dy = ty - player.y;
  const d = Math.hypot(dx, dy);
  return {
    mx: d > 8 ? dx / d : 0,
    my: d > 8 ? dy / d : 0,
    crouch,
    sprint,
    interact,
  };
}

// Scripted real-input play bot for ?scene=play so the simulation genuinely fast-forwards t seconds.
function makePlayInput(state, elapsed) {
  let controls = { mx: 0, my: 0, crouch: false, sprint: false, interact: false };
  const actions = { smoke: false, interactPress: false };

  if (!state.level.keycard.taken && elapsed < 3.4) {
    controls = steerControls(state.player, 560, 618, { crouch: false });
  } else if (!state.level.bonusLoot[0].taken && elapsed < 6.8) {
    if (state.player.y > 470 && state.player.x < 640) {
      controls = steerControls(state.player, 660, 460, { crouch: false });
    } else {
      controls = steerControls(state.player, 760, 268, { crouch: false });
    }
  } else if (state.alarm > 56) {
    controls = steerControls(state.player, 495, 380, { crouch: true });
  } else if (state.alarm < 38) {
    controls = steerControls(state.player, 720, 295, { crouch: true });
  } else {
    controls = steerControls(state.player, 660, 295, { crouch: true });
  }

  return { controls, actions };
}

function makeLoseInput(state) {
  const g = state.guards[0];
  const dx = g.x - state.player.x;
  const dy = g.y - state.player.y;
  const dist = Math.hypot(dx, dy) || 1;
  return {
    controls: {
      mx: dist > 18 ? dx / dist : 0,
      my: dist > 18 ? dy / dist : 0,
      crouch: false,
      sprint: true,
      interact: false,
    },
    actions: { smoke: false, interactPress: false },
  };
}

function makeWinInput(state) {
  let controls = { mx: 0, my: 0, crouch: false, sprint: false, interact: false };
  const actions = { smoke: false, interactPress: false };
  const lvl = state.levelIndex;
  const safe = state.level.safe;
  const exit = state.level.exit;
  const p = state.player;
  const danger = state.alarm > 30 || state.spotted;
  const sprintOk = !danger && state.alarm < 15;

  if (state.alarm > 42 && p.smokeLeft > 0 && !p.inSmoke) {
    actions.smoke = true;
  }

  if (state.alarm > 62) {
    controls.crouch = true;
    if (p.smokeLeft > 0 && !p.inSmoke) actions.smoke = true;
    return { controls, actions };
  }

  if (lvl === 0) {
    if (!safe.cracked) {
      if (p.x < 920 && p.y > 540) controls = steerControls(p, 950, 616, { sprint: sprintOk, crouch: danger });
      else if (p.x < 1105) controls = steerControls(p, 1110, 384, { sprint: sprintOk, crouch: danger });
      else if (Math.hypot(safe.x - p.x, safe.y - p.y) > 42) controls = steerControls(p, safe.x - 30, safe.y, { crouch: danger });
      else controls = { mx: 0, my: 0, crouch: true, sprint: false, interact: true };
    } else if (p.x > 940 && p.y > 180) {
      controls = steerControls(p, 940, 140, { sprint: sprintOk, crouch: danger });
    } else {
      controls = steerControls(p, exit.x, exit.y, { sprint: sprintOk, crouch: danger });
    }
  } else if (lvl === 1) {
    if (!safe.cracked) {
      if (p.y < 535 && p.x < 650) controls = steerControls(p, 160, 620, { sprint: sprintOk, crouch: danger });
      else if (p.x < 795 && p.y > 525) controls = steerControls(p, 815, 560, { sprint: sprintOk, crouch: danger });
      else if (p.y > 460) controls = steerControls(p, 815, 420, { sprint: sprintOk, crouch: danger });
      else if (Math.hypot(safe.x - p.x, safe.y - p.y) > 44) controls = steerControls(p, safe.x - 28, safe.y, { crouch: danger });
      else controls = { mx: 0, my: 0, crouch: true, sprint: false, interact: true };
    } else if (p.y < 535 && p.x < 975) {
      controls = steerControls(p, 815, 560, { sprint: sprintOk, crouch: danger });
    } else if (p.x < 1150 && p.y > 520) {
      controls = steerControls(p, 1165, 560, { sprint: sprintOk, crouch: danger });
    } else {
      controls = steerControls(p, exit.x, exit.y, { sprint: sprintOk, crouch: danger });
    }
  } else if (!safe.cracked) {
    if (p.y < 610 && p.x < 560) controls = steerControls(p, 200, 625, { sprint: sprintOk, crouch: danger });
    else if (p.x < 625 && p.y > 520) controls = steerControls(p, 640, 625, { sprint: sprintOk, crouch: danger });
    else if (p.y > 450) controls = steerControls(p, 640, 420, { sprint: sprintOk, crouch: danger });
    else if (Math.hypot(safe.x - p.x, safe.y - p.y) > 44) controls = steerControls(p, safe.x - 28, safe.y, { crouch: danger });
    else controls = { mx: 0, my: 0, crouch: true, sprint: false, interact: true };
  } else if (p.y < 605 && p.x < 780) {
    controls = steerControls(p, 640, 625, { sprint: sprintOk, crouch: danger });
  } else if (p.x < 1150 && p.y > 520) {
    controls = steerControls(p, 1165, 625, { sprint: sprintOk, crouch: danger });
  } else {
    controls = steerControls(p, exit.x, exit.y, { sprint: sprintOk, crouch: danger });
  }

  return { controls, actions };
}

function stageDevScene(state, targetScene, tParam) {
  const neutralControls = { mx: 0, my: 0, crouch: false, sprint: false, interact: false };
  const neutralActions = { smoke: false, interactPress: false };

  if (targetScene === SCREEN_TITLE) {
    const duration = tParam ?? 2.8;
    const steps = Math.round(duration / STEP);
    for (let i = 0; i < steps; i += 1) {
      stepGame(state, STEP, neutralControls, neutralActions, null);
    }
    return;
  }

  startRun(state);
  state.levelBannerTimer = 0;

  if (targetScene === SCREEN_PLAY) {
    const duration = tParam ?? 42.0;
    const steps = Math.round(duration / STEP);
    for (let i = 0; i < steps && state.screen === SCREEN_PLAY; i += 1) {
      const { controls, actions } = makePlayInput(state, i * STEP);
      stepGame(state, STEP, controls, actions, null);
    }
    return;
  }

  if (targetScene === SCREEN_LOSE) {
    const minSteps = Math.round((tParam ?? 12) / STEP);
    for (let i = 0; i < Math.max(minSteps, 900) && state.screen === SCREEN_PLAY; i += 1) {
      const { controls, actions } = makeLoseInput(state);
      stepGame(state, STEP, controls, actions, null);
    }
    return;
  }

  if (targetScene === SCREEN_WIN) {
    const maxSteps = Math.max(Math.round((tParam ?? 90) / STEP), 5400);
    for (let i = 0; i < maxSteps && state.screen === SCREEN_PLAY; i += 1) {
      const { controls, actions } = makeWinInput(state);
      stepGame(state, STEP, controls, actions, null);
    }
  }
}

function boot() {
  const canvas = document.getElementById('game');
  const status = document.getElementById('status');
  const audio = createAudio();
  const renderer = createRenderer(canvas);
  const hook = parseHookParams();
  const state = createGameState(hook.seed);

  let frozenShot = false;
  if (hook.targetScene) {
    stageDevScene(state, hook.targetScene, hook.t);
    frozenShot = true;
  }

  function announce(msg) {
    if (status) status.textContent = msg;
  }

  const input = createInput(canvas, () => audio.unlock());

  function handleActions(rawActions) {
    if (rawActions & ACTION_MUTE) {
      audio.setMuted(!audio.isMuted());
    }
    if (state.screen === SCREEN_TITLE && (rawActions & ACTION_START)) {
      frozenShot = false;
      startRun(state);
      announce('Playing Level 1. Crack the safe and reach the exit.');
      return true;
    }
    if ((state.screen === SCREEN_WIN || state.screen === SCREEN_LOSE) && (rawActions & ACTION_RESTART)) {
      frozenShot = false;
      startRun(state);
      announce('New job started.');
      return true;
    }
    return false;
  }

  let accumulator = 0;
  let last = performance.now();
  let prevScreen = state.screen;
  let painted = 0;

  function frame(now) {
    requestAnimationFrame(frame);

    if (frozenShot) {
      const raw = input.takeActions();
      if (handleActions(raw)) {
        last = now;
        accumulator = 0;
      }
      renderer.draw(state);
      painted += 1;
      if (painted === 2) window.__shotReady = true;
      return;
    }

    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;

    const raw = input.takeActions();
    handleActions(raw);
    const controls = input.controls();
    const actions = {
      smoke: Boolean(raw & ACTION_SMOKE),
      interactPress: Boolean(raw & ACTION_INTERACT_PRESS),
    };

    while (accumulator >= STEP) {
      stepGame(state, STEP, controls, actions, audio);
      actions.smoke = false;
      actions.interactPress = false;
      accumulator -= STEP;
    }

    if (state.screen !== prevScreen) {
      prevScreen = state.screen;
      if (state.screen === SCREEN_WIN) announce(`Getaway! Loot $${state.loot}. Press R to plan another job.`);
      else if (state.screen === SCREEN_LOSE) announce(`Burned! ${state.verdictReason} Press R to plan another job.`);
    }

    renderer.draw(state);
  }

  announce('Night Ledger. Press Space to plan the job.');
  requestAnimationFrame(frame);
}

boot();
