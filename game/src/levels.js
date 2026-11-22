/**
 * Room layouts (30x15 grid @ 40px tiles = 1200x600 playfield),
 * shared collision helpers, and raycasted vision geometry.
 */

export const TILE = 40;
export const GRID_COLS = 30;
export const GRID_ROWS = 15;
export const ROOM_X = 40;
export const ROOM_Y = 84;
export const ROOM_W = GRID_COLS * TILE; // 1200
export const ROOM_H = GRID_ROWS * TILE; // 600

export function tileCenter(col, row) {
  return {
    x: ROOM_X + col * TILE,
    y: ROOM_Y + row * TILE,
  };
}

export function tileRect(col, row, wCols = 1, hRows = 1) {
  return {
    x: ROOM_X + col * TILE,
    y: ROOM_Y + row * TILE,
    w: wCols * TILE,
    h: hRows * TILE,
  };
}

function wp(col, row, pause = 0.65) {
  const p = tileCenter(col, row);
  return { x: p.x, y: p.y, pause };
}

export const LEVEL_SPECS = [
  {
    id: 1,
    name: 'THE CONSULATE VAULT',
    safeValue: 5000,
    lootValue: 1200,
    guardSpeed: 68,
    guardRange: 235,
    cameraRange: 245,
    cameraSpeed: 0.95,
    spawn: { col: 2.5, row: 12.2 },
    exit: { col: 27.5, row: 12.5 },
    safe: { col: 27.5, row: 7.5 },
    terminal: { col: 9.5, row: 2.3 },
    keycard: { col: 14.5, row: 12.3 },
    doors: [{ col: 19, row: 7 }],
    vents: [
      { id: 'A1', col: 2.5, row: 2.3, targetIndex: 1 },
      { id: 'A2', col: 22.5, row: 2.3, targetIndex: 0 },
    ],
    loot: [
      { col: 15.5, row: 2.3 },
      { col: 22.2, row: 5.5 },
      { col: 8.5, row: 12.2 },
    ],
    shadows: [
      { col: 4.1, row: 10.7, w: 2.6, h: 2.3 },
      { col: 11.4, row: 10.6, w: 3.1, h: 2.3 },
      { col: 1.3, row: 5.3, w: 2.4, h: 2.4 },
      { col: 15.2, row: 1.3, w: 2.5, h: 1.8 },
    ],
    grid: [
      '##############################',
      '#.....#............#.........#',
      '#.....#............#.........#',
      '#.....#............#.........#',
      '#..#..####....###..####..##..#',
      '#..................#.........#',
      '#......###.........#.........#',
      '#......###.........#.........#',
      '#......###.........#.........#',
      '#..................#.........#',
      '#..#...............#####..####',
      '#..#.........................#',
      '#............................#',
      '#.....###..........###.......#',
      '##############################',
    ],
    guards: [
      {
        waypoints: [wp(11.8, 5.5, 0.7), wp(17.2, 5.5, 0.7), wp(17.2, 9.5, 0.7), wp(11.8, 9.5, 0.7)],
        startIndex: 0,
        startAngle: 0,
      },
      {
        waypoints: [wp(21.5, 5.7, 0.6), wp(25.6, 5.7, 0.6), wp(25.6, 8.9, 0.6), wp(21.5, 8.9, 0.6)],
        startIndex: 1,
        startAngle: Math.PI / 2,
      },
    ],
    cameras: [
      { col: 13.5, row: 1.2, baseAngle: Math.PI / 2, sweepAmp: 0.62, phase: 0.4 },
      { col: 28.75, row: 11.3, baseAngle: Math.PI, sweepAmp: 0.52, phase: 1.8 },
    ],
  },
  {
    id: 2,
    name: 'ARCHIVE ANNEX',
    safeValue: 7500,
    lootValue: 1500,
    guardSpeed: 84,
    guardRange: 245,
    cameraRange: 255,
    cameraSpeed: 1.15,
    spawn: { col: 2.2, row: 12.5 },
    exit: { col: 27.5, row: 2.2 },
    safe: { col: 27.3, row: 12.2 },
    terminal: { col: 4.5, row: 2.2 },
    keycard: { col: 15.5, row: 2.2 },
    doors: [{ col: 20, row: 11 }],
    vents: [
      { id: 'B1', col: 2.3, row: 5.5, targetIndex: 1 },
      { id: 'B2', col: 22.5, row: 5.5, targetIndex: 0 },
    ],
    loot: [
      { col: 11.5, row: 2.2 },
      { col: 15.5, row: 7.5 },
      { col: 22.5, row: 12.2 },
    ],
    shadows: [
      { col: 4.4, row: 11.3, w: 2.5, h: 2.2 },
      { col: 10.5, row: 11.4, w: 3.0, h: 2.1 },
      { col: 7.3, row: 5.0, w: 2.4, h: 2.4 },
      { col: 19.3, row: 1.4, w: 2.4, h: 2.1 },
    ],
    grid: [
      '##############################',
      '#.......#..........#.........#',
      '#.......#..........#.........#',
      '#.......#..........#.........#',
      '#..###..###...###..####..##..#',
      '#............................#',
      '#.....##....###........###...#',
      '#.....##....###........###...#',
      '#............................#',
      '#..#........###....#####..####',
      '#..#...............#.........#',
      '#..####............#.........#',
      '#..................#.........#',
      '#..........###.....#.........#',
      '##############################',
    ],
    guards: [
      {
        waypoints: [wp(8.5, 5.2, 0.55), wp(18.5, 5.2, 0.55), wp(18.5, 8.3, 0.55), wp(8.5, 8.3, 0.55)],
        startIndex: 0,
        startAngle: 0,
      },
      {
        waypoints: [wp(11.5, 2.3, 0.55), wp(17.5, 2.3, 0.55)],
        startIndex: 0,
        startAngle: Math.PI,
      },
      {
        waypoints: [wp(22.0, 10.6, 0.5), wp(26.5, 10.6, 0.5), wp(26.5, 13.0, 0.5), wp(22.0, 13.0, 0.5)],
        startIndex: 2,
        startAngle: -Math.PI / 2,
      },
    ],
    cameras: [
      { col: 2.2, row: 8.5, baseAngle: 0, sweepAmp: 0.55, phase: 0.2 },
      { col: 20.5, row: 4.8, baseAngle: Math.PI / 2, sweepAmp: 0.65, phase: 1.5 },
      { col: 28.75, row: 3.8, baseAngle: Math.PI, sweepAmp: 0.55, phase: 2.7 },
    ],
  },
  {
    id: 3,
    name: 'CENTRAL LEDGER HOUSE',
    safeValue: 10000,
    lootValue: 2000,
    guardSpeed: 98,
    guardRange: 255,
    cameraRange: 265,
    cameraSpeed: 1.35,
    spawn: { col: 2.2, row: 7.5 },
    exit: { col: 27.5, row: 7.5 },
    safe: { col: 26.8, row: 2.5 },
    terminal: { col: 8.5, row: 12.3 },
    keycard: { col: 8.5, row: 2.3 },
    doors: [{ col: 21, row: 3 }],
    vents: [
      { id: 'C1', col: 2.3, row: 2.3, targetIndex: 1 },
      { id: 'C2', col: 22.8, row: 12.2, targetIndex: 0 },
    ],
    loot: [
      { col: 14.5, row: 2.3 },
      { col: 14.5, row: 12.3 },
      { col: 24.5, row: 12.3 },
    ],
    shadows: [
      { col: 4.2, row: 6.3, w: 2.2, h: 2.4 },
      { col: 11.2, row: 5.5, w: 2.5, h: 4.0 },
      { col: 17.2, row: 1.3, w: 2.4, h: 2.2 },
      { col: 17.2, row: 11.3, w: 2.4, h: 2.2 },
    ],
    grid: [
      '##############################',
      '#.....#...........#..........#',
      '#.....#...........#..........#',
      '#..#..#...........#..........#',
      '#..#..###....###..####..###..#',
      '#..#.........................#',
      '#.......##....##.....####....#',
      '#.......##....##.....####....#',
      '#.......##....##.....####....#',
      '#..#.........................#',
      '#..#..###....###..####..###..#',
      '#..#..#...........#..........#',
      '#.....#...........#..........#',
      '#.....#...........#..........#',
      '##############################',
    ],
    guards: [
      {
        waypoints: [wp(7.2, 5.2, 0.45), wp(19.2, 5.2, 0.45), wp(19.2, 9.6, 0.45), wp(7.2, 9.6, 0.45)],
        startIndex: 0,
        startAngle: 0,
      },
      {
        waypoints: [wp(11.2, 2.3, 0.45), wp(17.2, 2.3, 0.45)],
        startIndex: 1,
        startAngle: Math.PI,
      },
      {
        waypoints: [wp(22.5, 2.2, 0.45), wp(28.0, 2.2, 0.45), wp(28.0, 4.8, 0.45), wp(22.5, 4.8, 0.45)],
        startIndex: 2,
        startAngle: Math.PI,
      },
      {
        waypoints: [wp(21.5, 11.5, 0.45), wp(27.5, 11.5, 0.45), wp(27.5, 13.0, 0.45), wp(21.5, 13.0, 0.45)],
        startIndex: 0,
        startAngle: 0,
      },
    ],
    cameras: [
      { col: 10.5, row: 1.2, baseAngle: Math.PI / 2, sweepAmp: 0.65, phase: 0.1 },
      { col: 10.5, row: 13.8, baseAngle: -Math.PI / 2, sweepAmp: 0.65, phase: 1.4 },
      { col: 20.5, row: 5.2, baseAngle: 0, sweepAmp: 0.6, phase: 2.2 },
      { col: 28.75, row: 9.5, baseAngle: Math.PI, sweepAmp: 0.58, phase: 3.1 },
    ],
  },
];

