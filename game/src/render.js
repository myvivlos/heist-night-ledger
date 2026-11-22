import { ROOM_X, ROOM_Y, ROOM_W, ROOM_H } from './levels.js';

function drawVisionCone(ctx, originX, originY, polygon, range, rgbBase, rgbEdge) {
  if (!polygon || polygon.length < 3) return;
  const grad = ctx.createRadialGradient(originX, originY, 6, originX, originY, range);
  grad.addColorStop(0, `rgba(${rgbBase}, 0.36)`);
  grad.addColorStop(0.7, `rgba(${rgbBase}, 0.22)`);
  grad.addColorStop(1, `rgba(${rgbBase}, 0.08)`);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = `rgba(${rgbEdge}, 0.85)`;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

function drawFloorAndGrid(ctx) {
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, 1280, 720);

  ctx.fillStyle = '#0d1526';
  ctx.fillRect(ROOM_X, ROOM_Y, ROOM_W, ROOM_H);

  ctx.strokeStyle = '#142038';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ROOM_X; x <= ROOM_X + ROOM_W; x += 40) {
    ctx.moveTo(x, ROOM_Y);
    ctx.lineTo(x, ROOM_Y + ROOM_H);
  }
  for (let y = ROOM_Y; y <= ROOM_Y + ROOM_H; y += 40) {
    ctx.moveTo(ROOM_X, y);
    ctx.lineTo(ROOM_X + ROOM_W, y);
  }
  ctx.stroke();
}

function drawShadowZones(ctx, shadowZones) {
  for (const z of shadowZones) {
    ctx.save();
    ctx.fillStyle = '#050811';
    ctx.fillRect(z.x, z.y, z.w, z.h);

    ctx.beginPath();
    ctx.rect(z.x, z.y, z.w, z.h);
    ctx.clip();

    ctx.strokeStyle = 'rgba(56, 82, 130, 0.16)';
    ctx.lineWidth = 1;
    for (let sx = z.x - z.h; sx < z.x + z.w + z.h; sx += 12) {
      ctx.moveTo(sx, z.y);
      ctx.lineTo(sx + z.h, z.y + z.h);
    }
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = '#1f2f4f';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(z.x + 1, z.y + 1, z.w - 2, z.h - 2);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(120, 145, 190, 0.42)';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SHADOW', z.x + 6, z.y + 13);
  }
}

