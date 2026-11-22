// Mute-safe WebAudio synthesizer for tactile heist feedback (clicks, pings, chimes).

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', peak = 0.08, delay = 0, slideTo = null) {
    const audio = ensureContext();
    if (!audio || audio.state !== 'running') return;
    const now = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  return {
    unlock() {
      ensureContext();
    },
    setMuted(value) {
      muted = Boolean(value);
    },
    isMuted() {
      return muted;
    },
    safeClick(progress) {
      playTone(620 + progress * 380, 0.045, 'triangle', 0.055);
    },
    safeOpen() {
      playTone(523.25, 0.11, 'triangle', 0.09, 0);
      playTone(659.25, 0.11, 'triangle', 0.09, 0.08);
      playTone(783.99, 0.22, 'sine', 0.1, 0.16);
    },
    pickup() {
      playTone(880, 0.08, 'sine', 0.07, 0);
      playTone(1174.66, 0.11, 'sine', 0.07, 0.06);
    },
    doorOpen() {
      playTone(320, 0.08, 'square', 0.045, 0, 520);
      playTone(640, 0.12, 'triangle', 0.06, 0.07);
    },
    vent() {
      playTone(240, 0.12, 'sine', 0.06, 0, 140);
    },
    terminal() {
      playTone(980, 0.07, 'square', 0.04, 0);
      playTone(1320, 0.09, 'square', 0.04, 0.07);
      playTone(660, 0.12, 'sine', 0.05, 0.14);
    },
    smoke() {
      playTone(180, 0.18, 'sawtooth', 0.035, 0, 75);
    },
    alarmPing(tier) {
      playTone(540 + tier * 140, 0.09, 'square', 0.05, 0);
    },
    win() {
      playTone(523.25, 0.12, 'triangle', 0.09, 0);
      playTone(659.25, 0.12, 'triangle', 0.09, 0.1);
      playTone(783.99, 0.12, 'triangle', 0.09, 0.2);
      playTone(1046.5, 0.28, 'sine', 0.11, 0.3);
    },
    lose() {
      playTone(310, 0.16, 'sawtooth', 0.08, 0, 220);
      playTone(190, 0.28, 'sawtooth', 0.09, 0.15, 110);
    },
  };
}
