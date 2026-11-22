/**
 * Mute-safe WebAudio synthesizer for tactile heist feedback.
 */
export function createAudio() {
  let ctx = null;
  let muted = false;
  let lastAlarmPing = -1;

  function ensureContext() {
    if (muted) return null;
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      return ctx;
    } catch {
      return null;
    }
  }

  function tone(freq, duration, type = 'sine', volume = 0.08, slideTo = null) {
    const audioCtx = ensureContext();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore audio failures in restricted/headless contexts
    }
  }

  return {
    unlock() {
      ensureContext();
    },
    isMuted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    playSafeTick(progressRatio) {
      tone(420 + progressRatio * 340, 0.05, 'triangle', 0.05);
    },
    playSafeOpen() {
      tone(523.25, 0.09, 'triangle', 0.09);
      setTimeout(() => tone(659.25, 0.09, 'triangle', 0.09), 70);
      setTimeout(() => tone(783.99, 0.16, 'triangle', 0.1), 140);
    },
    playLoot() {
      tone(740, 0.07, 'sine', 0.08, 988);
    },
    playKeycard() {
      tone(620, 0.08, 'square', 0.05, 880);
    },
    playDoor() {
      tone(220, 0.14, 'triangle', 0.08, 330);
    },
    playVent() {
      tone(190, 0.12, 'sine', 0.07, 110);
    },
    playTerminal() {
      tone(880, 0.07, 'square', 0.04);
      setTimeout(() => tone(1174, 0.1, 'square', 0.04), 60);
    },
    playSmoke() {
      tone(150, 0.22, 'sawtooth', 0.06, 65);
    },
    playAlarmPing(alarmPct, elapsedTime) {
      const interval = alarmPct > 65 ? 0.24 : 0.45;
      if (elapsedTime - lastAlarmPing < interval) return;
      lastAlarmPing = elapsedTime;
      tone(alarmPct > 65 ? 920 : 680, 0.09, 'square', 0.06);
    },
    playWin() {
      tone(523.25, 0.11, 'triangle', 0.09);
      setTimeout(() => tone(659.25, 0.11, 'triangle', 0.09), 90);
      setTimeout(() => tone(783.99, 0.11, 'triangle', 0.09), 180);
      setTimeout(() => tone(1046.5, 0.24, 'triangle', 0.11), 270);
    },
    playLose() {
      tone(280, 0.16, 'sawtooth', 0.08, 160);
      setTimeout(() => tone(175, 0.28, 'sawtooth', 0.09, 85), 140);
    },
  };
}
