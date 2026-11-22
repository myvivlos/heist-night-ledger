// Detection maths, shadow/smoke concealment modifiers, and segmented alarm meter fill/decay.
import { castVisionRay, getSolidRects, pointInRect } from './levels.js';

const ALARM_DECAY_PER_SEC = 15;
const SHADOW_DECAY_BONUS = 6;
const SMOKE_DECAY_BONUS = 10;

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

export function isPlayerInShadow(player, shadows) {
  for (let i = 0; i < shadows.length; i += 1) {
    if (pointInRect(player.x, player.y, shadows[i])) return true;
  }
  return false;
}

export function isPlayerInSmoke(player, smokes) {
  for (let i = 0; i < smokes.length; i += 1) {
    const s = smokes[i];
    const dx = player.x - s.x;
    const dy = player.y - s.y;
    const effectiveR = s.radius * 0.88;
    if (dx * dx + dy * dy <= effectiveR * effectiveR) return true;
  }
  return false;
}

function coneExposure(player, origin, rects, smokes, inShadow, isSprinting, isCrouching) {
  const dx = player.x - origin.x;
  const dy = player.y - origin.y;
  const dist = Math.hypot(dx, dy);
  const stanceRangeMul = isCrouching ? 0.78 : isSprinting ? 1.2 : 1.0;
  const shadowRangeMul = inShadow && !isSprinting ? 0.48 : 1.0;
  const effectiveRange = origin.range * stanceRangeMul * shadowRangeMul;
  if (dist > effectiveRange) return 0;

  const angleToPlayer = Math.atan2(dy, dx);
  if (angleDiff(angleToPlayer, origin.angle) > origin.fov * 0.5) return 0;

  const clearDist = castVisionRay(origin.x, origin.y, angleToPlayer, dist + 2, rects, smokes);
  if (clearDist < dist - player.radius * 0.55) return 0;

  const proximity = 1 - Math.min(1, dist / effectiveRange);
  const baseRate = 58 + proximity * 82;
  const stanceRate = isCrouching ? 0.48 : isSprinting ? 1.55 : 1.0;
  const shadowRate = inShadow && !isSprinting ? 0.45 : 1.0;
  return baseRate * stanceRate * shadowRate;
}

export function updateAlarm(state, dt, audio) {
  const { player, level, guards, cameras, smokes } = state;
  const rects = getSolidRects(level);
  const inShadow = isPlayerInShadow(player, level.shadows);
  const inSmoke = isPlayerInSmoke(player, smokes);
  player.inShadow = inShadow;
  player.inSmoke = inSmoke;

  let maxRate = 0;
  let spotter = null;

  if (!inSmoke && player.ventCooldown <= 0.15) {
    for (let i = 0; i < guards.length; i += 1) {
      const g = guards[i];
      const rate = coneExposure(player, g, rects, smokes, inShadow, player.sprinting, player.crouching);
      if (rate > maxRate) {
        maxRate = rate;
        spotter = { type: 'guard', id: g.id };
      }

      const d = Math.hypot(player.x - g.x, player.y - g.y);
      if (player.sprinting && d < 62) {
        const noiseRate = 52;
        if (noiseRate > maxRate) {
          maxRate = noiseRate;
          spotter = { type: 'noise', id: g.id };
        }
      }
    }

    for (let i = 0; i < cameras.length; i += 1) {
      const c = cameras[i];
      if (c.disabled) continue;
      const rate = coneExposure(player, c, rects, smokes, inShadow, player.sprinting, player.crouching);
      if (rate > maxRate) {
        maxRate = rate;
        spotter = { type: 'camera', id: c.id };
      }
    }
  }

  const prevTier = Math.floor(state.alarm / 25);
  state.spotted = maxRate > 0;

  if (maxRate > 0) {
    state.alarm = Math.min(100, state.alarm + maxRate * dt);
    state.lastSpotter = spotter;
    const newTier = Math.floor(state.alarm / 25);
    if (newTier > prevTier && state.alarm < 100 && audio) {
      audio.alarmPing(newTier);
    }
  } else {
    const decay = ALARM_DECAY_PER_SEC + (inShadow ? SHADOW_DECAY_BONUS : 0) + (inSmoke ? SMOKE_DECAY_BONUS : 0);
    state.alarm = Math.max(0, state.alarm - decay * dt);
  }

  return state.alarm >= 100;
}
