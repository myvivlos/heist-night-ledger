// Room blueprints for the 3 levels plus collision and raycasted vision geometry.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const HUD_HEIGHT = 56;

export const SAFE_CRACK_TIME = 3.0;
export const TERMINAL_HACK_TIME = 1.0;
export const SMOKE_DURATION = 6.5;
export const SMOKE_RADIUS = 88;
export const MAX_SMOKE = 2;

const GUARD_FOV = (70 * Math.PI) / 180;
const CAMERA_FOV = (55 * Math.PI) / 180;

const OUTER_WALLS = [
  { x: 24, y: 64, w: 1232, h: 18 },
  { x: 24, y: 686, w: 1232, h: 18 },
  { x: 24, y: 64, w: 18, h: 640 },
  { x: 1238, y: 64, w: 18, h: 640 },
];

export const LEVELS = [
  {
    id: 1,
    name: 'ARCHIVE FOYER',
    safeValue: 25000,
    spawn: { x: 104, y: 616 },
    exit: { x: 104, y: 134, r: 26 },
    safe: { x: 1152, y: 384, r: 24 },
    keycard: { x: 560, y: 618, r: 14 },
    terminal: { x: 465, y: 140, r: 18 },
    vents: [
      { id: 'A', x: 240, y: 612, pairIndex: 1, r: 20 },
      { id: 'B', x: 1000, y: 612, pairIndex: 0, r: 20 },
    ],
    door: { x: 900, y: 342, w: 18, h: 84 },
    walls: [
      { x: 180, y: 194, w: 340, h: 18 },
      { x: 620, y: 194, w: 280, h: 18 },
      { x: 900, y: 212, w: 18, h: 130 },
      { x: 900, y: 426, w: 18, h: 120 },
      { x: 180, y: 510, w: 230, h: 18 },
      { x: 540, y: 340, w: 72, h: 88 },
    ],
    shadows: [
      { x: 240, y: 90, w: 150, h: 92 },
      { x: 660, y: 90, w: 150, h: 92 },
      { x: 460, y: 344, w: 68, h: 80 },
      { x: 960, y: 100, w: 110, h: 86 },
    ],
    bonusLoot: [
      { x: 760, y: 268, value: 2500 },
      { x: 1150, y: 140, value: 2500 },
    ],
    guards: [
      {
        speed: 92,
        range: 275,
        fov: GUARD_FOV,
        waypoints: [
          { x: 300, y: 290, pause: 0.5 },
          { x: 780, y: 290, pause: 0.6 },
          { x: 780, y: 470, pause: 0.5 },
          { x: 300, y: 470, pause: 0.6 },
        ],
      },
      {
        speed: 96,
        range: 270,
        fov: GUARD_FOV,
        waypoints: [
          { x: 980, y: 240, pause: 0.6 },
          { x: 980, y: 520, pause: 0.5 },
          { x: 1130, y: 520, pause: 0.6 },
          { x: 1130, y: 240, pause: 0.5 },
        ],
      },
    ],
    cameras: [
      { x: 894, y: 218, minAngle: 2.02, maxAngle: 2.98, speed: 0.78, range: 305, fov: CAMERA_FOV },
    ],
  },
  {
    id: 2,
    name: 'BULLION EXCHANGE',
    safeValue: 40000,
    spawn: { x: 104, y: 616 },
    exit: { x: 1160, y: 136, r: 26 },
    safe: { x: 880, y: 376, r: 24 },
    keycard: { x: 240, y: 145, r: 14 },
    terminal: { x: 1140, y: 575, r: 18 },
    vents: [
      { id: 'A', x: 485, y: 625, pairIndex: 1, r: 20 },
      { id: 'B', x: 1185, y: 265, pairIndex: 0, r: 20 },
    ],
    door: { x: 650, y: 336, w: 18, h: 84 },
    walls: [
      { x: 350, y: 82, w: 18, h: 210 },
      { x: 350, y: 420, w: 18, h: 170 },
      { x: 650, y: 240, w: 320, h: 18 },
      { x: 650, y: 496, w: 120, h: 18 },
      { x: 860, y: 496, w: 110, h: 18 },
      { x: 650, y: 240, w: 18, h: 96 },
      { x: 650, y: 420, w: 18, h: 94 },
      { x: 952, y: 240, w: 18, h: 274 },
      { x: 470, y: 340, w: 64, h: 80 },
      { x: 1060, y: 340, w: 64, h: 80 },
    ],
    shadows: [
      { x: 60, y: 240, w: 120, h: 120 },
      { x: 410, y: 92, w: 160, h: 82 },
      { x: 250, y: 580, w: 150, h: 92 },
      { x: 1035, y: 195, w: 110, h: 95 },
    ],
    bonusLoot: [
      { x: 240, y: 355, value: 4000 },
      { x: 800, y: 140, value: 4000 },
    ],
    guards: [
      {
        speed: 104,
        range: 275,
        fov: GUARD_FOV,
        waypoints: [
          { x: 215, y: 230, pause: 0.5 },
          { x: 215, y: 560, pause: 0.5 },
        ],
      },
      {
        speed: 108,
        range: 275,
        fov: GUARD_FOV,
        waypoints: [
          { x: 425, y: 205, pause: 0.45 },
          { x: 590, y: 205, pause: 0.45 },
          { x: 590, y: 550, pause: 0.45 },
          { x: 425, y: 550, pause: 0.45 },
        ],
      },
      {
        speed: 112,
        range: 280,
        fov: GUARD_FOV,
        waypoints: [
          { x: 705, y: 575, pause: 0.45 },
          { x: 1015, y: 575, pause: 0.35 },
          { x: 1015, y: 175, pause: 0.45 },
          { x: 705, y: 175, pause: 0.45 },
          { x: 1015, y: 175, pause: 0.3 },
          { x: 1015, y: 575, pause: 0.3 },
        ],
      },
    ],
    cameras: [
      { x: 344, y: 98, minAngle: 1.95, maxAngle: 3.0, speed: 0.85, range: 295, fov: CAMERA_FOV },
      { x: 944, y: 492, minAngle: 1.0, maxAngle: 2.3, speed: 0.9, range: 300, fov: CAMERA_FOV },
    ],
  },
  {
    id: 3,
    name: 'NIGHT LEDGER VAULT',
    safeValue: 65000,
    spawn: { x: 104, y: 384 },
    exit: { x: 1165, y: 136, r: 26 },
    safe: { x: 695, y: 376, r: 24 },
    keycard: { x: 1110, y: 615, r: 14 },
    terminal: { x: 185, y: 135, r: 18 },
    vents: [
      { id: 'A', x: 120, y: 625, pairIndex: 1, r: 20 },
      { id: 'B', x: 760, y: 135, pairIndex: 0, r: 20 },
    ],
    door: { x: 500, y: 340, w: 18, h: 80 },
    walls: [
      { x: 290, y: 180, w: 18, h: 140 },
      { x: 290, y: 440, w: 18, h: 140 },
      { x: 970, y: 180, w: 18, h: 140 },
      { x: 970, y: 440, w: 18, h: 140 },
      { x: 500, y: 250, w: 280, h: 18 },
      { x: 500, y: 482, w: 96, h: 18 },
      { x: 684, y: 482, w: 96, h: 18 },
      { x: 500, y: 250, w: 18, h: 90 },
      { x: 500, y: 420, w: 18, h: 80 },
      { x: 762, y: 250, w: 18, h: 250 },
    ],
    shadows: [
      { x: 190, y: 585, w: 170, h: 90 },
      { x: 550, y: 585, w: 180, h: 90 },
      { x: 860, y: 585, w: 180, h: 90 },
      { x: 500, y: 92, w: 170, h: 84 },
    ],
    bonusLoot: [
      { x: 120, y: 145, value: 5000 },
      { x: 440, y: 625, value: 5000 },
      { x: 1110, y: 384, value: 5000 },
    ],
    guards: [
      {
        speed: 114,
        range: 270,
        fov: GUARD_FOV,
        waypoints: [
          { x: 190, y: 210, pause: 0.4 },
          { x: 190, y: 540, pause: 0.4 },
          { x: 400, y: 540, pause: 0.4 },
          { x: 400, y: 210, pause: 0.4 },
        ],
      },
      {
        speed: 122,
        range: 275,
        fov: GUARD_FOV,
        waypoints: [
          { x: 400, y: 170, pause: 0.35 },
          { x: 880, y: 170, pause: 0.35 },
        ],
      },
      {
        speed: 122,
        range: 275,
        fov: GUARD_FOV,
        waypoints: [
          { x: 880, y: 560, pause: 0.35 },
          { x: 400, y: 560, pause: 0.35 },
        ],
      },
      {
        speed: 118,
        range: 270,
        fov: GUARD_FOV,
        waypoints: [
          { x: 880, y: 210, pause: 0.4 },
          { x: 880, y: 540, pause: 0.4 },
          { x: 1090, y: 540, pause: 0.4 },
          { x: 1090, y: 210, pause: 0.4 },
        ],
      },
    ],
    cameras: [
      { x: 496, y: 248, minAngle: 2.2, maxAngle: 3.3, speed: 0.92, range: 290, fov: CAMERA_FOV },
      { x: 756, y: 478, minAngle: 1.9, maxAngle: 2.95, speed: 0.96, range: 285, fov: CAMERA_FOV },
      { x: 992, y: 98, minAngle: 0.35, maxAngle: 1.45, speed: 0.96, range: 300, fov: CAMERA_FOV },
    ],
  },
];

