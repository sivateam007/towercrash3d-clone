/* ============================================================
   TOWER CRASH 3D — effects.js
   All anime.js-driven visual effects.
   Pure helpers — receive DOM elements, Three.js objects, or
   plain mutable state; never reach into game.js internals.
   ============================================================ */

import anime from 'animejs';
import * as THREE from 'three';

/* ============================================================
   DEFAULT TIMINGS
   Fallbacks so helpers work standalone; game.js passes overrides.
   ============================================================ */
const DEFAULTS = {
  burstMs:      700,
  shakeSeconds: 0.55,
  punchMs:      220,
  countMs:      420,
  pulseMs:      320,
  buttonMs:     380,
  overlayInMs:  420,
  overlayOutMs: 260,
  shockwaveMs:  420,
  trailFadeMs:  300,
  wobbleMs:     340,
  confettiMs:   1100
};

const PALETTE = ['#ff4d5a', '#3aa0ff', '#ffd23f', '#a66bff', '#35e07c',
                 '#ff5ad2', '#2de2e6', '#ff8a3d', '#9dff3d', '#ff9ecb'];

/* ============================================================
   BURST — color-matched debris fade-out
   Accepts a single Object3D or an array. Animates each to 0.
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
   SHAKE — writes state.shakeTime down to zero.
   The renderer jitters the camera from that value each frame.
   ============================================================ */
export function shake(state, durationSeconds = DEFAULTS.shakeSeconds) {
  if (!state || typeof state !== 'object') return;

  state.shakeTime = Math.max(state.shakeTime || 0, durationSeconds);

  anime({
    targets: state,
    shakeTime: 0,
    duration: durationSeconds * 1000,
    easing: 'easeOutQuad'
  });
}

/* ============================================================
   PUNCH — writes state.punchAmount down to zero.
   Renderer kicks the camera forward + FOV zooms in slightly.
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
   COUNT TO — tween a numeric property on a target object.
   ============================================================ */
export function countTo(obj, prop, target, durationMs = DEFAULTS.countMs, onUpdate) {
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
    update: () => { if (onUpdate) onUpdate(); }
  });
}

/* ============================================================
   PULSE — works on Three.js Object3D AND DOM elements.
   Small-scale objects (fresh spawns) grow with overshoot.
   Normal-scale objects pop to scaleTo then ease back.
   ============================================================ */
export function pulse(target, scaleTo = 1.15, durationMs = DEFAULTS.pulseMs) {
  if (!target) return;

  const isObject3D = target.scale && target.scale.isVector3 === true;

  if (isObject3D) {
    const bx = target.scale.x || 0.001;
    const by = target.scale.y || 0.001;
    const bz = target.scale.z || 0.001;
    const base = (bx + by + bz) / 3;

    const proxy = { s: base < 0.9 ? base : base };

    if (base < 0.9) {
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
      anime({
        targets: proxy,
        s: [
          { value: scaleTo, duration: durationMs * 0.4, easing: 'easeOutQuad' },
          { value: base,    duration: durationMs * 0.6, easing: 'easeInOutQuad' }
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
      { value: 1,       duration: durationMs * 0.6, easing: 'easeInOutQuad' }
    ]
  });
}

/* ============================================================
   BUTTON FEEDBACK — squash + elastic return
   ============================================================ */
export function buttonFeedback(el, durationMs = DEFAULTS.buttonMs) {
  if (!el) return;

  anime({
    targets: el,
    scale: [
      { value: 0.9, duration: durationMs * 0.26, easing: 'easeOutQuad' },
      { value: 1,   duration: durationMs * 0.74, easing: 'easeOutElastic(1, .5)' }
    ]
  });
}

/* ============================================================
   SHOCKWAVE — expanding ring at the impact point.
   Purely visual, self-cleans on completion.
   ============================================================ */
export function shockwave(scene, position, hexColor = 0xffffff, durationMs = DEFAULTS.shockwaveMs) {
  if (!scene || !position || !position.isVector3) return;

  const geo = new THREE.TorusGeometry(0.32, 0.055, 8, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: hexColor,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  const ring = new THREE.Mesh(geo, mat);
  ring.position.copy(position);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const proxy = { s: 0.35, o: 0.95 };

  anime({
    targets: proxy,
    s: 3.0,
    o: 0,
    duration: durationMs,
    easing: 'easeOutQuad',
    update: () => {
      ring.scale.set(proxy.s, proxy.s, proxy.s);
      mat.opacity = Math.max(0, proxy.o);
    },
    complete: () => {
      scene.remove(ring);
      geo.dispose();
      mat.dispose();
    }
  });
}

/* ============================================================
   BALL TRAIL — helper used by game.js to fade a trail ghost.
   ============================================================ */
export function ballTrail(ghost, durationMs = DEFAULTS.trailFadeMs) {
  if (!ghost) return;

  if (ghost.material) {
    ghost.material.transparent = true;
  }

  const startScale = ghost.scale.x || 1;
  const startOpacity = (ghost.material && ghost.material.opacity) || 0.55;

  anime({
    targets: ghost.scale,
    x: 0.05, y: 0.05, z: 0.05,
    duration: durationMs,
    easing: 'easeOutQuad'
  });

  if (ghost.material) {
    anime({
      targets: ghost.material,
      opacity: 0,
      duration: durationMs,
      easing: 'easeOutQuad'
    });
  }

  return { startScale, startOpacity };
}

/* ============================================================
   WOBBLE — applies a small physics impulse to nearby blocks
   so the tower visibly rocks when a ball bounces or an impact
   happens nearby. Uses anime only to stagger the impulses.
   ============================================================ */
export function wobble(blocks, origin, radius = 2.4, strength = 1) {
  if (!blocks || !blocks.length || !origin) return;

  const rx = origin.x !== undefined ? origin.x : 0;
  const ry = origin.y !== undefined ? origin.y : 0;
  const rz = origin.z !== undefined ? origin.z : 0;

  blocks.forEach((b, i) => {
    if (!b || !b.body) return;

    const bp = b.body.position;
    const dx = bp.x - rx;
    const dy = bp.y - ry;
    const dz = bp.z - rz;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > radius) return;

    const s = (1 - dist / radius) * strength;
    if (s <= 0.02) return;

    anime({
      targets: { p: 0 },
      p: 1,
      duration: 1,
      delay: i * 8,
      complete: () => {
        if (!b.body) return;
        b.body.wakeUp();
        b.body.velocity.x += (Math.random() - 0.5) * 2.4 * s;
        b.body.velocity.z += (Math.random() - 0.5) * 2.4 * s;
        b.body.angularVelocity.x += (Math.random() - 0.5) * 3.2 * s;
        b.body.angularVelocity.z += (Math.random() - 0.5) * 3.2 * s;
      }
    });
  });
}

/* ============================================================
   CONFETTI — colored squares burst from a container's centre.
   Used on the level-clear overlay. Self-cleans.
   ============================================================ */
export function confetti(container, count = 24, durationMs = DEFAULTS.confettiMs, gravity = 900) {
  if (!container || !document.body) return;

  const rect = container.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const pieces = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = PALETTE[i % PALETTE.length];
    el.style.cssText =
      'position:fixed;' +
      'left:' + cx + 'px;' +
      'top:' + cy + 'px;' +
      'width:10px;height:10px;' +
      'background:' + color + ';' +
      'border-radius:2px;' +
      'pointer-events:none;' +
      'z-index:100;' +
      'box-shadow:0 0 6px ' + color + 'aa;' +
      'will-change:transform,opacity;';

    document.body.appendChild(el);
    pieces.push(el);

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = 300 + Math.random() * 380;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 220;
    const durSec = durationMs / 1000;
    const g = gravity;

    const proxy = { x: 0, y: 0 };
    anime({
      targets: proxy,
      x: vx * durSec,
      y: vy * durSec + 0.5 * g * durSec * durSec,
      duration: durationMs,
      easing: 'linear',
      update: () => {
        el.style.transform =
          'translate(' + proxy.x + 'px,' + proxy.y + 'px) rotate(' + (proxy.x * 0.6) + 'deg)';
      },
      complete: () => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }
    });

    anime({
      targets: el,
      opacity: [1, 0],
      duration: durationMs,
      delay: durationMs * 0.4,
      easing: 'easeInQuad'
    });
  }
}