/**
 * Builds mutable runtime level geometry and entities from a spec.
 */
export function buildLevelInstance(levelIndex) {
  const spec = LEVEL_SPECS[Math.max(0, Math.min(LEVEL_SPECS.length - 1, levelIndex))];
  const walls = [];
  const wallSet = new Set();

  for (let r = 0; r < GRID_ROWS; r++) {
    const rowStr = spec.grid[r];
    for (let c = 0; c < GRID_COLS; c++) {
      if (rowStr[c] === '#') {
        walls.push(tileRect(c, r));
        wallSet.add(`${c},${r}`);
      }
    }
  }

  const doors = spec.doors.map((d) => ({
    ...tileRect(d.col, d.row),
    col: d.col,
    row: d.row,
    cx: ROOM_X + (d.col + 0.5) * TILE,
    cy: ROOM_Y + (d.row + 0.5) * TILE,
    open: false,
  }));

  const vents = spec.vents.map((v) => ({
    id: v.id,
    ...tileCenter(v.col, v.row),
    targetIndex: v.targetIndex,
    radius: 16,
  }));

  const safePos = tileCenter(spec.safe.col, spec.safe.row);
  const safe = {
    x: safePos.x,
    y: safePos.y,
    size: 38,
    value: spec.safeValue,
    progress: 0,
    duration: 3.0,
    cracked: false,
    pauseTimer: 0,
  };

  const exitPos = tileCenter(spec.exit.col, spec.exit.row);
  const exit = {
    x: exitPos.x,
    y: exitPos.y,
    w: 44,
    h: 44,
  };

  const termPos = tileCenter(spec.terminal.col, spec.terminal.row);
  const terminal = {
    x: termPos.x,
    y: termPos.y,
    radius: 17,
    hacked: false,
  };

  const keyPos = tileCenter(spec.keycard.col, spec.keycard.row);
  const keycard = {
    x: keyPos.x,
    y: keyPos.y,
    radius: 14,
    collected: false,
  };

  const loot = spec.loot.map((l, idx) => ({
    id: idx,
    ...tileCenter(l.col, l.row),
    value: spec.lootValue,
    radius: 13,
    collected: false,
  }));

  const shadowZones = spec.shadows.map((s) => tileRect(s.col, s.row, s.w, s.h));

  return {
    spec,
    walls,
    wallSet,
    doors,
    vents,
    safe,
    exit,
    terminal,
    keycard,
    loot,
    shadowZones,
    smokeClouds: [],
    spawn: tileCenter(spec.spawn.col, spec.spawn.row),
  };
}