function drawVents(ctx, vents) {
  if (vents.length >= 2) {
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 130, 175, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(vents[0].x, vents[0].y);
    ctx.lineTo(vents[1].x, vents[1].y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  for (const v of vents) {
    ctx.fillStyle = '#18243b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(v.x - 14, v.y - 14, 28, 28);
    ctx.strokeRect(v.x - 14, v.y - 14, 28, 28);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    for (let i = -8; i <= 8; i += 5) {
      ctx.beginPath();
      ctx.moveTo(v.x - 9, v.y + i);
      ctx.lineTo(v.x + 9, v.y + i);
      ctx.stroke();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VENT', v.x, v.y + 24);
  }
}

function drawExitAndSafe(ctx, level, elapsed) {
  const { exit, safe } = level;
  const pulse = 0.65 + 0.35 * Math.sin(elapsed * 4.2);

  // Exit door
  ctx.save();
  const exitActive = safe.cracked;
  ctx.fillStyle = exitActive ? `rgba(255, 209, 102, ${0.24 + pulse * 0.14})` : 'rgba(244, 196, 78, 0.12)';
  ctx.fillRect(exit.x - exit.w / 2, exit.y - exit.h / 2, exit.w, exit.h);
  ctx.strokeStyle = exitActive ? '#ffd166' : '#b88b2e';
  ctx.lineWidth = exitActive ? 3 : 2;
  ctx.strokeRect(exit.x - exit.w / 2, exit.y - exit.h / 2, exit.w, exit.h);

  ctx.fillStyle = exitActive ? '#ffd166' : '#e0b354';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', exit.x, exit.y);
  ctx.restore();

  // Vault safe
  ctx.save();
  const half = safe.size / 2;
  ctx.fillStyle = safe.cracked ? '#1b263b' : '#2a3752';
  ctx.strokeStyle = safe.cracked ? '#64748b' : '#ffd166';
  ctx.lineWidth = 2.5;
  ctx.fillRect(safe.x - half, safe.y - half, safe.size, safe.size);
  ctx.strokeRect(safe.x - half, safe.y - half, safe.size, safe.size);

  // Safe dial
  ctx.beginPath();
  ctx.arc(safe.x, safe.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = safe.cracked ? '#0f172a' : '#f4c44e';
  ctx.fill();
  ctx.strokeStyle = '#090e1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (!safe.cracked) {
    const dialAngle = (safe.progress / safe.duration) * Math.PI * 6;
    ctx.beginPath();
    ctx.moveTo(safe.x, safe.y);
    ctx.lineTo(safe.x + Math.cos(dialAngle) * 8, safe.y + Math.sin(dialAngle) * 8);
    ctx.strokeStyle = '#090e1a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.fillStyle = safe.cracked ? '#94a3b8' : '#ffd166';
  ctx.font = 'bold 10px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(safe.cracked ? 'OPEN' : 'SAFE', safe.x, safe.y + half + 12);

  // Safe cracking progress bar directly above safe
  if (!safe.cracked && safe.progress > 0) {
    const bw = 54;
    const bh = 8;
    const bx = safe.x - bw / 2;
    const by = safe.y - half - 16;
    ctx.fillStyle = '#060a13';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(bx + 1, by + 1, (bw - 2) * (safe.progress / safe.duration), bh - 2);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
  }
  ctx.restore();
}

function drawTerminalAndKeycardAndLoot(ctx, level, elapsed) {
  const { terminal, keycard, loot, doors } = level;

  // Keycard doors
  for (const d of doors) {
    if (d.open) {
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = '#332215';
      ctx.fillRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCK', d.cx, d.cy);
    }
  }

  // Security terminal
  ctx.save();
  ctx.fillStyle = terminal.hacked ? '#132033' : '#0b2c3d';
  ctx.strokeStyle = terminal.hacked ? '#64748b' : '#38e8ff';
  ctx.lineWidth = 2;
  ctx.fillRect(terminal.x - 14, terminal.y - 12, 28, 24);
  ctx.strokeRect(terminal.x - 14, terminal.y - 12, 28, 24);
  ctx.fillStyle = terminal.hacked ? '#475569' : '#38e8ff';
  ctx.fillRect(terminal.x - 9, terminal.y - 7, 18, 8);
  ctx.font = 'bold 9px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(terminal.hacked ? 'OFF' : 'TERM', terminal.x, terminal.y + 22);
  ctx.restore();

  // Keycard pickup
  if (!keycard.collected) {
    const bob = Math.sin(elapsed * 3.5) * 2;
    ctx.save();
    ctx.fillStyle = '#38e8ff';
    ctx.strokeStyle = '#070b14';
    ctx.lineWidth = 1.5;
    ctx.fillRect(keycard.x - 11, keycard.y - 7 + bob, 22, 14);
    ctx.strokeRect(keycard.x - 11, keycard.y - 7 + bob, 22, 14);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(keycard.x - 7, keycard.y - 3 + bob, 6, 4);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CARD', keycard.x, keycard.y + 19);
    ctx.restore();
  }

  // Gold loot stacks
  for (const item of loot) {
    if (item.collected) continue;
    const gleam = 0.75 + 0.25 * Math.sin(elapsed * 4 + item.id);
    ctx.save();
    ctx.fillStyle = `rgba(255, 209, 102, ${0.22 * gleam})`;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = '#8a5a00';
    ctx.lineWidth = 1.5;
    ctx.fillRect(item.x - 11, item.y - 6, 10, 6);
    ctx.strokeRect(item.x - 11, item.y - 6, 10, 6);
    ctx.fillRect(item.x + 1, item.y - 6, 10, 6);
    ctx.strokeRect(item.x + 1, item.y - 6, 10, 6);
    ctx.fillRect(item.x - 5, item.y + 1, 10, 6);
    ctx.strokeRect(item.x - 5, item.y + 1, 10, 6);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 9px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GOLD', item.x, item.y + 18);
    ctx.restore();
  }
}

function drawWalls(ctx, walls) {
  ctx.save();
  ctx.fillStyle = '#1b2842';
  ctx.strokeStyle = '#476396';
  ctx.lineWidth = 1.5;
  for (const w of walls) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }
  ctx.restore();
}

function drawSmokeClouds(ctx, smokeClouds) {
  for (const s of smokeClouds) {
    const fade = Math.min(1, s.ttl / 1.2);
    ctx.save();
    ctx.globalAlpha = 0.78 * fade;
    const grad = ctx.createRadialGradient(s.x, s.y, 10, s.x, s.y, s.radius);
    grad.addColorStop(0, 'rgba(148, 163, 184, 0.85)');
    grad.addColorStop(0.65, 'rgba(100, 116, 139, 0.58)');
    grad.addColorStop(1, 'rgba(71, 85, 105, 0.05)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.restore();
  }
}

function drawCameras(ctx, cameras) {
  for (const cam of cameras) {
    if (cam.active) {
      drawVisionCone(ctx, cam.x, cam.y, cam.cone, cam.range, '56, 232, 255', '96, 244, 255');
    }

    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(cam.angle);
    ctx.fillStyle = cam.active ? '#0e2c3d' : '#1e293b';
    ctx.strokeStyle = cam.active ? '#38e8ff' : '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(-8, -6, 16, 12);
    ctx.strokeRect(-8, -6, 16, 12);
    // Lens barrel
    ctx.fillStyle = cam.active ? '#38e8ff' : '#64748b';
    ctx.fillRect(6, -3, 6, 6);
    ctx.restore();
  }
}

function drawGuards(ctx, guards) {
  for (const g of guards) {
    drawVisionCone(ctx, g.x, g.y, g.cone, g.range, '255, 59, 92', '255, 110, 135');

    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);

    // Shoulders
    ctx.fillStyle = '#2b1220';
    ctx.strokeStyle = g.alertLevel === 2 ? '#ff8fa3' : '#ff3b5c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Facing visor tick
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath();
    ctx.moveTo(g.radius - 2, -5);
    ctx.lineTo(g.radius + 7, 0);
    ctx.lineTo(g.radius - 2, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (g.alertLevel > 0) {
      ctx.fillStyle = g.alertLevel === 2 ? '#ff4d6d' : '#fbbf24';
      ctx.font = 'bold 14px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(g.alertLevel === 2 ? '!' : '?', g.x, g.y - 20);
    }
  }
}

function drawPlayer(ctx, player) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Stance / cover ring
  if (player.stance === 'crouch') {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (player.stance === 'sprint') {
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(player.angle);
  const bodyRadius = player.stance === 'crouch' ? player.radius - 2 : player.radius;

  // Crisp white silhouette with dark rim
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#070b14';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Clear directional facing tick
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#070b14';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(bodyRadius - 2, -5);
  ctx.lineTo(bodyRadius + 8, 0);
  ctx.lineTo(bodyRadius - 2, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner hood dot for unmistakable contrast
  ctx.fillStyle = player.inShadow ? '#38e8ff' : '#0f172a';
  ctx.beginPath();
  ctx.arc(-2, 0, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPromptsAndPopups(ctx, state) {
  const { player, popups } = state;

  if (player.nearbyPrompt && state.scene === 'play') {
    const { x, y, text, color } = player.nearbyPrompt;
    ctx.save();
    ctx.font = 'bold 11px ui-monospace, monospace';
    const w = ctx.measureText(text).width + 16;
    const h = 22;
    ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }

  for (const p of popups) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.ttl));
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#070b14';
    ctx.fillText(p.text, p.x + 1, p.y + 1);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}

/**
 * Renders the full heist room, cones, actors, smoke, and alarm vignette.
 */
export function renderWorld(ctx, state) {
  const { level, guards, cameras, player, elapsed, alarm } = state;

  drawFloorAndGrid(ctx);
  drawShadowZones(ctx, level.shadowZones);
  drawVents(ctx, level.vents);
  drawExitAndSafe(ctx, level, elapsed);
  drawTerminalAndKeycardAndLoot(ctx, level, elapsed);
  drawCameras(ctx, cameras);
  drawGuards(ctx, guards);
  drawWalls(ctx, level.walls);
  drawSmokeClouds(ctx, level.smokeClouds);
  drawPlayer(ctx, player);
  drawPromptsAndPopups(ctx, state);

  // Subtle red alert border pulse when alarm rises
  if (alarm > 15) {
    const intensity = Math.min(0.32, (alarm / 100) * 0.32);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 59, 92, ${intensity + 0.25})`;
    ctx.lineWidth = 8;
    ctx.strokeRect(ROOM_X, ROOM_Y, ROOM_W, ROOM_H);
    ctx.restore();
  }
}