export function buildLevelData(index) {
  const spec = LEVELS[index];
  const walls = OUTER_WALLS.concat(spec.walls.map((w) => ({ ...w })));
  return {
    id: spec.id,
    name: spec.name,
    walls,
    shadows: spec.shadows.map((s) => ({ ...s })),
    door: { ...spec.door, open: false },
    vents: spec.vents.map((v) => ({ ...v })),
    terminal: { ...spec.terminal, hacked: false, progress: 0 },
    keycard: { ...spec.keycard, taken: false },
    safe: { ...spec.safe, value: spec.safeValue, cracked: false, progress: 0 },
    exit: { ...spec.exit },
    bonusLoot: spec.bonusLoot.map((item) => ({ ...item, r: 13, taken: false })),
    spawn: { ...spec.spawn },
    guardSpecs: spec.guards,
    cameraSpecs: spec.cameras,
  };
}

export function getSolidRects(level) {
  return level.door.open ? level.walls : level.walls.concat(level.door);
}

export function resolveCircleRects(entity, radius, rects) {
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    const cx = Math.max(r.x, Math.min(entity.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(entity.y, r.y + r.h));
    const dx = entity.x - cx;
    const dy = entity.y - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq < radius * radius) {
      if (distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const push = radius - dist;
        entity.x += (dx / dist) * push;
        entity.y += (dy / dist) * push;
      } else {
        const left = Math.abs(entity.x - r.x);
        const right = Math.abs(r.x + r.w - entity.x);
        const top = Math.abs(entity.y - r.y);
        const bottom = Math.abs(r.y + r.h - entity.y);
        const minEdge = Math.min(left, right, top, bottom);
        if (minEdge === left) entity.x = r.x - radius;
        else if (minEdge === right) entity.x = r.x + r.w + radius;
        else if (minEdge === top) entity.y = r.y - radius;
        else entity.y = r.y + r.h + radius;
      }
    }
  }
}

