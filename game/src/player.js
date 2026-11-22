import { resolveCircleWallCollisions } from './levels.js';
import { disableAllCameras } from './cameras.js';

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: 13,
    angle: 0,
    stance: 'walk', // 'walk' | 'crouch' | 'sprint'
    noiseRadius: 0,
    inShadow: false,
    inSmoke: false,
    smokeCount: 2,
    keycard: 'none', // 'none' | 'held' | 'used'
    ventCooldown: 0,
    safeTickClock: 0,
    nearbyPrompt: null,
    crackingSafe: false,
  };
}

function distTo(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Updates thief movement, stance, pickups, interactions, and smoke deployment.
 */
export function updatePlayer(state, input, audio, dt) {
  const { player, level } = state;

  if (player.ventCooldown > 0) {
    player.ventCooldown = Math.max(0, player.ventCooldown - dt);
  }

  // Movement input
  let mx = 0;
  let my = 0;
  if (input) {
    if (input.anyDown(['KeyW', 'ArrowUp'])) my -= 1;
    if (input.anyDown(['KeyS', 'ArrowDown'])) my += 1;
    if (input.anyDown(['KeyA', 'ArrowLeft'])) mx -= 1;
    if (input.anyDown(['KeyD', 'ArrowRight'])) mx += 1;
  }

  const moving = mx !== 0 || my !== 0;
  const crouching = input ? input.anyDown(['ShiftLeft', 'ShiftRight']) : false;
  const sprinting = !crouching && moving && input ? input.isDown('Space') : false;

  if (crouching) player.stance = 'crouch';
  else if (sprinting) player.stance = 'sprint';
  else player.stance = 'walk';

  const speed =
    player.stance === 'crouch' ? 105 : player.stance === 'sprint' ? 275 : 185;

  if (moving) {
    const len = Math.hypot(mx, my);
    const nx = mx / len;
    const ny = my / len;
    player.x += nx * speed * dt;
    player.y += ny * speed * dt;
    player.angle = Math.atan2(ny, nx);
    resolveCircleWallCollisions(player, level);
    player.noiseRadius =
      player.stance === 'sprint' ? 155 : player.stance === 'walk' ? 40 : 0;
  } else {
    player.noiseRadius = 0;
  }

  // Auto-collect gold loot stacks
  for (const item of level.loot) {
    if (!item.collected && distTo(player, item) <= player.radius + item.radius + 6) {
      item.collected = true;
      state.loot += item.value;
      state.popups.push({
        x: item.x,
        y: item.y - 12,
        text: `+$${item.value.toLocaleString()}`,
        color: '#ffd166',
        ttl: 1.3,
      });
      if (audio) audio.playLoot();
    }
  }

  // Auto-collect keycard on contact (or via E)
  if (!level.keycard.collected && distTo(player, level.keycard) <= player.radius + level.keycard.radius + 8) {
    level.keycard.collected = true;
    player.keycard = 'held';
    state.popups.push({
      x: level.keycard.x,
      y: level.keycard.y - 14,
      text: 'KEYCARD ACQUIRED',
      color: '#38e8ff',
      ttl: 1.5,
    });
    if (audio) audio.playKeycard();
  }

  // Determine nearby interactive prompt and handle E interactions
  player.nearbyPrompt = null;
  player.crackingSafe = false;
  const holdingE = input ? input.isDown('KeyE') : false;
  const pressedE = input ? input.consumePress('KeyE') : false;

  // 1. Safe cracking (hold E for 3.0s)
  const safeDist = distTo(player, level.safe);
  if (!level.safe.cracked && safeDist <= 56) {
    if (holdingE) {
      player.crackingSafe = true;
      level.safe.progress = Math.min(level.safe.duration, level.safe.progress + dt);
      level.safe.pauseTimer = 0.55;
      player.safeTickClock += dt;
      if (player.safeTickClock >= 0.35) {
        player.safeTickClock = 0;
        if (audio) audio.playSafeTick(level.safe.progress / level.safe.duration);
      }
      if (level.safe.progress >= level.safe.duration) {
        level.safe.cracked = true;
        state.loot += level.safe.value;
        state.popups.push({
          x: level.safe.x,
          y: level.safe.y - 24,
          text: `+$${level.safe.value.toLocaleString()} SAFE CRACKED!`,
          color: '#ffd166',
          ttl: 2.0,
        });
        if (audio) audio.playSafeOpen();
      }
    } else {
      const pct = Math.round((level.safe.progress / level.safe.duration) * 100);
      player.nearbyPrompt = {
        x: level.safe.x,
        y: level.safe.y - 34,
        text: pct > 0 ? `HOLD [E] CRACK SAFE (${pct}%)` : 'HOLD [E] CRACK SAFE (3s)',
        color: '#ffd166',
      };
    }
  }

  // Decay safe progress slowly if player stepped away or stopped holding
  if (!player.crackingSafe && !level.safe.cracked && level.safe.progress > 0) {
    if (level.safe.pauseTimer > 0) {
      level.safe.pauseTimer -= dt;
    } else {
      level.safe.progress = Math.max(0, level.safe.progress - 0.7 * dt);
    }
  }

  // 2. Security terminal hack
  const termDist = distTo(player, level.terminal);
  if (!level.terminal.hacked && termDist <= 48) {
    if (!player.nearbyPrompt) {
      player.nearbyPrompt = {
        x: level.terminal.x,
        y: level.terminal.y - 28,
        text: '[E] HACK CAMERAS',
        color: '#38e8ff',
      };
    }
    if (pressedE) {
      level.terminal.hacked = true;
      const disabled = disableAllCameras(state.cameras);
      state.popups.push({
        x: level.terminal.x,
        y: level.terminal.y - 16,
        text: `${disabled} CAMERAS OFFLINE`,
        color: '#38e8ff',
        ttl: 1.7,
      });
      if (audio) audio.playTerminal();
    }
  }

  // 3. Keycard door
  for (const door of level.doors) {
    if (door.open) continue;
    const dDist = Math.hypot(player.x - door.cx, player.y - door.cy);
    if (dDist <= 54) {
      if (player.keycard === 'held') {
        if (!player.nearbyPrompt) {
          player.nearbyPrompt = {
            x: door.cx,
            y: door.cy - 28,
            text: '[E] UNLOCK DOOR (USES CARD)',
            color: '#ffd166',
          };
        }
        if (pressedE) {
          door.open = true;
          player.keycard = 'used';
          state.popups.push({
            x: door.cx,
            y: door.cy - 18,
            text: 'KEYCARD DOOR OPEN',
            color: '#ffd166',
            ttl: 1.5,
          });
          if (audio) audio.playDoor();
        }
      } else if (!player.nearbyPrompt) {
        player.nearbyPrompt = {
          x: door.cx,
          y: door.cy - 28,
          text: 'LOCKED — FIND KEYCARD',
          color: '#ff6b85',
        };
      }
    }
  }

  // 4. Vent shortcut
  for (const vent of level.vents) {
    if (distTo(player, vent) <= 40) {
      if (!player.nearbyPrompt) {
        player.nearbyPrompt = {
          x: vent.x,
          y: vent.y - 28,
          text: '[E] USE VENT',
          color: '#94a3b8',
        };
      }
      if (pressedE && player.ventCooldown <= 0) {
        const dest = level.vents[vent.targetIndex];
        player.x = dest.x;
        player.y = dest.y;
        player.ventCooldown = 0.45;
        resolveCircleWallCollisions(player, level);
        state.popups.push({
          x: dest.x,
          y: dest.y - 16,
          text: 'VENT SHORTCUT',
          color: '#94a3b8',
          ttl: 1.1,
        });
        if (audio) audio.playVent();
        break;
      }
    }
  }

  // 5. Smoke bomb throw (Q)
  if (input && input.consumePress('KeyQ')) {
    if (player.smokeCount > 0) {
      player.smokeCount -= 1;
      state.smokeUsed += 1;
      const sx = player.x + Math.cos(player.angle) * 20;
      const sy = player.y + Math.sin(player.angle) * 20;
      level.smokeClouds.push({
        x: sx,
        y: sy,
        radius: 78,
        ttl: 7.5,
        maxTtl: 7.5,
      });
      state.popups.push({
        x: sx,
        y: sy - 18,
        text: 'SMOKE OUT',
        color: '#cbd5e1',
        ttl: 1.2,
      });
      if (audio) audio.playSmoke();
    } else {
      state.popups.push({
        x: player.x,
        y: player.y - 18,
        text: 'NO SMOKE LEFT',
        color: '#94a3b8',
        ttl: 1.0,
      });
    }
  }

  // 6. Exit check
  const atExit = distTo(player, level.exit) <= 34;
  if (atExit && !level.safe.cracked && !player.nearbyPrompt) {
    player.nearbyPrompt = {
      x: level.exit.x,
      y: level.exit.y - 30,
      text: 'CRACK SAFE FIRST',
      color: '#ffd166',
    };
  }

  return { escaped: level.safe.cracked && atExit };
}
