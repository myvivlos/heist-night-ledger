// Guard patrol navigation, sweeping vision head rotation, and noise alerts.
import { buildVisionPolygon } from './levels.js';

function normalizeAngle(angle) {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function rotateToward(current, target, maxStep) {
  const diff = normalizeAngle(target - current);
  if (Math.abs(diff) <= maxStep) return target;
  return normalizeAngle(current + Math.sign(diff) * maxStep);
}

export function createGuards(specs, rng) {
  return specs.map((spec, index) => {
    const startWp = spec.waypoints[0];
    const nextWp = spec.waypoints[1] || startWp;
    const baseAngle = Math.atan2(nextWp.y - startWp.y, nextWp.x - startWp.x);
    return {
      id: index + 1,
      x: startWp.x,
      y: startWp.y,
      radius: 14,
      angle: baseAngle,
      baseAngle,
      sweepPhase: rng.range(0, Math.PI * 2),
      speed: spec.speed,
      range: spec.range,
      fov: spec.fov,
      waypoints: spec.waypoints,
      wpIndex: 1 % spec.waypoints.length,
      pauseTimer: rng.range(0, 0.35),
      alertTimer: 0,
      alertAngle: baseAngle,
      conePoly: [],
    };
  });
}

export function updateGuards(guards, dt, rects, smokes, noiseEvents) {
  for (let i = 0; i < guards.length; i += 1) {
    const g = guards[i];
    g.sweepPhase += dt * 1.9;

    if (noiseEvents && noiseEvents.length > 0) {
      for (let n = 0; n < noiseEvents.length; n += 1) {
        const ev = noiseEvents[n];
        const dx = ev.x - g.x;
        const dy = ev.y - g.y;
        if (dx * dx + dy * dy <= ev.radius * ev.radius) {
          g.alertAngle = Math.atan2(dy, dx);
          g.alertTimer = 1.1;
        }
      }
    }

    if (g.alertTimer > 0) {
      g.alertTimer = Math.max(0, g.alertTimer - dt);
      g.angle = rotateToward(g.angle, g.alertAngle, dt * 4.2);
    } else if (g.pauseTimer > 0) {
      g.pauseTimer = Math.max(0, g.pauseTimer - dt);
      const look = g.baseAngle + Math.sin(g.sweepPhase) * 0.42;
      g.angle = rotateToward(g.angle, look, dt * 3.0);
    } else {
      const target = g.waypoints[g.wpIndex];
      const dx = target.x - g.x;
      const dy = target.y - g.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        g.x = target.x;
        g.y = target.y;
        g.pauseTimer = target.pause ?? 0.45;
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
        const next = g.waypoints[g.wpIndex];
        g.baseAngle = Math.atan2(next.y - g.y, next.x - g.x);
      } else {
        const step = Math.min(dist, g.speed * dt);
        g.x += (dx / dist) * step;
        g.y += (dy / dist) * step;
        g.baseAngle = Math.atan2(dy, dx);
        const sweep = g.baseAngle + Math.sin(g.sweepPhase) * 0.22;
        g.angle = rotateToward(g.angle, sweep, dt * 5.0);
      }
    }

    g.conePoly = buildVisionPolygon(g.x, g.y, g.angle, g.fov, g.range, rects, smokes, 28);
  }
}