function rayAxisSlab(origin, dir, minB, maxB, tmin, tmax) {
  if (Math.abs(dir) < 1e-8) {
    if (origin < minB || origin > maxB) return null;
    return [tmin, tmax];
  }
  const inv = 1 / dir;
  let t1 = (minB - origin) * inv;
  let t2 = (maxB - origin) * inv;
  if (t1 > t2) {
    const tmp = t1;
    t1 = t2;
    t2 = tmp;
  }
  const nextMin = Math.max(tmin, t1);
  const nextMax = Math.min(tmax, t2);
  return nextMin > nextMax ? null : [nextMin, nextMax];
}

function rayRectDistance(ox, oy, dx, dy, maxDist, rect) {
  const xRange = rayAxisSlab(ox, dx, rect.x, rect.x + rect.w, 0, maxDist);
  if (!xRange) return maxDist;
  const yRange = rayAxisSlab(oy, dy, rect.y, rect.y + rect.h, xRange[0], xRange[1]);
  if (!yRange) return maxDist;
  return yRange[0] >= 0 && yRange[0] < maxDist ? yRange[0] : maxDist;
}

function rayCircleDistance(ox, oy, dx, dy, maxDist, cx, cy, r) {
  const fx = ox - cx;
  const fy = oy - cy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  if (c <= 0) return 0;
  const disc = b * b - 4 * c;
  if (disc < 0) return maxDist;
  const t = (-b - Math.sqrt(disc)) * 0.5;
  return t >= 0 && t < maxDist ? t : maxDist;
}

export function castVisionRay(ox, oy, angle, maxDist, rects, smokes) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (let i = 0; i < rects.length; i += 1) {
    const d = rayRectDistance(ox, oy, dx, dy, best, rects[i]);
    if (d < best) best = d;
  }
  if (smokes) {
    for (let i = 0; i < smokes.length; i += 1) {
      const s = smokes[i];
      const d = rayCircleDistance(ox, oy, dx, dy, best, s.x, s.y, s.radius * 0.86);
      if (d < best) best = d;
    }
  }
  return best;
}

export function buildVisionPolygon(ox, oy, angle, fov, range, rects, smokes, steps = 28) {
  const pts = [{ x: ox, y: oy }];
  const start = angle - fov * 0.5;
  const inc = fov / steps;
  for (let i = 0; i <= steps; i += 1) {
    const a = start + inc * i;
    const dist = castVisionRay(ox, oy, a, range, rects, smokes);
    pts.push({
      x: ox + Math.cos(a) * dist,
      y: oy + Math.sin(a) * dist,
    });
  }
  return pts;
}

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}
