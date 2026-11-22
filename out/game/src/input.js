// Keyboard and pointer input handling: held movement/stance/interact and one-shot actions.

export const ACTION_START = 1;
export const ACTION_RESTART = 2;
export const ACTION_SMOKE = 4;
export const ACTION_INTERACT_PRESS = 8;
export const ACTION_MUTE = 16;

const UP_KEYS = new Set(['KeyW', 'ArrowUp']);
const DOWN_KEYS = new Set(['KeyS', 'ArrowDown']);
const LEFT_KEYS = new Set(['KeyA', 'ArrowLeft']);
const RIGHT_KEYS = new Set(['KeyD', 'ArrowRight']);
const CROUCH_KEYS = new Set(['ShiftLeft', 'ShiftRight']);

export function createInput(target, onGesture) {
  const held = {
    up: false,
    down: false,
    left: false,
    right: false,
    crouch: false,
    sprint: false,
    interact: false,
  };
  let queuedActions = 0;

  function notifyGesture() {
    if (onGesture) onGesture();
  }

  function clearHeld() {
    held.up = false;
    held.down = false;
    held.left = false;
    held.right = false;
    held.crouch = false;
    held.sprint = false;
    held.interact = false;
  }

  window.addEventListener('keydown', (event) => {
    notifyGesture();
    const { code } = event;
    if (UP_KEYS.has(code)) held.up = true;
    else if (DOWN_KEYS.has(code)) held.down = true;
    else if (LEFT_KEYS.has(code)) held.left = true;
    else if (RIGHT_KEYS.has(code)) held.right = true;
    else if (CROUCH_KEYS.has(code)) held.crouch = true;
    else if (code === 'Space') {
      held.sprint = true;
      if (!event.repeat) queuedActions |= ACTION_START;
    } else if (code === 'Enter') {
      if (!event.repeat) queuedActions |= ACTION_START;
    } else if (code === 'KeyE') {
      held.interact = true;
      if (!event.repeat) queuedActions |= ACTION_INTERACT_PRESS;
    } else if (code === 'KeyQ') {
      if (!event.repeat) queuedActions |= ACTION_SMOKE;
    } else if (code === 'KeyR') {
      if (!event.repeat) queuedActions |= ACTION_RESTART;
    } else if (code === 'KeyM') {
      if (!event.repeat) queuedActions |= ACTION_MUTE;
    } else {
      return;
    }
    event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    const { code } = event;
    if (UP_KEYS.has(code)) held.up = false;
    else if (DOWN_KEYS.has(code)) held.down = false;
    else if (LEFT_KEYS.has(code)) held.left = false;
    else if (RIGHT_KEYS.has(code)) held.right = false;
    else if (CROUCH_KEYS.has(code)) held.crouch = false;
    else if (code === 'Space') held.sprint = false;
    else if (code === 'KeyE') held.interact = false;
  });

  window.addEventListener('blur', clearHeld);

  target.addEventListener('pointerdown', () => {
    notifyGesture();
    queuedActions |= ACTION_START;
  });

  return {
    controls() {
      let mx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      let my = (held.down ? 1 : 0) - (held.up ? 1 : 0);
      if (mx !== 0 && my !== 0) {
        const inv = 1 / Math.SQRT2;
        mx *= inv;
        my *= inv;
      }
      return {
        mx,
        my,
        crouch: held.crouch,
        sprint: held.sprint && !held.crouch,
        interact: held.interact,
      };
    },
    takeActions() {
      const taken = queuedActions;
      queuedActions = 0;
      return taken;
    },
  };
}
