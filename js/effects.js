/* ============================================================
   TOWER CRASH 3D — effects.js
   Pure anime.js-driven effect helpers. No game state is read
   directly from game.js — helpers receive DOM elements, Three.js
   objects, or plain mutable state objects and animate them.
   Exported helpers:
     burst, shake, punch, countTo, pulse, buttonFeedback,
     overlayIn, overlayOut
   ============================================================ */

import anime from 'animejs';

/* ============================================================
   DEFAULT TIMINGS
   Local fallbacks so effects.js can be used standalone.
   game.js imports the canonical values from config.js and
   passes them in when needed; these are just defaults.
   ============================================================ */
const DEFAULTS = {
  burstMs:      700,
  shakeSeconds: 0.8,
  punchMs:      220,
  countMs:      420,
  pulseMs:      320,
  buttonMs:     380,
  overlayInMs:  420,
  overlayOutMs: 260
};

/* ============================================================
   BURST
   Fades a set of Three.js meshes down to near-zero scale.
   Accepts a single Object3D or an array of them.
   ============================================================ */
export function burst(targets, durationMs = DEFAULTS.burstMs) {
  if (!targets) return;
  const list = Array.isArray(targets) ? targets : [targets];

  for (const t of list) {
    if (!t || !t.scale || t.scale.isVector3 !== true) continue;

    const bx = t.scale.x || 0.001;
    const by = t.scale.y || 0.001;
    const bz = t.scale.z || 0.001;

    const proxy = { s: 1 };

    anime({
      targets: proxy,
      s: 0.001,
      duration: durationMs,
      easing: 'easeOutQuad',
      update: () => {
        const k = proxy.s;
        t.scale.set(bx * k, by * k, bz * k);
      }
    });
  }
}

/* ============================================================
   SHAKE
   Writes state.shakeTime down to zero. The renderer reads
   state.shakeTime each frame to jitter the camera position.
   ============================================================ */
export function shake(state, durationSeconds = DEFAULTS.shakeSeconds) {
  if (!state || typeof state !== 'object') return;

  state.shakeTime = durationSeconds;

  anime({
    targets: state,
    shakeTime: 0,
    duration: durationSeconds * 1000,
    easing: 'easeOutQuad'
  });
}

/* ============================================================
   PUNCH
   Writes state.punchAmount from `magnitude` to zero. The
   renderer reads state.punchAmount each frame to push the
   camera forward / up briefly.
   ============================================================ */
export function punch(state, magnitude = 1, durationMs = DEFAULTS.punchMs) {
  if (!state || typeof state !== 'object') return;

  state.punchAmount = Math.max(state.punchAmount || 0, magnitude);

  anime({
    targets: state,
    punchAmount: 0,
    duration: durationMs,
    easing: 'easeOutQuad'
  });
}

/* ============================================================
   COUNT TO
   Tweens a numeric property on `obj` from its current value
   to `target`, calling `onUpdate` on every frame.
   ============================================================ */
export function countTo(
  obj,
  prop,
  target,
  durationMs = DEFAULTS.countMs,
  onUpdate
) {
  if (!obj || typeof prop !== 'string') return;

  const from = obj[prop];

  if (typeof from !== 'number' || from === target) {
    obj[prop] = target;
    if (onUpdate) onUpdate();
    return;
  }

  anime({
    targets: obj,
    [prop]: target,
    duration: durationMs,
    easing: 'easeOutQuad',
    round: 1,
    update: () => {
      if (onUpdate) onUpdate();
    }
  });
}

/* ============================================================
   PULSE
   Works on both Three.js Object3D and DOM elements.
   - A freshly spawned Object3D (< 0.9 base scale) grows to
     `scaleTo` with overshoot.
   - A normal base-scale object pops to `scaleTo` then back.
   ============================================================ */
export function pulse(target, scaleTo = 1.15, durationMs = DEFAULTS.pulseMs) {
  if (!target) return;

  const isObject3D = target.scale && target.scale.isVector3 === true;

  if (isObject3D) {
    const bx = target.scale.x || 0.001;
    const by = target.scale.y || 0.001;
    const bz = target.scale.z || 0.001;
    const base = (bx + by + bz) / 3;

    if (base < 0.9) {
      const proxy = { s: base };
      anime({
        targets: proxy,
        s: scaleTo,
        duration: durationMs,
        easing: 'easeOutBack',
        update: () => {
          const k = base === 0 ? 1 : proxy.s / base;
          target.scale.set(bx * k, by * k, bz * k);
        }
      });
    } else {
      const proxy = { s: base };
      anime({
        targets: proxy,
        s: [
          { value: scaleTo, duration: durationMs * 0.4, easing: 'easeOutQuad' },
          { value: base, duration: durationMs * 0.6, easing: 'easeInOutQuad' }
        ],
        update: () => {
          const k = base === 0 ? 1 : proxy.s / base;
          target.scale.set(bx * k, by * k, bz * k);
        }
      });
    }
    return;
  }

  anime({
    targets: target,
    scale: [
      { value: scaleTo, duration: durationMs * 0.4, easing: 'easeOutQuad' },
      { value: 1, duration: durationMs * 0.6, easing: 'easeInOutQuad' }
    ]
  });
}

/* ============================================================
   BUTTON FEEDBACK
   Quick squash + elastic return for power-up presses, the
   shop button, the ball chip, etc.
   ============================================================ */
export function buttonFeedback(el, durationMs = DEFAULTS.buttonMs) {
  if (!el) return;

  anime({
    targets: el,
    scale: [
      { value: 0.9, duration: durationMs * 0.26, easing: 'easeOutQuad' },
      { value: 1, duration: durationMs * 0.74, easing: 'easeOutElastic(1, .5)' }
    ]
  });
}

/* ============================================================
   OVERLAY IN
   Reveals the overlay + panel with a soft fade and slight pop.
   ============================================================ */
export function overlayIn(overlayEl, panelEl, durationMs = DEFAULTS.overlayInMs) {
  if (!overlayEl) return;

  overlayEl.classList.add('show');
  overlayEl.style.pointerEvents = 'auto';
  overlayEl.style.opacity = '0';

  anime({
    targets: overlayEl,
    opacity: [0, 1],
    duration: durationMs,
    easing: 'easeOutQuad'
  });

  if (panelEl) {
    panelEl.style.opacity = '0';
    anime({
      targets: panelEl,
      opacity: [0, 1],
      translateY: [12, 0],
      scale: [0.97, 1],
      duration: durationMs,
      easing: 'easeOutBack'
    });
  }
}

/* ============================================================
   OVERLAY OUT
   Fades the panel and overlay, then removes `.show` and calls
   onComplete exactly once.
   ============================================================ */
export function overlayOut(
  overlayEl,
  panelEl,
  onComplete,
  durationMs = DEFAULTS.overlayOutMs
) {
  if (!overlayEl) {
    if (onComplete) onComplete();
    return;
  }

  overlayEl.style.pointerEvents = 'none';

  if (panelEl) {
    anime({
      targets: panelEl,
      opacity: [1, 0],
      translateY: [0, -10],
      scale: [1, 0.98],
      duration: durationMs * 0.7,
      easing: 'easeInQuad'
    });
  }

  anime({
    targets: overlayEl,
    opacity: [1, 0],
    duration: durationMs,
    delay: 40,
    easing: 'easeInQuad',
    complete: () => {
      overlayEl.classList.remove('show');
      overlayEl.style.opacity = '0';
      overlayEl.style.pointerEvents = 'none';
      if (panelEl) panelEl.style.opacity = '0';
      if (onComplete) onComplete();
    }
  });
}