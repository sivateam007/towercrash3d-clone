/* ============================================================
   TOWER CRASH 3D — config.js
   Central place for every tunable constant.
   Pure data — no imports, no side effects.
   ============================================================ */

/* ------------------------------------------------------------
   12 BALL / BLOCK COLORS
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

/* Fallback order used when a color needs to be picked for the HUD / ball */
export const BALL_COLOR_ORDER = COLORS.map(c => c.id);

/* ------------------------------------------------------------
   BALL / PHYSICS
   ------------------------------------------------------------ */
export const BALL_RADIUS   = 0.66;
export const BALL_SPEED    = 42;
export const BALL_MASS     = 4;
export const BALL_LIFE     = 3;        // seconds before a ball is removed
export const BALL_SLOW_LIFE = 0.9;     // seconds a stuck ball lingers
export const BALL_MAX_AGE   = 9;       // hard safety removal
export const BALL_Y_KILL    = -8;      // remove below this Y

export const GRAVITY       = 22;
export const HIT_RADIUS    = 1.35;     // squared proximity check uses HIT_RADIUS^2
export const HIT_RADIUS_2  = HIT_RADIUS * HIT_RADIUS;

export const PHYSICS_STEP        = 1 / 120;
export const PHYSICS_MAX_SUBSTEP = 5;
export const SOLVER_ITERATIONS   = 20;
export const SOLVER_TOLERANCE    = 0.001;

export const LINEAR_DAMPING_BALL     = 0.0;
export const ANGULAR_DAMPING_BALL    = 0.05;
export const LINEAR_DAMPING_BLOCK    = 0.06;
export const ANGULAR_DAMPING_BLOCK   = 0.18;

/* Physics material parameters */
export const MAT_FRICTION_BALL_BLOCK   = 0.15;
export const MAT_RESTITUTION_BALL_BLOCK = 0.72;
export const MAT_FRICTION_BALL_GROUND  = 0.30;
export const MAT_RESTITUTION_BALL_GROUND = 0.58;
export const MAT_FRICTION_BLOCK_BLOCK  = 0.62;
export const MAT_RESTITUTION_BLOCK_BLOCK = 0.00;
export const MAT_FRICTION_BLOCK_GROUND = 0.72;
export const MAT_RESTITUTION_BLOCK_GROUND = 0.00;
export const MAT_DEFAULT_FRICTION    = 0.50;
export const MAT_DEFAULT_RESTITUTION = 0.05;

/* Ball velocity loss per destroyed block (0.9 = 10% loss) */
export const BALL_DESTROY_SLOWDOWN = 0.90;

/* ------------------------------------------------------------
   CAMERA (low over-the-shoulder)
   ------------------------------------------------------------ */
export const CAMERA_FOV    = 50;
export const CAMERA_NEAR   = 0.1;
export const CAMERA_FAR    = 300;
export const CAMERA_BASE   = { x: 0.9, y: 3.4, z: 24.0 };
export const CAMERA_LOOK   = { x: 0.0, y: 3.6, z: -2.0 };
export const CAMERA_DISTANCE_MIN = 35;
export const CAMERA_DISTANCE_MAX = 55;
export const CAMERA_LERP_SPEED   = 10;

export const AIM_YAW_LIMIT   = 0.72;
export const AIM_PITCH_BASE  = 0.24;
export const AIM_PITCH_RANGE = 0.30;
export const AIM_PITCH_MIN   = -0.05;
export const AIM_PITCH_MAX   = 0.58;

export const AIM_DOT_COUNT        = 20;
export const AIM_DOT_START_T      = 0.05;
export const AIM_DOT_STEP_T       = 0.05;
export const AIM_DOT_MIN_SCALE    = 0.35;
export const AIM_DOT_FALLOFF_DIV  = 1.5;

/* ------------------------------------------------------------
   CANNON
   ------------------------------------------------------------ */
export const CANNON_POSITION   = { x: 0, y: 1.7, z: 15 };
export const CANNON_BALL_SPAWN  = 2.9;   // distance along aim direction
export const CANNON_BASE_Y      = -0.35;

/* ------------------------------------------------------------
   TOWER GEOMETRY
   ------------------------------------------------------------ */
export const BLOCK_SIZE          = 1.1;
export const BLOCK_VISUAL_SCALE  = 0.96;
export const TOWER_HEIGHT        = 8;
export const TOWER_STAND_ELEV    = 3;
export const TOWER_COLUMN_OFFSET = 0.22;   // small jitter per block
export const TOWER_X             = 0;
export const TOWER_Z             = -10;
export const TOWER_BLOCK_MASS    = 1;

/* ------------------------------------------------------------
   LEVEL PROGRESSION
   ------------------------------------------------------------ */
