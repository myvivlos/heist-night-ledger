function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Draws the top tactical HUD bar and bottom control strip.
 */
export function renderHud(ctx, state) {
  const { alarm, level, loot, player, levelIndex, totalLevels, elapsed, scene } = state;

  // Top HUD bar background
  ctx.save();
  ctx.fillStyle = '#090f1d';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.strokeStyle = '#253759';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(1280, 64);
  ctx.stroke();

  // 1. ALARM segmented meter + border + percentage
  const alarmPct = Math.round(alarm);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('ALARM', 28, 22);

  const meterX = 28;
  const meterY = 29;
  const segments = 10;
  const segW = 14;
  const segGap = 3;
  const meterW = segments * segW + (segments - 1) * segGap + 6;
  const meterH = 22;

  ctx.fillStyle = '#050811';
  ctx.fillRect(meterX, meterY, meterW, meterH);
  ctx.strokeStyle = alarmPct >= 60 ? '#ff4d6d' : '#3a4f7a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(meterX, meterY, meterW, meterH);

  const filledSegments = Math.ceil((alarmPct / 100) * segments);
  for (let i = 0; i < segments; i++) {
    const sx = meterX + 3 + i * (segW + segGap);
    const sy = meterY + 3;
    ctx.fillStyle = i < filledSegments ? '#ff3b5c' : '#162138';
    ctx.fillRect(sx, sy, segW, meterH - 6);
  }

  ctx.fillStyle = alarmPct > 0 ? '#ff6b85' : '#e2e8f0';
  ctx.font = 'bold 16px ui-monospace, monospace';
  ctx.fillText(`${alarmPct}%`, meterX + meterW + 10, 46);

  // 2. TARGET (shows cracking progress or completed state on win)
  const targetX = 278;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText('TARGET', targetX, 22);

  let targetText = 'CRACK VAULT SAFE';
  let targetColor = '#ffd166';
  if (scene === 'win') {
    targetText = 'VAULT CLEARED · ESCAPED';
    targetColor = '#4ade80';
  } else if (scene === 'lose') {
    targetText = 'LOCKDOWN TRIGGERED';
    targetColor = '#ff4d6d';
  } else if (level.safe.cracked) {
    targetText = 'REACH GOLD EXIT';
    targetColor = '#ffd166';
  } else if (level.safe.progress > 0) {
    const pct = Math.round((level.safe.progress / level.safe.duration) * 100);
    targetText = `CRACKING SAFE ${pct}%`;
  }

  ctx.fillStyle = targetColor;
  ctx.font = 'bold 14px ui-monospace, monospace';
  ctx.fillText(targetText, targetX, 44);

  // Mini safe progress bar inside HUD when cracking
  if (scene === 'play' && !level.safe.cracked && level.safe.progress > 0) {
    const barX = targetX;
    const barY = 50;
    const barW = 164;
    ctx.fillStyle = '#131d33';
    ctx.fillRect(barX, barY, barW, 5);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(barX, barY, barW * (level.safe.progress / level.safe.duration), 5);
  }

  // 3. LOOT
  const lootX = 532;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText('LOOT', lootX, 22);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText(`$${loot.toLocaleString()}`, lootX, 46);

  // 4. TOOLS (smoke count + keycard state always legible even when disabled)
  const toolsX = 678;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText('TOOLS', toolsX, 22);

  // Smoke badge
  const hasSmoke = player.smokeCount > 0;
  ctx.fillStyle = hasSmoke ? '#12263a' : '#101829';
  ctx.strokeStyle = hasSmoke ? '#60a5fa' : '#475b7f';
  ctx.lineWidth = 1.4;
  ctx.fillRect(toolsX, 29, 108, 22);
  ctx.strokeRect(toolsX, 29, 108, 22);
  ctx.fillStyle = hasSmoke ? '#e2e8f0' : '#9fb0cc';
  ctx.font = 'bold 12px ui-monospace, monospace';
  ctx.fillText(`SMOKE ${player.smokeCount}/2`, toolsX + 8, 44);

  // Keycard badge
  const cardX = toolsX + 118;
  const cardHeld = player.keycard === 'held';
  const cardLabel =
    player.keycard === 'held'
      ? 'CARD HELD'
      : player.keycard === 'used'
        ? 'CARD USED'
        : 'CARD NONE';
  ctx.fillStyle = cardHeld ? '#0d2e3d' : '#101829';
  ctx.strokeStyle = cardHeld ? '#38e8ff' : '#475b7f';
  ctx.fillRect(cardX, 29, 104, 22);
  ctx.strokeRect(cardX, 29, 104, 22);
  ctx.fillStyle = cardHeld ? '#38e8ff' : '#9fb0cc';
  ctx.fillText(cardLabel, cardX + 8, 44);

  // 5. LEVEL
  const levelX = 954;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText('LEVEL', levelX, 22);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 17px ui-monospace, monospace';
  ctx.fillText(`${levelIndex + 1}/${totalLevels}`, levelX, 46);

  // 6. TIME
  const timeX = 1110;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText('TIME', timeX, 22);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText(formatTime(elapsed), timeX, 46);

  // Bottom micro-bar during play
  ctx.fillStyle = '#070c17';
  ctx.fillRect(0, 688, 1280, 32);
  ctx.fillStyle = '#7b8eb0';
  ctx.font = '12px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${level.spec.name}   ·   WASD/ARROWS MOVE   ·   SHIFT CROUCH   ·   SPACE SPRINT   ·   E INTERACT / CRACK   ·   Q SMOKE   ·   R RESTART`,
    640,
    708,
  );
  ctx.restore();
}
