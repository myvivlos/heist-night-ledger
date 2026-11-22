// Top HUD bar: segmented red ALARM meter, TARGET progress/status, LOOT, TOOLS, LEVEL, TIME.
import { HUD_HEIGHT, MAX_SMOKE, VIEW_WIDTH } from './levels.js';

const FONT = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds + 1e-6));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function drawPill(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export function drawHud(ctx, state) {
  ctx.save();

  ctx.fillStyle = '#070c17';
  ctx.fillRect(0, 0, VIEW_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, HUD_HEIGHT - 2, VIEW_WIDTH, 2);

  // 1. ALARM (segmented red meter with clear borders + percentage)
  const alarmX = 24;
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = state.alarm >= 70 ? '#f87171' : '#94a3b8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ALARM', alarmX, 17);

  const segments = 10;
  const segW = 14;
  const segH = 14;
  const segGap = 4;
  const filledSegments = Math.ceil((state.alarm / 100) * segments);
  for (let i = 0; i < segments; i += 1) {
    const sx = alarmX + i * (segW + segGap);
    const active = i < filledSegments && state.alarm > 0.5;
    ctx.fillStyle = active ? (i >= 7 ? '#f87171' : '#ef4444') : '#152033';
    ctx.fillRect(sx, 27, segW, segH);
    ctx.strokeStyle = active ? '#fecaca' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx + 0.75, 27.75, segW - 1.5, segH - 1.5);
  }

  ctx.font = `700 16px ${MONO}`;
  ctx.fillStyle = state.alarm >= 70 ? '#fca5a5' : '#e2e8f0';
  ctx.fillText(`${Math.round(state.alarm)}%`, alarmX + segments * (segW + segGap) + 8, 34);

  // 2. TARGET / INTERACTION PROGRESS
  const objX = 290;
  const objW = 245;
  const interact = state.player ? state.player.activeInteract : null;
  const cracking = interact && interact.kind === 'safe';
  const hacking = interact && interact.kind === 'terminal';

  if (state.screen === 'win') {
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('TARGET', objX, 17);
    drawPill(ctx, objX, 26, objW, 18, 'rgba(251, 191, 36, 0.2)', '#fbbf24');
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#fef08a';
    ctx.fillText('JOB COMPLETE — ESCAPED', objX + 10, 35);
  } else if (state.screen === 'lose') {
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#f87171';
    ctx.fillText('TARGET', objX, 17);
    drawPill(ctx, objX, 26, objW, 18, 'rgba(239, 68, 68, 0.2)', '#ef4444');
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#fecaca';
    ctx.fillText('LOCKDOWN — MISSION FAILED', objX + 10, 35);
  } else if (cracking || hacking) {
    const label = cracking ? 'CRACKING SAFE' : 'HACKING CAMERAS';
    const color = cracking ? '#fbbf24' : '#22d3ee';
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = color;
    ctx.fillText(`${label}  ${Math.round(interact.progress * 100)}%`, objX, 17);

    drawPill(ctx, objX, 27, objW, 14, '#131d31', '#334155');
    const fillW = Math.max(4, Math.round((objW - 4) * interact.progress));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(objX + 2, 29, fillW, 10, 3);
    ctx.fill();
  } else if (state.level && state.level.safe.cracked) {
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('TARGET', objX, 17);
    drawPill(ctx, objX, 26, objW, 18, 'rgba(245, 158, 11, 0.16)', '#f59e0b');
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#fde68a';
    ctx.fillText('LEDGER SECURED — REACH EXIT', objX + 10, 35);
  } else {
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TARGET', objX, 17);
    drawPill(ctx, objX, 26, objW, 18, '#101829', '#334155');
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('CRACK VAULT SAFE (HOLD E 3s)', objX + 10, 35);
  }

  // 3. LOOT
  const lootX = 580;
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('LOOT', lootX, 17);
  ctx.font = `800 22px ${MONO}`;
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`$${state.loot.toLocaleString()}`, lootX, 36);

  // 4. TOOLS (smoke bomb count + keycard state, crisp even when disabled/missing)
  const toolsX = 760;
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TOOLS', toolsX, 17);

  const smokeLeft = state.player ? state.player.smokeLeft : MAX_SMOKE;
  drawPill(ctx, toolsX, 25, 110, 20, '#101829', smokeLeft > 0 ? '#475569' : '#334155');
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = smokeLeft > 0 ? '#e2e8f0' : '#94a3b8';
  ctx.fillText(`SMOKE [Q] ${smokeLeft}/${MAX_SMOKE}`, toolsX + 8, 35);

  const hasKey = Boolean(state.player && state.player.hasKeycard);
  const usedKey = Boolean(state.player && state.player.keycardUsed);
  const keyFill = hasKey ? 'rgba(56, 189, 248, 0.22)' : '#121d31';
  const keyStroke = hasKey ? '#38bdf8' : '#64748b';
  const keyText = hasKey ? 'KEYCARD READY' : usedKey ? 'KEYCARD USED' : 'NO KEYCARD';
  const keyTextColor = hasKey ? '#7dd3fc' : usedKey ? '#cbd5e1' : '#cbd5e1';
  drawPill(ctx, toolsX + 118, 25, 114, 20, keyFill, keyStroke);
  ctx.font = `700 11px ${FONT}`;
  ctx.fillStyle = keyTextColor;
  ctx.fillText(keyText, toolsX + 126, 35);

  // 5. LEVEL
  const lvlX = 1035;
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('LEVEL', lvlX, 17);
  ctx.font = `800 20px ${MONO}`;
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`${state.levelIndex + 1}/${state.totalLevels}`, lvlX, 36);

  // 6. TIME
  const timeX = 1256;
  ctx.textAlign = 'right';
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TIME', timeX, 17);
  ctx.font = `800 20px ${MONO}`;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(formatTime(state.time), timeX, 36);

  ctx.restore();
}
