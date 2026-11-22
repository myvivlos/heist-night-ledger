/**
 * Keyboard input handler with held-state and edge-triggered press queries.
 */
const PREVENTED_CODES = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
]);

export function createInput(target = window) {
  const held = new Set();
  const pressed = new Set();
  let onFirstGesture = null;

  function handleKeyDown(e) {
    if (PREVENTED_CODES.has(e.code)) {
      e.preventDefault();
    }
    if (!held.has(e.code)) {
      pressed.add(e.code);
    }
    held.add(e.code);
    if (onFirstGesture) {
      onFirstGesture();
    }
  }

  function handleKeyUp(e) {
    held.delete(e.code);
  }

  function handleBlur() {
    held.clear();
    pressed.clear();
  }

  target.addEventListener('keydown', handleKeyDown);
  target.addEventListener('keyup', handleKeyUp);
  target.addEventListener('blur', handleBlur);

  return {
    setGestureCallback(fn) {
      onFirstGesture = fn;
    },
    isDown(code) {
      return held.has(code);
    },
    anyDown(codes) {
      for (const code of codes) {
        if (held.has(code)) return true;
      }
      return false;
    },
    consumePress(code) {
      if (!pressed.has(code)) return false;
      pressed.delete(code);
      return true;
    },
    clearTransient() {
      pressed.clear();
    },
    destroy() {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
      target.removeEventListener('blur', handleBlur);
    },
  };
}
