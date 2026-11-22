// Thief movement, crouch/sprint stance, smoke bomb kit, and contextual [E] interactions.
import {
  MAX_SMOKE,
  SAFE_CRACK_TIME,
  SMOKE_DURATION,
  SMOKE_RADIUS,
  TERMINAL_HACK_TIME,
  castVisionRay,
  getSolidRects,
  resolveCircleRects,
} from './levels.js';

const SPEED_NORMAL = 185;
const SPEED_CROUCH = 98;
const SPEED_SPRINT = 280;
const NOISE_INTERVAL = 0.36;

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: 13,
    angle: 0,
    crouching: false,
    sprinting: false,
    moving: false,
    inShadow: false,
    inSmoke: false,
    smokeLeft: MAX_SMOKE,
    hasKeycard: false,
    keycardUsed: false,
    ventCooldown: 0,
    noiseTimer: 0,
    safeClickTimer: 0,
    promptText: '',
    activeInteract: null,
  };
}

function near(ax, ay, bx, by, dist) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy <= dist * dist;
}

export function updatePlayer(state, dt, controls, actions, audio) {
  const { player, level, smokes, cameras, noiseEvents, ripples, effects } = state;

  if (player.ventCooldown > 0) {
    player.ventCooldown = Math.max(0, player.ventCooldown - dt);
  }

  const moving = controls.mx !== 0 || controls.my !== 0;
  player.moving = moving;
  player.crouching = Boolean(controls.crouch);
  player.sprinting = Boolean(controls.sprint) && moving && !player.crouching;

  const speed = player.crouching ? SPEED_CROUCH : player.sprinting ? SPEED_SPRINT : SPEED_NORMAL;
  if (moving) {
    player.x += controls.mx * speed * dt;
    player.y += controls.my * speed * dt;
    player.angle = Math.atan2(controls.my, controls.mx);
  }

  const rects = getSolidRects(level);
  resolveCircleRects(player, player.radius, rects);

  if (player.sprinting) {
    player.noiseTimer -= dt;
    if (player.noiseTimer <= 0) {
      player.noiseTimer = NOISE_INTERVAL;
      noiseEvents.push({ x: player.x, y: player.y, radius: 165 });
      ripples.push({
        x: player.x,
        y: player.y,
        r: 10,
        maxR: 155,
        life: 0.55,
        maxLife: 0.55,
        color: 'rgba(248, 250, 252, 0.35)',
      });
    }
  } else {
    player.noiseTimer = 0.06;
  }

  if (actions.smoke && player.smokeLeft > 0) {
    player.smokeLeft -= 1;
    const throwDist = Math.min(68, Math.max(12, castVisionRay(player.x, player.y, player.angle, 68, rects, null) - 16));
    const sx = player.x + Math.cos(player.angle) * throwDist;
    const sy = player.y + Math.sin(player.angle) * throwDist;
    smokes.push({ x: sx, y: sy, radius: SMOKE_RADIUS, life: SMOKE_DURATION, maxLife: SMOKE_DURATION });
    effects.push({ x: sx, y: sy, text: 'SMOKE', color: '#cbd5e1', life: 0.9 });
    if (audio) audio.smoke();
  }

  if (!level.keycard.taken && near(player.x, player.y, level.keycard.x, level.keycard.y, player.radius + level.keycard.r + 6)) {
    level.keycard.taken = true;
    player.hasKeycard = true;
    effects.push({ x: level.keycard.x, y: level.keycard.y - 12, text: 'KEYCARD', color: '#38bdf8', life: 1.1 });
    if (audio) audio.pickup();
  }

  for (let i = 0; i < level.bonusLoot.length; i += 1) {
    const item = level.bonusLoot[i];
    if (!item.taken && near(player.x, player.y, item.x, item.y, player.radius + item.r + 6)) {
      item.taken = true;
      state.loot += item.value;
      effects.push({ x: item.x, y: item.y - 12, text: `+$${item.value.toLocaleString()}`, color: '#fbbf24', life: 1.1 });
      if (audio) audio.pickup();
    }
  }

  player.promptText = '';
  player.activeInteract = null;

  const doorCx = level.door.x + level.door.w * 0.5;
  const doorCy = level.door.y + level.door.h * 0.5;
  const nearSafe = !level.safe.cracked && near(player.x, player.y, level.safe.x, level.safe.y, 52);
  const nearDoor = !level.door.open && near(player.x, player.y, doorCx, doorCy, 56);
  const nearTerm = !level.terminal.hacked && near(player.x, player.y, level.terminal.x, level.terminal.y, 48);

  let nearVent = null;
  for (let i = 0; i < level.vents.length; i += 1) {
    const v = level.vents[i];
    if (near(player.x, player.y, v.x, v.y, 40)) {
      nearVent = v;
      break;
    }
  }

  if (nearSafe) {
    player.promptText = controls.interact ? 'CRACKING SAFE...' : 'HOLD [E] CRACK SAFE (3s)';
    player.activeInteract = { kind: 'safe', progress: level.safe.progress };
    if (controls.interact) {
      level.safe.progress = Math.min(1, level.safe.progress + dt / SAFE_CRACK_TIME);
      player.activeInteract.progress = level.safe.progress;
      player.safeClickTimer -= dt;
      if (player.safeClickTimer <= 0) {
        player.safeClickTimer = 0.34;
        if (audio) audio.safeClick(level.safe.progress);
      }
      if (level.safe.progress >= 1) {
        level.safe.cracked = true;
        state.loot += level.safe.value;
        effects.push({
          x: level.safe.x,
          y: level.safe.y - 18,
          text: `+$${level.safe.value.toLocaleString()} LEDGER`,
          color: '#fbbf24',
          life: 1.5,
        });
        if (audio) audio.safeOpen();
      }
    } else {
      level.safe.progress = Math.max(0, level.safe.progress - dt * 0.65);
    }
  } else {
    if (!level.safe.cracked) {
      level.safe.progress = Math.max(0, level.safe.progress - dt * 0.65);
    }

    if (nearDoor) {
      if (player.hasKeycard) {
        player.promptText = '[E] UNLOCK DOOR (USES KEYCARD)';
        if (actions.interactPress || controls.interact) {
          level.door.open = true;
          player.hasKeycard = false;
          player.keycardUsed = true;
          effects.push({ x: doorCx, y: doorCy - 14, text: 'KEYCARD USED', color: '#38bdf8', life: 1.2 });
          if (audio) audio.doorOpen();
        }
      } else {
        player.promptText = 'LOCKED — FIND KEYCARD';
      }
    } else if (nearTerm) {
      player.promptText = controls.interact ? 'HACKING CAMERAS...' : 'HOLD [E] DISABLE CAMERAS';
      player.activeInteract = { kind: 'terminal', progress: level.terminal.progress };
      if (controls.interact) {
        level.terminal.progress = Math.min(1, level.terminal.progress + dt / TERMINAL_HACK_TIME);
        player.activeInteract.progress = level.terminal.progress;
        if (level.terminal.progress >= 1) {
          level.terminal.hacked = true;
          for (let c = 0; c < cameras.length; c += 1) {
            cameras[c].disabled = true;
          }
          effects.push({ x: level.terminal.x, y: level.terminal.y - 14, text: 'CAMERAS OFFLINE', color: '#22d3ee', life: 1.4 });
          if (audio) audio.terminal();
        }
      } else {
        level.terminal.progress = Math.max(0, level.terminal.progress - dt * 0.7);
      }
    } else if (nearVent && player.ventCooldown <= 0) {
      player.promptText = `[E] VENT TO ${level.vents[nearVent.pairIndex].id}`;
      if (actions.interactPress) {
        const dest = level.vents[nearVent.pairIndex];
        player.x = dest.x;
        player.y = dest.y;
        player.ventCooldown = 0.55;
        ripples.push({
          x: dest.x,
          y: dest.y,
          r: 8,
          maxR: 48,
          life: 0.35,
          maxLife: 0.35,
          color: 'rgba(148, 163, 184, 0.5)',
        });
        effects.push({ x: dest.x, y: dest.y - 16, text: `VENT ${dest.id}`, color: '#94a3b8', life: 0.9 });
        if (audio) audio.vent();
      }
    }
  }

  if (level.safe.cracked && near(player.x, player.y, level.exit.x, level.exit.y, player.radius + level.exit.r)) {
    return 'escaped';
  }
  return null;
}
