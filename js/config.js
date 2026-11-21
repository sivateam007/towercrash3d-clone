/* ============================================================
   TOWER CRASH 3D — config.js
   Central place for every tunable constant.
   Pure data — no imports, no side effects.
   ============================================================ */

/* ------------------------------------------------------------
   12 BLOCK / BALL COLORS  (bright candy palette)
   ------------------------------------------------------------ */
export const COLORS = [
  { id: 0,  name: 'red',     hex: 0xff4d5a, css: '#ff4d5a' },
  { id: 1,  name: 'blue',    hex: 0x3aa0ff, css: '#3aa0ff' },
  { id: 2,  name: 'yellow',  hex: 0xffd23f, css: '#ffd23f' },
  { id: 3,  name: 'purple',  hex: 0xa66bff, css: '#a66bff' },
  { id: 4,  name: 'magenta', hex: 0xff5ad2, css: '#ff5ad2' },
  { id: 5,  name: 'cyan',    hex: 0x2de2e6, css: '#2de2e6' },
  { id: 6,  name: 'orange',  hex: 0xff8a3d, css: '#ff8a3d' },
  { id: 7,  name: 'lime',    hex: 0x9dff3d, css: '#9dff3d' },
  { id: 8,  name: 'pink',    hex: 0xff9ecb, css: '#ff9ecb' },
  { id: 9,  name: 'teal',    hex: 0x20c9a4, css: '#20c9a4' },
  { id: 10, name: 'violet',  hex: 0x7d5bff, css: '#7d5bff' },
  { id: 11, name: 'coral',   hex: 0xff7a6b, css: '#ff7a6b' }
];

export const BALL_COLOR_ORDER = COLORS.map(c => c.id);

/* ------------------------------------------------------------
   BALL / PHYSICS
   ------------------------------------------------------------ */
export const BALL_RADIUS       = 0.66;   // physics ball radius (fired balls)
export const MUZZLE_BALL_RADIUS = 1.05;  // visual display ball at the cannon muzzle
export const BALL_SPEED        = 44;
export const BALL_MASS         = 4;
export const BALL_LIFE         = 3;      // seconds before a ball fades
export const BALL_SLOW_LIFE    = 0.9;    // seconds a stuck ball lingers
export const BALL_MAX_AGE      = 9;      // hard safety removal
export const BALL_Y_KILL       = -8;     // remove below this Y

export const GRAVITY           = 24;
export const HIT_RADIUS        = 1.35;
export const HIT_RADIUS_2      = HIT_RADIUS * HIT_RADIUS;

export const PHYSICS_STEP        = 1 / 120;
export const PHYSICS_MAX_SUBSTEP = 5;
export const SOLVER_ITERATIONS   = 20;
export const SOLVER_TOLERANCE    = 0.001;

export const LINEAR_DAMPING_BALL   = 0.0;
export const ANGULAR_DAMPING_BALL  = 0.05;
export const LINEAR_DAMPING_BLOCK  = 0.06;
export const ANGULAR_DAMPING_BLOCK = 0.18;

export const MAT_FRICTION_BALL_BLOCK     = 0.15;
export const MAT_RESTITUTION_BALL_BLOCK  = 0.72;
export const MAT_FRICTION_BALL_GROUND    = 0.30;
export const MAT_RESTITUTION_BALL_GROUND = 0.58;
export const MAT_FRICTION_BLOCK_BLOCK    = 0.62;
export const MAT_RESTITUTION_BLOCK_BLOCK = 0.00;
export const MAT_FRICTION_BLOCK_GROUND   = 0.72;
export const MAT_RESTITUTION_BLOCK_GROUND = 0.00;
export const MAT_DEFAULT_FRICTION        = 0.50;
export const MAT_DEFAULT_RESTITUTION     = 0.05;

export const BALL_DESTROY_SLOWDOWN = 0.90;

/* ------------------------------------------------------------
   CAMERA  (far-back over-the-shoulder, looking down the lane)
   ------------------------------------------------------------ */
export const CAMERA_FOV  = 55;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR  = 260;

export const CAMERA_BASE = { x: 0, y: 4.5, z: 45 };
export const CAMERA_LOOK = { x: 0, y: 4.0, z: -10 };
export const CAMERA_LERP_SPEED = 10;