/* ============================================================
   OVERLAY IN — fade overlay in, pop panel, optional vignette.
   If the title looks like a "lose" state, tint red;
   if "win", add a soft gold glow.
   ============================================================ */
export function overlayIn(overlayEl, panelEl, durationMs = DEFAULTS.overlayInMs) {
  if (!overlayEl) return;

  overlayEl.classList.add('show');
  overlayEl.style.pointerEvents = 'auto';

  const titleEl = overlayEl.querySelector('.panelTitle');
  const titleText = titleEl ? (titleEl.textContent || '') : '';
  const isLose = /LOSE|OUT OF|GAME OVER|FAIL/i.test(titleText);

  /* Ensure a vignette layer exists */
  let vignette = overlayEl.querySelector('.vignette');
  if (!vignette) {
    vignette = document.createElement('div');
    vignette.className = 'vignette';
    vignette.style.cssText =
      'position:absolute;inset:0;pointer-events:none;opacity:0;border-radius:inherit;' +
      'background: radial-gradient(circle at 50% 50%, transparent 40%, ' +
      (isLose ? 'rgba(200,30,30,0.55)' : 'rgba(255,210,63,0.35)') + ' 100%);';
    overlayEl.appendChild(vignette);
  } else {
    vignette.style.background =
      'radial-gradient(circle at 50% 50%, transparent 40%, ' +
      (isLose ? 'rgba(200,30,30,0.55)' : 'rgba(255,210,63,0.35)') + ' 100%)';
  }

  anime({
    targets: overlayEl,
    opacity: [0, 1],
    duration: durationMs,
    easing: 'easeOutQuad'
  });

  if (panelEl) {
    anime({
      targets: panelEl,
      opacity: [0, 1],
      translateY: [14, 0],
      scale: [0.96, 1],
      duration: durationMs,
      easing: 'easeOutBack'
    });
  }

  if (isLose) {
    /* Dramatic red vignette pulse */
    anime({
      targets: vignette,
      opacity: [0, 0.9, 0.55],
      duration: 900,
      easing: 'easeOutQuad'
    });
    /* Subtle panel shake */
    if (panelEl) {
      anime({
        targets: panelEl,
        translateX: [0, -8, 8, -6, 6, -3, 3, 0],
        duration: 600,
        delay: 200,
        easing: 'easeOutQuad'
      });
    }
  } else {
    anime({
      targets: vignette,
      opacity: [0, 0.7],
      duration: 700,
      easing: 'easeOutQuad'
    });
  }
}

/* ============================================================
   OVERLAY OUT — fade panel and overlay, then remove `.show`.
   Calls onComplete exactly once.
   ============================================================ */
export function overlayOut(overlayEl, panelEl, onComplete, durationMs = DEFAULTS.overlayOutMs) {
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

  const vignette = overlayEl.querySelector('.vignette');
  if (vignette) {
    anime({
      targets: vignette,
      opacity: 0,
      duration: durationMs * 0.6,
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
      if (vignette && vignette.parentNode) vignette.parentNode.removeChild(vignette);
      if (onComplete) onComplete();
    }
  });
}