/**
 * Deterministic seeded PRNG (Mulberry32).
 */
export function createRng(seed = 1) {
  let state = (Number(seed) || 1) >>> 0;
  if (state === 0) state = 0x6d2b79f5;

  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function range(min, max) {
    return min + (max - min) * next();
  }

  function int(min, maxInclusive) {
    return Math.floor(range(min, maxInclusive + 1));
  }

  function pick(items) {
    if (!items || items.length === 0) return undefined;
    return items[Math.floor(next() * items.length)];
  }

  return { next, range, int, pick, seed: state };
}