export const AIM_YAW_LIMIT   = 0.28;
export const AIM_PITCH_BASE  = 0.10;
export const AIM_PITCH_RANGE = 0.22;
export const AIM_PITCH_MIN   = -0.02;
export const AIM_PITCH_MAX   = 0.42;

export const AIM_DOT_COUNT        = 22;
export const AIM_DOT_START_T      = 0.06;
export const AIM_DOT_STEP_T       = 0.06;
export const AIM_DOT_MIN_SCALE    = 0.35;
export const AIM_DOT_FALLOFF_DIV  = 1.5;

/* ------------------------------------------------------------
   CANNON  (small at bottom-center)
   ------------------------------------------------------------ */
export const CANNON_POSITION = { x: 0, y: 1.1, z: 22 };
export const CANNON_BALL_SPAWN = 1.6;   // distance along aim to spawn the fired ball
export const CANNON_BASE_Y = -0.30;

export const CANNON_BARREL_RADIUS_TOP    = 0.34;
export const CANNON_BARREL_RADIUS_BOTTOM = 0.48;
export const CANNON_BARREL_LENGTH        = 1.4;
export const CANNON_BASE_RADIUS_TOP      = 0.62;
export const CANNON_BASE_RADIUS_BOTTOM   = 0.78;
export const CANNON_BASE_HEIGHT          = 0.45;

export const MUZZLE_LABEL_SCALE = 2.1;   // sprite scale for the ball-count label

/* ------------------------------------------------------------
   TOWER  (ONE tall narrow column, tightly stacked)
   ------------------------------------------------------------ */
export const BLOCK_SIZE          = 1.6;
export const BLOCK_VISUAL_SCALE  = 1.0;    // no gaps → tight stack
export const TOWER_HEIGHT        = 8;      // level-1 height in blocks
export const TOWER_STAND_ELEV    = 3.0;
export const TOWER_COLUMN_OFFSET = 0.0;    // 0 → perfectly straight column
export const TOWER_X             = 0;
export const TOWER_Z             = -10;
export const TOWER_BLOCK_MASS    = 1;

export const PEDESTAL_RADIUS_TOP    = 1.30;
export const PEDESTAL_RADIUS_BOTTOM = 1.55;

/* ------------------------------------------------------------
   LEVEL PROGRESSION
   ------------------------------------------------------------ */
export const LEVEL_MAX = 30;

export function ballsForLevel(level) {
  return 10 + Math.floor(level * 1.6);
}

export function colorsForLevel(level) {
  return Math.min(3 + Math.floor(level / 1.5), COLORS.length);
}

export function towerHeightForLevel(level) {
  const base = TOWER_HEIGHT + Math.floor(level * 0.6);
  return Math.min(base, 24);
}

/* ------------------------------------------------------------
   SCORING / COMBO / ECONOMY
   ------------------------------------------------------------ */
export const BASE_POINTS_PER_BLOCK = 10;
export const COMBO_WINDOW          = 1.6;
export const COMBO_MULTIPLIERS     = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5];
export const COINS_PER_BLOCK       = 1;
export const COINS_PER_LEVEL_CLEAR = 15;
export const STARTING_COINS        = 60;
export const COINS_PER_UNUSED_BALL = 1;

/* ------------------------------------------------------------
   POWER-UPS  (matching the original prices)
   ------------------------------------------------------------ */
export const POWERUP_MULTIBALL = {
  id: 'multiball',
  price: 25,
  balls: 5,
  spreadRad: 0.055,
  spreadY: 0.014
};

export const POWERUP_EARTHQUAKE = {
  id: 'earthquake',
  price: 50,
  destroyChance: 0.34,
  impulseXZ: 8,
  impulseY: 7,
  impulseYJitter: 8
};

export const SHOTGUN_SPREAD_COUNT = 5;

/* ------------------------------------------------------------
   ARENA / WORLD VISUALS
   ------------------------------------------------------------ */
export const ARENA_GROUND_RADIUS  = 46;
export const ARENA_GRID_SIZE      = 70;
export const ARENA_GRID_DIVS      = 36;
export const ARENA_RING_RADIUS    = 17;
export const ARENA_PILLAR_COUNT   = 0;    // 0 → no pillar ring (matches original)
export const ARENA_PILLAR_RADIUS  = 22;
export const ARENA_PILLAR_HEIGHT  = 8;
export const LANE_STRIP_LENGTH    = 30;
export const LANE_STRIP_WIDTH     = 3.6;

