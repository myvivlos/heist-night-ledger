function drawPanel(ctx, x, y, w, h, borderColor) {
  ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, w, h);
}

function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Renders the title screen overlay over the live Level 1 room.
 */
export function renderTitleScreen(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 8, 16, 0.56)';
  ctx.fillRect(0, 64, 1280, 656);

  const w = 680;
  const h = 390;
  const x = (1280 - w) / 2;
  const y = 165;
  drawPanel(ctx, x, y, w, h, '#ffd166');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#38e8ff';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.fillText('TOP-DOWN STEALTH HEIST · 3 FLOORS', 640, y + 40);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 58px ui-monospace, monospace';
  ctx.fillText('NIGHT LEDGER', 640, y + 106);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillText(
    'Slip past patrols and cameras, crack the vault safe, and reach the exit.',
    640,
    y + 144,
  );

  // Prompt button banner
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(450, y + 172, 380, 42);
  ctx.fillStyle = '#070b14';
  ctx.font = 'bold 17px ui-monospace, monospace';
  ctx.fillText('press SPACE to plan the job', 640, y + 199);

  // Compact controls block
  const boxX = x + 48;
  const boxY = y + 238;
  const boxW = w - 96;
  const boxH = 122;
  ctx.fillStyle = '#0c1426';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#253759';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.textAlign = 'left';
  ctx.font = 'bold 13px ui-monospace, monospace';
  const col1 = boxX + 24;
  const col2 = boxX + 312;

  const rows = [
    ['WASD / ARROWS', 'Move thief', 'E (HOLD 3s)', 'Crack vault / Use vent & card'],
    ['SHIFT', 'Crouch (quiet, stealth)', 'Q', 'Throw smoke bomb (2/floor)'],
    ['SPACE', 'Sprint (fast, loud)', 'R', 'Restart job'],
  ];

  rows.forEach((r, idx) => {
    const ry = boxY + 34 + idx * 32;
    ctx.fillStyle = '#38e8ff';
    ctx.fillText(r[0], col1, ry);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(r[1], col1 + 122, ry);

    ctx.fillStyle = '#ffd166';
    ctx.fillText(r[2], col2, ry);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(r[3], col2 + 105, ry);
  });

  ctx.restore();
}

/**
 * Renders the win (GETAWAY) or lose (BURNED) overlay while keeping the top HUD readable.
 */
export function renderEndScreen(ctx, state) {
  const isWin = state.scene === 'win';
  const accent = isWin ? '#ffd166' : '#ff4d6d';
  const verdict = isWin ? 'GETAWAY' : 'BURNED';

  ctx.save();
  ctx.fillStyle = 'rgba(5, 8, 16, 0.62)';
  ctx.fillRect(0, 64, 1280, 656);

  const w = 640;
  const h = 330;
  const x = (1280 - w) / 2;
  const y = 195;
  drawPanel(ctx, x, y, w, h, accent);

  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 58px ui-monospace, monospace';
  ctx.fillText(verdict, 640, y + 78);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillText(
    state.verdictReason || (isWin ? 'Vault ledger extracted cleanly.' : 'Alarm reached 100%.'),
    640,
    y + 116,
  );

  // Loot + stats card
  ctx.fillStyle = '#0c1426';
  ctx.fillRect(x + 42, y + 140, w - 84, 96);
  ctx.strokeStyle = '#253759';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 42, y + 140, w - 84, 96);

  const stats = [
    ['LOOT TOTAL', `$${state.loot.toLocaleString()}`, '#ffd166'],
    ['TIME', formatClock(state.elapsed), '#f8fafc'],
    ['PEAK ALARM', `${Math.round(state.alarmPeak)}%`, isWin ? '#4ade80' : '#ff4d6d'],
    ['FLOOR', `${state.levelIndex + 1}/${state.totalLevels}`, '#38e8ff'],
  ];

  stats.forEach((st, idx) => {
    const sx = x + 42 + ((w - 84) / 4) * (idx + 0.5);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(st[0], sx, y + 170);
    ctx.fillStyle = st[2];
    ctx.font = 'bold 20px ui-monospace, monospace';
    ctx.fillText(st[1], sx, y + 206);
  });

  // Restart / next floor action line
  ctx.fillStyle = accent;
  ctx.font = 'bold 16px ui-monospace, monospace';
  if (isWin && state.levelIndex + 1 < state.totalLevels) {
    ctx.fillText('press SPACE for next floor  ·  press R to plan another job', 640, y + 286);
  } else {
    ctx.fillText('press R to plan another job', 640, y + 286);
  }

  ctx.restore();
}
