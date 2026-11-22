// Title (NIGHT LEDGER), Win (GETAWAY), and Lose (BURNED) screen overlays.
import { HUD_HEIGHT, VIEW_HEIGHT, VIEW_WIDTH } from './levels.js';
import { SCREEN_LOSE, SCREEN_TITLE, SCREEN_WIN } from './state.js';

const FONT = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds + 1e-6));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function drawCard(ctx, x, y, w, h, borderColor) {
  ctx.fillStyle = 'rgba(7, 12, 23, 0.92)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawScreenOverlay(ctx, state) {
  if (state.screen === 'play') return;

  ctx.save();
  const top = state.screen === SCREEN_TITLE ? 0 : HUD_HEIGHT;
  const centerX = VIEW_WIDTH * 0.5;
  const centerY = top + (VIEW_HEIGHT - top) * 0.5;

  ctx.fillStyle = state.screen === SCREEN_TITLE ? 'rgba(4, 8, 16, 0.72)' : 'rgba(4, 8, 16, 0.76)';
  ctx.fillRect(0, top, VIEW_WIDTH, VIEW_HEIGHT - top);

  if (state.screen === SCREEN_TITLE) {
    const w = 760;
    const h = 414;
    const x = centerX - w * 0.5;
    const y = centerY - h * 0.5;
    drawCard(ctx, x, y, w, h, '#334155');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `700 13px ${MONO}`;
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('TOP-DOWN STEALTH HEIST  //  3 FLOORS', centerX, y + 42);

    ctx.font = `900 66px ${FONT}`;
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('NIGHT LEDGER', centerX, y + 106);

    ctx.font = `500 20px ${FONT}`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Slip past patrol cones, crack the vault safe, and vanish with the ledger.', centerX, y + 158);

    const pulse = 0.78 + 0.22 * Math.sin(state.pulsePhase * 4.2);
    ctx.fillStyle = `rgba(245, 158, 11, ${0.14 * pulse})`;
    ctx.beginPath();
    ctx.roundRect(centerX - 220, y + 194, 440, 48, 8);
    ctx.fill();
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.7 + 0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `800 22px ${FONT}`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('press SPACE to plan the job', centerX, y + 218);

    const boxY = y + 266;
    ctx.fillStyle = '#0d1526';
    ctx.beginPath();
    ctx.roundRect(x + 30, boxY, w - 60, 116, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const controls = [
      ['WASD / ARROWS', 'Move thief'],
      ['SHIFT (HOLD)', 'Crouch (quiet, stealth)'],
      ['SPACE (HOLD)', 'Sprint (fast, loud)'],
      ['E (HOLD / TAP)', 'Crack safe (3s) / interact'],
      ['Q', 'Smoke bomb (2 per level)'],
      ['R', 'Restart after win or lose'],
    ];

    ctx.textAlign = 'left';
    for (let i = 0; i < controls.length; i += 1) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = x + 48 + col * 352;
      const cy = boxY + 27 + row * 31;
      ctx.font = `700 13px ${MONO}`;
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(controls[i][0], cx, cy);
      ctx.font = `500 13px ${FONT}`;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(controls[i][1], cx + 132, cy);
    }
    ctx.restore();
    return;
  }

  const isWin = state.screen === SCREEN_WIN;
  const accent = isWin ? '#fbbf24' : '#ef4444';
  const verdict = isWin ? 'GETAWAY' : 'BURNED';

  const w = 680;
  const h = 340;
  const x = centerX - w * 0.5;
  const y = centerY - h * 0.5;
  drawCard(ctx, x, y, w, h, accent);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `700 13px ${MONO}`;
  ctx.fillStyle = isWin ? '#fde68a' : '#fca5a5';
  ctx.fillText(isWin ? 'HEIST COMPLETE' : 'ALARM TRIGGERED', centerX, y + 38);

  ctx.font = `900 72px ${FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText(verdict, centerX, y + 102);

  ctx.font = `800 30px ${MONO}`;
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`LOOT: $${state.loot.toLocaleString()}`, centerX, y + 162);

  ctx.font = `500 18px ${FONT}`;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(state.verdictReason, centerX, y + 206);

  ctx.font = `700 14px ${MONO}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `LEVEL ${state.levelIndex + 1}/${state.totalLevels}   •   TIME ${formatTime(state.time)}   •   ALARM ${Math.round(state.alarm)}%`,
    centerX,
    y + 244,
  );

  ctx.fillStyle = isWin ? 'rgba(245, 158, 11, 0.14)' : 'rgba(239, 68, 68, 0.14)';
  ctx.beginPath();
  ctx.roundRect(centerX - 190, y + 272, 380, 42, 8);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `800 20px ${FONT}`;
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('press R to plan another job', centerX, y + 293);

  ctx.restore();
}