export const SKY_TOP_HEX     = 0x9fd9ff;
export const SKY_HORIZON_HEX = 0x5fb6f2;
export const OCEAN_HEX       = 0x2f8fe0;
export const FOG_NEAR        = 42;
export const FOG_FAR         = 95;
export const FOG_COLOR_HEX   = 0x7ac0f0;

/* ------------------------------------------------------------
   UI / EFFECTS TIMING  (anime.js durations in ms)
   ------------------------------------------------------------ */
export const UI_HUD_COUNT_MS       = 420;
export const UI_PULSE_MS           = 320;
export const UI_BUTTON_FEEDBACK_MS = 380;
export const UI_OVERLAY_IN_MS      = 420;
export const UI_OVERLAY_OUT_MS     = 260;
export const UI_BALL_SPAWN_MS      = 180;

/* Particle burst */
export const FX_PARTICLE_COUNT     = 16;
export const FX_PARTICLE_LIFE_MIN  = 0.55;
export const FX_PARTICLE_LIFE_MAX  = 0.95;
export const FX_PARTICLE_GEO_SIZE  = 0.28;
export const FX_PARTICLE_GRAVITY   = 24;
export const FX_PARTICLE_SPEED_XZ  = 11;
export const FX_PARTICLE_SPEED_Y   = 10;

/* Shockwave ring */
export const FX_SHOCKWAVE_MS       = 420;
export const FX_SHOCKWAVE_START    = 0.35;
export const FX_SHOCKWAVE_END      = 2.6;

/* Camera shake / punch */
export const FX_SHAKE_DURATION     = 0.55;
export const FX_SHAKE_INTENSITY    = 0.9;
export const FX_PUNCH_MS           = 220;
export const FX_PUNCH_Z_OFFSET     = 0.6;
export const FX_PUNCH_Y_OFFSET     = 0.14;
export const FX_PUNCH_FOV_OFFSET   = 2.2;

/* Ball trail ghosts */
export const FX_TRAIL_ENABLED       = true;
export const FX_TRAIL_COUNT         = 10;
export const FX_TRAIL_SPAWN_MS      = 38;
export const FX_TRAIL_FADE_MS       = 300;
export const FX_TRAIL_START_SCALE   = 0.95;
export const FX_TRAIL_END_SCALE     = 0.05;
export const FX_TRAIL_START_OPACITY = 0.55;

/* Tower wobble (visual only — layered on top of physics) */
export const FX_WOBBLE_ENABLED     = true;
export const FX_WOBBLE_MS          = 340;
export const FX_WOBBLE_ANGLE       = 0.09;
export const FX_WOBBLE_RADIUS      = 2.4;

/* Overlay confetti (level clear) */
export const FX_CONFETTI_COUNT     = 24;
export const FX_CONFETTI_MS        = 1100;
export const FX_CONFETTI_GRAVITY   = 900;

/* Aim-dot stagger */
export const FX_AIM_DOT_STAGGER_MS = 22;
export const FX_AIM_DOT_POP_MS     = 260;

/* ------------------------------------------------------------
   UI STRINGS  (all copy lives in one place)
   ------------------------------------------------------------ */
export const UI_STRINGS = {
  intro: {
    title: 'TOWER CRASH 3D',
    text: 'Aim with the mouse, tap to fire.<br><b>Match the colors</b> to smash the tower — everything else bounces off.<br>Tap the ball counter to switch color.',
    button: 'PLAY'
  },
  win: {
    title: 'LEVEL CLEARED!',
    text: (level) => `Nice shooting! You cleared <b>level ${level}</b>.<br>Bigger towers, more colors — keep the combo alive!`,
    button: 'NEXT LEVEL'
  },
  lose: {
    title: 'OUT OF BALLS',
    text: (level) => `You ran out of balls on <b>level ${level}</b>.<br>Try aiming at blocks that match your ball color, and tap the ball counter to switch.`,
    button: 'TRY AGAIN'
  },
  hint: 'Move to aim · Tap to shoot',
  shopTitle: 'SHOP',
  shopText: 'Spend coins on power-ups.<br>Big combos and cleared levels drop extra coins.',
  shopButton: 'CLOSE'
};

/* ------------------------------------------------------------
   MISC
   ------------------------------------------------------------ */
export const MAX_PARTICLES = 260;
export const MAX_BALLS     = 40;
export const DEBUG         = false;