export function getSolidRects(level) {
  const solids = level.walls.slice();
  for (const door of level.doors) {
    if (!door.open) solids.push(door);
  }
  return solids;
}

export function isPointInShadow(x, y, level) {
  for (const z of level.shadowZones) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
      return true;
    }
  }
  return false;
}

export function isPointInSmoke(x, y, level) {
  for (const s of level.smokeClouds) {
    const dx = x - s.x;
    const dy = y - s.y;
    if (dx * dx + dy * dy <= s.radius * s.radius) return true;
  }
  return false;
}

function rayRectDistance(ox, oy, dx, dy, rect, maxDist) {
  let tmin = 0;
  let tmax = maxDist;

  if (Math.abs(dx) < 1e-8) {
    if (ox < rect.x || ox > rect.x + rect.w) return maxDist;
  } else {
    const inv = 1 / dx;
    let t1 = (rect.x - ox) * inv;
    let t2 = (rect.x + rect.w - ox) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return maxDist;
  }

  if (Math.abs(dy) < 1e-8) {
    if (oy < rect.y || oy > rect.y + rect.h) return maxDist;
  } else {
    const inv = 1 / dy;
    let t1 = (rect.y - oy) * inv;
    let t2 = (rect.y + rect.h - oy) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return maxDist;
  }

  return tmin >= 0 && tmin < maxDist ? tmin : maxDist;
}

