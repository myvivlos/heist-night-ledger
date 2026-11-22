import { computeVisionPolygon, tileCenter } from './levels.js';

export const CAMERA_FOV = (55 * Math.PI) / 180; // ~55 degrees sweeping cyan arc

/**
 * Instantiates sweeping security cameras for the current level.
 */
export function createCameras(level) {
  const spec = level.spec;
  return spec.cameras.map((c, idx) => {
    const pos = tileCenter(c.col, c.row);
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      baseAngle: c.baseAngle,
      sweepAmp: c.sweepAmp,
      speed: spec.cameraSpeed,
      clock: c.phase ?? idx * 1.3,
      angle: c.baseAngle + Math.sin(c.phase ?? idx * 1.3) * c.sweepAmp,
      fov: CAMERA_FOV,
      range: spec.cameraRange,
      active: true,
      spotting: false,
      cone: [],
    };
  });
}

/**
 * Updates camera sweep arcs and computes raycasted cone polygons.
 */
export function updateCameras(cameras, level, dt) {
  for (const cam of cameras) {
    if (!cam.active) {
      cam.spotting = false;
      cam.cone = [];
      continue;
    }
    cam.clock += dt * cam.speed;
    cam.angle = cam.baseAngle + Math.sin(cam.clock) * cam.sweepAmp;
    cam.cone = computeVisionPolygon(cam.x, cam.y, cam.angle, cam.fov, cam.range, level, 34);
  }
}

/**
 * Disables all cameras when the security terminal is hacked.
 */
export function disableAllCameras(cameras) {
  let count = 0;
  for (const cam of cameras) {
    if (cam.active) {
      cam.active = false;
      cam.spotting = false;
      cam.cone = [];
      count++;
    }
  }
  return count;
}
