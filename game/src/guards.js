import { computeVisionPolygon } from './levels.js';

export const GUARD_FOV = (70 * Math.PI) / 180; // ~70 degrees wide red cone

function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function rotateToward(current, target, maxStep) {
  const diff = normalizeAngle(target - current);
  if (Math.abs(diff) <= maxStep) return target;
  return normalizeAngle(current + Math.sign(diff) * maxStep);
}

/**
 * Instantiates patrol guards for the given level.
 */
export function createGuards(level, rng) {
  const spec = level.spec;
  return spec.guards.map((g, idx) => {
    const startWp = g.waypoints[g.startIndex % g.waypoints.length];
    return {
      id: idx,
      x: startWp.x,
      y: startWp.y,
      radius: 14,
      angle: g.startAngle ?? 0,
      baseAngle: g.startAngle ?? 0,
      waypoints: g.waypoints,
      wpIndex: (g.startIndex + 1) % g.waypoints.length,
      pauseTimer: 0,
      sweepClock: rng ? rng.range(0, Math.PI * 2) : idx * 1.1,
      speed: spec.guardSpeed,
      fov: GUARD_FOV,
      range: spec.guardRange,
      alertLevel: 0, // 0 = patrol, 1 = suspicious, 2 = spotting
      investigateTarget: null,
      investigateTimer: 0,
      cone: [],
    };
  });
}

/**
 * Advances guard patrols, sweeping head rotation, noise investigation, and cone geometry.
 */
export function updateGuards(guards, level, player, dt) {
  for (const g of guards) {
    g.sweepClock += dt;

    // React to sprinting footsteps if nearby
    if (player && player.noiseRadius > 0) {
      const distToPlayer = Math.hypot(player.x - g.x, player.y - g.y);
      if (distToPlayer <= player.noiseRadius + 40 && g.alertLevel < 2) {
        g.investigateTarget = { x: player.x, y: player.y };
        g.investigateTimer = 1.6;
        g.alertLevel = Math.max(g.alertLevel, 1);
      }
    }

    if (g.investigateTimer > 0 && g.investigateTarget) {
      g.investigateTimer -= dt;
      const targetAngle = Math.atan2(g.investigateTarget.y - g.y, g.investigateTarget.x - g.x);
      g.angle = rotateToward(g.angle, targetAngle, 3.8 * dt);
      if (g.investigateTimer <= 0) {
        g.investigateTarget = null;
        if (g.alertLevel === 1) g.alertLevel = 0;
      }
    } else if (g.pauseTimer > 0) {
      g.pauseTimer -= dt;
      // Sweep left/right while holding at a corner waypoint
      const nextWp = g.waypoints[g.wpIndex];
      const lookNext = Math.atan2(nextWp.y - g.y, nextWp.x - g.x);
      const sweepOffset = Math.sin(g.sweepClock * 2.4) * 0.55;
      g.angle = rotateToward(g.angle, normalizeAngle(lookNext + sweepOffset), 3.4 * dt);
    } else {
      const target = g.waypoints[g.wpIndex];
      const dx = target.x - g.x;
      const dy = target.y - g.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= 3) {
        g.x = target.x;
        g.y = target.y;
        g.pauseTimer = target.pause ?? 0.6;
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
      } else {
        const step = Math.min(dist, g.speed * dt);
        g.x += (dx / dist) * step;
        g.y += (dy / dist) * step;
        const moveAngle = Math.atan2(dy, dx);
        const gentleScan = Math.sin(g.sweepClock * 1.9) * 0.22;
        g.angle = rotateToward(g.angle, normalizeAngle(moveAngle + gentleScan), 4.2 * dt);
      }
    }

    g.cone = computeVisionPolygon(g.x, g.y, g.angle, g.fov, g.range, level, 38);
  }
}