export const LEVEL_MAX = 30;

/* Balls granted at the start of a level */
export function ballsForLevel(level) {
  return 10 + Math.floor(level * 1.6);
}

/* Number of distinct colors on the tower for a given level */
export function colorsForLevel(level) {
  return Math.min(3 + Math.floor(level / 1.5), COLORS.length);
}

/* Tower height (in blocks) for a given level */
export function towerHeightForLevel(level) {
  const base = TOWER_HEIGHT + Math.floor(level * 0.6);
  return Math.min(base, 26);
}

/* ------------------------------------------------------------
   SCORING / COMBO / ECONOMY
   ------------------------------------------------------------ */
export const BASE_POINTS_PER_BLOCK = 10;
export const COMBO_WINDOW          = 1.6;    // seconds between hits to keep combo
export const COMBO_MULTIPLIERS     = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5];
export const COINS_PER_BLOCK       = 1;
export const COINS_PER_LEVEL_CLEAR = 15;
export const STARTING_COINS        = 50;
export const COINS_PER_UNUSED_BALL = 1;

/* ------------------------------------------------------------
   POWER-UPS
   ------------------------------------------------------------ */
export const POWERUP_MULTIBALL   = { id: 'multiball',   price: 25, balls: 5, spreadRad: 0.055, spreadY: 0.014 };
export const POWERUP_EARTHQUAKE  = { id: 'earthquake',  price: 50, destroyChance: 0.34, impulseXZ: 8, impulseY: 7, impulseYJitter: 8 };

export const SHOTGUN_SPREAD_COUNT = 5;

/* ------------------------------------------------------------
   ARENA / WORLD VISUALS
   ------------------------------------------------------------ */
export const ARENA_GROUND_RADIUS  = 46;
export const ARENA_GRID_SIZE      = 70;
export const ARENA_GRID_DIVS      = 36;
export const ARENA_RING_RADIUS    = 17;
export const ARENA_PILLAR_COUNT   = 14;
export const ARENA_PILLAR_RADIUS  = 22;
export const ARENA_PILLAR_HEIGHT  = 8;

export const FOG_NEAR = 42;
export const FOG_FAR  = 90;

/* ------------------------------------------------------------
   UI / EFFECTS TIMING (anime.js durations in ms)
   ------------------------------------------------------------ */
export const UI_HUD_COUNT_MS       = 420;
export const UI_PULSE_MS           = 320;
export const UI_BUTTON_FEEDBACK_MS = 380;
export const UI_OVERLAY_IN_MS      = 420;
export const UI_OVERLAY_OUT_MS     = 260;
export const UI_BALL_SPAWN_MS      = 180;

export const FX_PARTICLE_COUNT     = 10;
export const FX_PARTICLE_LIFE_MIN  = 0.55;
export const FX_PARTICLE_LIFE_MAX  = 0.90;
export const FX_PARTICLE_GEO_SIZE  = 0.24;
export const FX_PARTICLE_GRAVITY   = 22;

export const FX_SHAKE_DURATION     = 0.8;
export const FX_SHAKE_INTENSITY    = 1.1;
export const FX_PUNCH_MS           = 220;
export const FX_PUNCH_Z_OFFSET     = 0.5;
export const FX_PUNCH_Y_OFFSET     = 0.12;

/* ------------------------------------------------------------
   UI STRINGS (kept in config so all copy lives in one place)
   ------------------------------------------------------------ */
export const UI_STRINGS = {
  intro: {
    title: 'TOWER CRASH 3D',
    text: 'Aim with the mouse, tap to fire.<br><b>Match the colors</b> to smash the tower — everything else bounces off.<br>Tap the ball at the bottom to switch color.',
    button: 'PLAY'
  },
  win: {
    title: 'LEVEL CLEARED!',
    text: (level) => `Nice shooting! You cleared <b>level ${level}</b>.<br>Keep the combo alive — the tower grows every level.`,
    button: 'NEXT LEVEL'
  },
  lose: {
    title: 'OUT OF BALLS',
    text: (level) => `You ran out of balls on <b>level ${level}</b>.<br>Try aiming at blocks that match your ball color, and tap the ball to switch.`,
    button: 'TRY AGAIN'
  },
  hint: 'Move to aim · Tap to shoot',
  shopTitle: 'SHOP',
  shopText: 'Spend coins to upgrade your power-ups.<br>More coins drop from big combos and cleared levels.',
  shopButton: 'CLOSE'
};

/* ------------------------------------------------------------
   MISC
   ------------------------------------------------------------ */
export const MAX_PARTICLES = 240;
export const MAX_BALLS     = 40;
export const DEBUG         = false;