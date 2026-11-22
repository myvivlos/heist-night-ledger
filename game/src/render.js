// Canvas 2D renderer: dark navy room, near-black shadows, red/cyan vision cones, actors, HUD, screens.
import { HUD_HEIGHT, VIEW_HEIGHT, VIEW_WIDTH } from './levels.js';
import { drawHud } from './hud.js';
import { drawScreenOverlay } from './screens.js';

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const PALETTE = {
  backdrop: '#050811',
  floor: '#0b1324',
  grid: '#131f38',
  shadow: '#03060c',
  shadowBorder: '#334155',
  wall: '#1e293b',
  wallEdge: '#3b4b63',
  gold: '#fbbf24',
  redCone: 'rgba(239, 68, 68, 0.36)',
  redStroke: 'rgba(252, 165, 165, 0.92)',
  cyanCone: 'rgba(34, 211, 238, 0.32)',
  cyanStroke: 'rgba(165, 243, 252, 0.92)',
  cyan: '#22d3ee',
  thief: '#f8fafc',
};

function drawPolygon(ctx, pts, fill, stroke) {
  if (!pts || pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(window.innerWidth * ratio));
    const height = Math.max(1, Math.round(window.innerHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    view.scale = Math.min(width / VIEW_WIDTH, height / VIEW_HEIGHT);
    view.x = (width - VIEW_WIDTH * view.scale) * 0.5;
    view.y = (height - VIEW_HEIGHT * view.scale) * 0.5;
  }

  function drawFloorAndShadows(level) {
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(24, 64, 1232, 640);

    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 44; x < 1240; x += 44) {
      ctx.moveTo(x, 76);
      ctx.lineTo(x, 692);
    }
    for (let y = 82; y < 692; y += 44) {
      ctx.moveTo(36, y);
      ctx.lineTo(1244, y);
    }
    ctx.stroke();

    for (let i = 0; i < level.shadows.length; i += 1) {
      const s = level.shadows[i];
      ctx.fillStyle = PALETTE.shadow;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeStyle = PALETTE.shadowBorder;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
      ctx.setLineDash([]);

      ctx.font = `700 10px ${MONO}`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SHADOW', s.x + s.w * 0.5, s.y + s.h * 0.5);
    }
  }

  function drawInteractables(level, pulsePhase) {
    if (level.vents.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(level.vents[0].x, level.vents[0].y);
      ctx.lineTo(level.vents[1].x, level.vents[1].y);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < level.vents.length; i += 1) {
      const v = level.vents[i];
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(v.x - 16, v.y - 16, 32, 32);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(v.x - 16, v.y - 16, 32, 32);
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      for (let g = -9; g <= 9; g += 6) {
        ctx.moveTo(v.x - 11, v.y + g);
        ctx.lineTo(v.x + 11, v.y + g);
      }
      ctx.stroke();
      ctx.font = `700 10px ${MONO}`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`VENT ${v.id}`, v.x, v.y - 20);
    }

    const term = level.terminal;
    ctx.fillStyle = term.hacked ? '#0f172a' : '#082f49';
    ctx.beginPath();
    ctx.roundRect(term.x - 16, term.y - 14, 32, 28, 4);
    ctx.fill();
    ctx.strokeStyle = term.hacked ? '#475569' : PALETTE.cyan;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = term.hacked ? '#334155' : PALETTE.cyan;
    ctx.fillRect(term.x - 10, term.y - 8, 20, 10);
    ctx.font = `700 10px ${MONO}`;
    ctx.fillStyle = term.hacked ? '#64748b' : '#67e8f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(term.hacked ? 'TERM OFF' : 'TERM', term.x, term.y - 18);

    if (!level.keycard.taken) {
      const k = level.keycard;
      const bob = Math.sin(pulsePhase * 4) * 2;
      ctx.fillStyle = '#0c4a6e';
      ctx.beginPath();
      ctx.roundRect(k.x - 13, k.y - 9 + bob, 26, 18, 3);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(k.x - 8, k.y - 3 + bob, 8, 5);
      ctx.font = `700 10px ${MONO}`;
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('KEYCARD', k.x, k.y - 13 + bob);
    }

    for (let i = 0; i < level.bonusLoot.length; i += 1) {
      const b = level.bonusLoot[i];
      if (b.taken) continue;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath();
      ctx.roundRect(b.x - 10, b.y - 8, 20, 16, 3);
      ctx.fill();
      ctx.font = `800 11px ${MONO}`;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', b.x, b.y + 0.5);
    }

    const safe = level.safe;
    if (!safe.cracked) {
      const glow = 0.18 + 0.08 * Math.sin(pulsePhase * 3.5);
      ctx.fillStyle = `rgba(251, 191, 36, ${glow})`;
      ctx.beginPath();
      ctx.arc(safe.x, safe.y, 35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = safe.cracked ? '#1e293b' : '#272013';
    ctx.beginPath();
    ctx.roundRect(safe.x - 21, safe.y - 21, 42, 42, 6);
    ctx.fill();
    ctx.strokeStyle = safe.cracked ? '#64748b' : PALETTE.gold;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.strokeStyle = safe.cracked ? '#475569' : '#fde68a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(safe.x, safe.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    if (safe.progress > 0 && !safe.cracked) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(safe.x, safe.y, 28, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * safe.progress);
      ctx.stroke();
    }

    ctx.font = `800 11px ${MONO}`;
    ctx.fillStyle = safe.cracked ? '#94a3b8' : PALETTE.gold;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(safe.cracked ? 'OPEN' : 'SAFE', safe.x, safe.y - 25);

    const exit = level.exit;
    const exitReady = safe.cracked;
    if (exitReady) {
      const pulse = 0.24 + 0.12 * Math.sin(pulsePhase * 5);
      ctx.fillStyle = `rgba(251, 191, 36, ${pulse})`;
      ctx.beginPath();
      ctx.arc(exit.x, exit.y, exit.r + 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = exitReady ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.08)';
    ctx.beginPath();
    ctx.roundRect(exit.x - 24, exit.y - 24, 48, 48, 8);
    ctx.fill();
    ctx.strokeStyle = exitReady ? PALETTE.gold : '#b45309';
    ctx.lineWidth = exitReady ? 3 : 2;
    ctx.stroke();

    ctx.font = `800 12px ${MONO}`;
    ctx.fillStyle = exitReady ? '#fde68a' : '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', exit.x, exit.y);
  }

  function drawWallsAndDoor(level) {
    for (let i = 0; i < level.walls.length; i += 1) {
      const w = level.walls[i];
      ctx.fillStyle = PALETTE.wall;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = PALETTE.wallEdge;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x + 0.75, w.y + 0.75, w.w - 1.5, w.h - 1.5);
    }

    const d = level.door;
    if (!d.open) {
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x + 1, d.y + 1, d.w - 2, d.h - 2);
      ctx.font = `700 10px ${MONO}`;
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('LOCK', d.x + d.w * 0.5, d.y - 4);
    } else {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);
      ctx.setLineDash([]);
    }
  }

  function drawCones(state) {
    for (let i = 0; i < state.cameras.length; i += 1) {
      const cam = state.cameras[i];
      if (!cam.disabled) {
        drawPolygon(ctx, cam.conePoly, PALETTE.cyanCone, PALETTE.cyanStroke);
      }
    }
    for (let i = 0; i < state.guards.length; i += 1) {
      drawPolygon(ctx, state.guards[i].conePoly, PALETTE.redCone, PALETTE.redStroke);
    }
  }

  function drawSmokesAndRipples(state) {
    for (let i = 0; i < state.ripples.length; i += 1) {
      const r = state.ripples[i];
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < state.smokes.length; i += 1) {
      const s = state.smokes[i];
      const alpha = Math.min(1, s.life / 1.2) * 0.72;
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.55})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(226, 232, 240, ${alpha * 0.45})`;
      ctx.beginPath();
      ctx.arc(s.x - 16, s.y - 10, s.radius * 0.62, 0, Math.PI * 2);
      ctx.arc(s.x + 18, s.y + 8, s.radius * 0.58, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(226, 232, 240, ${alpha * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawActors(state) {
    for (let i = 0; i < state.cameras.length; i += 1) {
      const cam = state.cameras[i];
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.rotate(cam.angle);
      ctx.fillStyle = cam.disabled ? '#334155' : '#0e7490';
      ctx.beginPath();
      ctx.roundRect(-8, -8, 18, 16, 4);
      ctx.fill();
      ctx.strokeStyle = cam.disabled ? '#64748b' : PALETTE.cyan;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = cam.disabled ? '#475569' : '#67e8f9';
      ctx.fillRect(8, -3, 6, 6);
      ctx.restore();

      if (cam.disabled) {
        ctx.font = `700 9px ${MONO}`;
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('OFF', cam.x, cam.y - 12);
      }
    }

    for (let i = 0; i < state.guards.length; i += 1) {
      const g = state.guards[i];
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);

      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.roundRect(-10, -14, 18, 28, 7);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(7, -2.5, 9, 5);
      ctx.restore();

      if (g.alertTimer > 0) {
        ctx.font = `900 14px ${MONO}`;
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('!', g.x, g.y - 18);
      }
    }

    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.crouching) {
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.rotate(p.angle);
    const bodyScale = p.crouching ? 0.84 : 1;
    ctx.scale(bodyScale, bodyScale);

    ctx.fillStyle = p.inShadow ? '#cbd5e1' : '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-9, -13, 16, 26, 7);
    ctx.fill();

    ctx.fillStyle = PALETTE.thief;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = state.spotted ? '#ef4444' : '#0f172a';
    ctx.lineWidth = state.spotted ? 2.5 : 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(17, 0);
    ctx.lineTo(7, -5);
    ctx.lineTo(7, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (p.promptText && state.screen === 'play') {
      ctx.font = `700 11px ${MONO}`;
      const pad = 10;
      const textW = ctx.measureText(p.promptText).width;
      const bx = Math.max(40 + textW * 0.5, Math.min(VIEW_WIDTH - 40 - textW * 0.5, p.x));
      const by = Math.max(HUD_HEIGHT + 24, p.y - 28);
      ctx.fillStyle = 'rgba(7, 12, 23, 0.9)';
      ctx.beginPath();
      ctx.roundRect(bx - textW * 0.5 - pad, by - 11, textW + pad * 2, 22, 5);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.promptText, bx, by);
    }

    for (let i = 0; i < state.effects.length; i += 1) {
      const e = state.effects[i];
      ctx.font = `800 12px ${MONO}`;
      ctx.fillStyle = e.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.text, e.x, e.y);
    }
  }

  function drawBanner(state) {
    if (state.screen !== 'play' || state.levelBannerTimer <= 0) return;
    const alpha = Math.min(1, state.levelBannerTimer / 0.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(7, 12, 23, 0.88)';
    ctx.beginPath();
    ctx.roundRect(VIEW_WIDTH * 0.5 - 210, 76, 420, 38, 8);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = `800 15px ${MONO}`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.levelBannerText, VIEW_WIDTH * 0.5, 95);
    ctx.restore();
  }

  return {
    draw(state) {
      resize();
      ctx.save();
      ctx.fillStyle = PALETTE.backdrop;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.translate(view.x, view.y);
      ctx.scale(view.scale, view.scale);

      drawFloorAndShadows(state.level);
      drawCones(state);
      drawInteractables(state.level, state.pulsePhase);
      drawWallsAndDoor(state.level);
      drawSmokesAndRipples(state);
      drawActors(state);
      drawBanner(state);
      drawHud(ctx, state);
      drawScreenOverlay(ctx, state);

      ctx.restore();
    },
  };
}
