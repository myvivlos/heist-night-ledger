// Wall-mounted security cameras: sweeping fixed arcs, terminal disable state, and cyan cones.
import { buildVisionPolygon } from './levels.js';

export function createCameras(specs, rng) {
  return specs.map((spec, index) => ({
    id: index + 1,
    x: spec.x,
    y: spec.y,
    minAngle: spec.minAngle,
    maxAngle: spec.maxAngle,
    speed: spec.speed,
    range: spec.range,
    fov: spec.fov,
    phase: rng.range(0, Math.PI * 2),
    angle: (spec.minAngle + spec.maxAngle) * 0.5,
    disabled: false,
    conePoly: [],
  }));
}

export function updateCameras(cameras, dt, rects, smokes) {
  for (let i = 0; i < cameras.length; i += 1) {
    const cam = cameras[i];
    if (cam.disabled) {
      cam.conePoly = [];
      continue;
    }
    cam.phase += dt * cam.speed;
    const t = 0.5 - 0.5 * Math.cos(cam.phase);
    cam.angle = cam.minAngle + (cam.maxAngle - cam.minAngle) * t;
    cam.conePoly = buildVisionPolygon(cam.x, cam.y, cam.angle, cam.fov, cam.range, rects, smokes, 24);
  }
}