function rayCircleDistance(ox, oy, dx, dy, cx, cy, r, maxDist) {
  const fx = ox - cx;
  const fy = oy - cy;
  const c = fx * fx + fy * fy - r * r;
  if (c <= 0) return 0; // Origin is inside smoke
  const b = 2 * (fx * dx + fy * dy);
  const disc = b * b - 4 * c;
  if (disc < 0) return maxDist;
  const sqrtDisc = Math.sqrt(disc);
  const t = (-b - sqrtDisc) / 2;
  return t >= 0 && t < maxDist ? t : maxDist;
}

/**
 * Casts a ray from (ox, oy) along unit direction (dx, dy) against walls, closed doors, and smoke.
 */
export function castVisionRay(ox, oy, angle, maxDist, level) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;

  for (const w of level.walls) {
    const t = rayRectDistance(ox, oy, dx, dy, w.x, w.y, w.w, w.h, best);
    if (t < best) best = t;
  }
  for (const d of level.doors) {
    if (!d.open) {
      const t = rayRectDistance(ox, oy, dx, dy, d.x, d.y, d.w, d.h, best);
      if (t < best) best = t;
    }
  }
  for (const s of level.smokeClouds) {
    const t = rayCircleDistance(ox, oy, dx, dy, s.x, s.y, s.radius, best);
    if (t < best) best = t;
  }

  return best;
}

/**
 * Computes a raycasted vision cone polygon for guards or cameras.
 */
export function computeVisionPolygon(ox, oy, facingAngle, fovRad, maxRange, level, steps = 40) {
  const points = [{ x: ox, y: oy }];
  const start = facingAngle - fovRad / 2;
  for (let i = 0; i <= steps; i++) {
    const a = start + (fovRad * i) / steps;
    const dist = castVisionRay(ox, oy, a, maxRange, level);
    points.push({
      x: ox + Math.cos(a) * dist,
      y: oy + Math.sin(a) * dist,
    });
  }
  return points;
}

export function hasLineOfSight(x1, y1, x2, y2, level) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-4) return true;
  const angle = Math.atan2(dy, dx);
  const hit = castVisionRay(x1, y1, angle, dist, level);
  return hit >= dist - 3;
}

/**
 * Resolves circle vs AABB collision so the thief slides cleanly around wall corners.
 */
export function resolveCircleWallCollisions(entity, level) {
  const solids = getSolidRects(level);
  for (let pass = 0; pass < 2; pass++) {
    for (const r of solids) {
      const closestX = Math.max(r.x, Math.min(entity.x, r.x + r.w));
      const closestY = Math.max(r.y, Math.min(entity.y, r.y + r.h));
      const dx = entity.x - closestX;
      const dy = entity.y - closestY;
      const distSq = dx * dx + dy * dy;
      if (distSq < entity.radius * entity.radius) {
        const dist = Math.sqrt(distSq);
        if (dist > 1e-5) {
          const push = entity.radius - dist;
          entity.x += (dx / dist) * push;
          entity.y += (dy / dist) * push;
        } else {
          // Fallback push out along shallowest axis
          const left = entity.x - r.x;
          const right = r.x + r.w - entity.x;
          const top = entity.y - r.y;
          const bottom = r.y + r.h - entity.y;
          const minPen = Math.min(left, right, top, bottom);
          if (minPen === left) entity.x = r.x - entity.radius;
          else if (minPen === right) entity.x = r.x + r.w + entity.radius;
          else if (minPen === top) entity.y = r.y - entity.radius;
          else entity.y = r.y + r.h + entity.radius;
        }
      }
    }
  }
}
