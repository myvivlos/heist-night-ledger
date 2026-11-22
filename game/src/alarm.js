import { hasLineOfSight, isPointInShadow, isPointInSmoke } from './levels.js';

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

function isInVisionCone(ox, oy, facing, fov, range, px, py, level) {
  const dx = px - ox;
  const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return { seen: false, dist };

  const targetAngle = Math.atan2(dy, dx);
  if (angleDiff(targetAngle, facing) > fov * 0.5) {
    return { seen: false, dist };
  }

  if (!hasLineOfSight(ox, oy, px, py, level)) {
    return { seen: false, dist };
  }

  return { seen: true, dist };
}

/**
 * Evaluates guard + camera detection against the thief and updates the alarm meter (0..100).
 */
export function updateAlarm(state, dt, audio) {
  const { player, guards, cameras, level } = state;
  const inShadow = isPointInShadow(player.x, player.y, level);
  const inSmoke = isPointInSmoke(player.x, player.y, level);
  player.inShadow = inShadow;
  player.inSmoke = inSmoke;

  // Stance + cover visibility factor
  let visibility = 1.0;
  if (player.stance === 'crouch') visibility *= 0.55;
  else if (player.stance === 'sprint') visibility *= 1.35;
  if (inShadow) visibility *= 0.5;
  if (inSmoke) visibility = 0; // Smoke completely conceals the thief

  let maxFillRate = 0;
  let spotterReason = null;

  if (visibility > 0) {
    for (const g of guards) {
      const distDirect = Math.hypot(player.x - g.x, player.y - g.y);
      // Direct bump check if the thief brushes into a guard
      if (distDirect < g.radius + player.radius + 4) {
        maxFillRate = Math.max(maxFillRate, 130);
        spotterReason = 'Walked straight into a patrol guard.';
        g.alertLevel = 2;
        continue;
      }

      const check = isInVisionCone(g.x, g.y, g.angle, g.fov, g.range, player.x, player.y, level);
      if (check.seen) {
        const proximity = 1 - Math.min(1, check.dist / g.range) * 0.45;
        const rate = 78 * proximity * visibility;
        if (rate > maxFillRate) {
          maxFillRate = rate;
          spotterReason = 'Caught inside a patrol guard vision cone.';
        }
        g.alertLevel = 2;
      } else if (g.alertLevel === 2) {
        g.alertLevel = 1;
        g.investigateTimer = Math.max(g.investigateTimer, 0.8);
      }
    }

    for (const cam of cameras) {
      if (!cam.active) continue;
      const check = isInVisionCone(cam.x, cam.y, cam.angle, cam.fov, cam.range, player.x, player.y, level);
      if (check.seen) {
        const proximity = 1 - Math.min(1, check.dist / cam.range) * 0.4;
        const rate = 68 * proximity * visibility;
        if (rate > maxFillRate) {
          maxFillRate = rate;
          spotterReason = 'Tracked by a security camera arc.';
        }
        cam.spotting = true;
      } else {
        cam.spotting = false;
      }
    }
  } else {
    for (const g of guards) {
      if (g.alertLevel === 2) g.alertLevel = 1;
    }
    for (const cam of cameras) {
      cam.spotting = false;
    }
  }

  if (maxFillRate > 0) {
    state.alarm = Math.min(100, state.alarm + maxFillRate * dt);
    state.alarmPeak = Math.max(state.alarmPeak, state.alarm);
    state.alarmDecayDelay = 0.5;
    state.spottedBy = spotterReason;
    if (audio) audio.playAlarmPing(state.alarm, state.elapsed);
  } else {
    if (state.alarmDecayDelay > 0) {
      state.alarmDecayDelay = Math.max(0, state.alarmDecayDelay - dt);
    } else if (state.alarm > 0) {
      state.alarm = Math.max(0, state.alarm - 22 * dt);
    }
  }

  return state.alarm >= 100;
}

/**
 * Forces a realistic alarm catch through the real state fields (used by ?scene=lose).
 */
export function triggerSpotAlarm(state, reason = 'Caught inside a patrol guard vision cone.') {
  state.alarm = 100;
  state.alarmPeak = 100;
  state.alarmDecayDelay = 1.0;
  state.spottedBy = reason;
  if (state.guards.length > 0) {
    state.guards[0].alertLevel = 2;
  }
}
