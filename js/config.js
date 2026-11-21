/* ============================================================
   TOWER CRASH 3D — config.js
   ORBIT CAMERA + separate fire control.
   Blocks are static. Colors vivid (no emissive wash).
   ============================================================ */

/* ------------------------------------------------------------
   12 BLOCK / BALL COLORS  (saturated candy palette)
   ------------------------------------------------------------ */
export const COLORS = [
  { id: 0,  name: 'red',     hex: 0xff2e4a, css: '#ff2e4a' },
  { id: 1,  name: 'blue',    hex: 0x0e7cff, css: '#0e7cff' },
  { id: 2,  name: 'yellow',  hex: 0xffc700, css: '#ffc700' },
  { id: 3,  name: 'purple',  hex: 0x9a4dff, css: '#9a4dff' },
  { id: 4,  name: 'magenta', hex: 0xff38b4, css: '#ff38b4' },
  { id: 5,  name: 'cyan',    hex: 0x18d8e0, css: '#18d8e0' },
  { id: 6,  name: 'orange',  hex: 0xff6b1a, css: '#ff6b1a' },
  { id: 7,  name: 'lime',    hex: 0x7cff2e, css: '#7cff2e' },
  { id: 8,  name: 'pink',    hex: 0xff7fbf, css: '#ff7fbf' },
  { id: 9,  name: 'teal',    hex: 0x0fcfa0, css: '#0fcfa0' },
  { id: 10, name: 'violet',  hex: 0x6a3cff, css: '#6a3cff' },
  { id: 11, name: 'coral',   hex: 0xff5f4a, css: '#ff5f4a' }
];

export const BALL_COLOR_ORDER = COLORS.map(c => c.id);

/* ------------------------------------------------------------
   BALL / PHYSICS  (matches original: ballRadius 0.66, life 3s)
   ------------------------------------------------------------ */
export const BALL_RADIUS        = 0.66;
export const MUZZLE_BALL_RADIUS = 1.15;
export const BALL_SPEED         = 44;
export const BALL_MASS          = 4;
export const BALL_LIFE          = 3;
export const BALL_SLOW_LIFE     = 0.9;
export const BALL_MAX_AGE       = 9;
export const BALL_Y_KILL        = -8;

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
   ORBIT CAMERA  (matches original attributes)
   Original: distance min 35 / max 55, pitch range −90°..+90°,
   orbit sensitivity 0.3, distance sensitivity 0.15,
   minCameraHeight 13.25, cameraDeltaY 4.5.
   We orbit around a FOCUS point at the tower, with separate
   yaw / pitch controls and hard clamps that keep the tower
   framed at all times.
   ------------------------------------------------------------ */
export const CAMERA_FOV  = 50;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR  = 300;

/* Focal point — mid-height of the tower. */
export const CAMERA_FOCUS = {
  x: 0,
  y: 3.0 + 5.0,   // TOWER_STAND_ELEV + ~half tower height
  z: -5           // TOWER_Z
};

/* Orbital distance (from FOCUS) — matches original 35..55. */
export const CAMERA_DISTANCE_MIN  = 35;
export const CAMERA_DISTANCE_MAX  = 55;
export const CAMERA_DISTANCE_INIT = 42;

/* Yaw (left/right orbit) in radians. Clamped so the tower
   stays framed from any side but the player can see behind
   the front wall by orbiting. */
export const CAMERA_YAW_INIT   =  0.0;
export const CAMERA_YAW_MIN    = -1.20;   // ≈ -69°
export const CAMERA_YAW_MAX    =  1.20;   // ≈ +69°

/* Pitch (up/down) in radians. High positive pitch = camera
   above the tower looking down. Clamped to keep camera above
   minCameraHeight 13.25. */
export const CAMERA_PITCH_INIT = 0.22;    // ≈ 12.6° above horizon
export const CAMERA_PITCH_MIN  = 0.06;    // ≈ 3.4°  (near-horizon)
export const CAMERA_PITCH_MAX  = 0.72;    // ≈ 41°   (looking down)

/* Minimum world Y for the camera — belt-and-braces safeguard. */
export const CAMERA_MIN_Y = 13.25;

/* Input sensitivities (match PlayCanvas original scale). */
export const ORBIT_YAW_SENSITIVITY   = 0.0050;   // rad per pixel
export const ORBIT_PITCH_SENSITIVITY = 0.0035;   // rad per pixel
export const WHEEL_ZOOM_STEP         = 2.2;      // units per wheel notch
export const PINCH_ZOOM_SENSITIVITY  = 0.025;    // fraction per pinch px

/* Drag vs tap detection. */
export const DRAG_THRESHOLD_PX = 8;
export const TAP_MAX_MS        = 320;

/* Camera smoothing. */
export const CAMERA_LERP_YAW      = 18;
export const CAMERA_LERP_PITCH    = 18;
export const CAMERA_LERP_DISTANCE = 14;

/* ------------------------------------------------------------
   CANNON — screen-anchored (bottom-center of viewport)
   Position computed every frame from camera forward + down.
   ------------------------------------------------------------ */
export const CANNON_FORWARD_OFFSET = 12.0;   // distance ahead of camera
export const CANNON_DOWN_OFFSET    = 5.2;    // distance below camera

export const CANNON_BALL_SPAWN      = 1.6;   // spawn distance along aim
export const CANNON_BASE_Y          = -0.30;

export const CANNON_BARREL_RADIUS_TOP    = 0.42;
export const CANNON_BARREL_RADIUS_BOTTOM = 0.62;
export const CANNON_BARREL_LENGTH        = 1.6;
export const CANNON_BASE_RADIUS_TOP      = 0.78;
export const CANNON_BASE_RADIUS_BOTTOM   = 0.98;
export const CANNON_BASE_HEIGHT          = 0.55;

export const CANNON_SCALE = 1.7;
export const CANNON_MUZZLE_LABEL_SCALE = 3.4;

/* ------------------------------------------------------------
   AIM / RETICLE
   Straight line from the muzzle to CAMERA_FOCUS.
   ------------------------------------------------------------ */
export const AIM_DOT_COUNT        = 22;
export const AIM_DOT_START_T      = 0.06;
export const AIM_DOT_STEP_T       = 0.06;
export const AIM_DOT_MIN_SCALE    = 0.38;
export const AIM_DOT_FALLOFF_DIV  = 1.5;
export const AIM_DOT_RADIUS       = 0.14;

export const AIM_RETICLE_RADIUS   = 0.42;
export const AIM_RETICLE_SEGMENTS = 24;

/* ------------------------------------------------------------
   TOWER — 2×2 footprint, static bodies, tight stack
   (matches original: standDiameter 10, standElevation 3,
    availableHeight 8)
   ------------------------------------------------------------ */
export const BLOCK_SIZE          = 1.5;
export const BLOCK_VISUAL_SCALE  = 0.94;
export const BLOCK_EDGE_OPACITY  = 0.35;
export const TOWER_HEIGHT        = 8;
export const TOWER_STAND_ELEV    = 3.0;
export const TOWER_X             = 0;
export const TOWER_Z             = -5;
export const TOWER_BLOCK_MASS    = 0;      // STATIC — never falls

export const TOWER_FOOTPRINT     = 2;
export const TOWER_BRICK_OFFSET  = 0.08;

export const PEDESTAL_RADIUS_TOP    = 4.6;
export const PEDESTAL_RADIUS_BOTTOM = 5.0;
export const PEDESTAL_RIM_RADIUS    = 4.7;
export const PEDESTAL_RIM_HEIGHT    = 0.15;

/* ------------------------------------------------------------
   LEVEL PROGRESSION
   ------------------------------------------------------------ */
export const LEVEL_MAX = 30;

export function ballsForLevel(level) {
  return 12 + Math.floor(level * 1.6);
}

export function colorsForLevel(level) {
  return Math.min(3 + Math.floor(level / 1.5), COLORS.length);
}

export function towerHeightForLevel(level) {
  const base = TOWER_HEIGHT + Math.floor(level * 0.5);
  return Math.min(base, 18);
}

export function requiredClearCount(total) {
  return Math.floor(total * 0.9);
}

/* ------------------------------------------------------------
   SCORING / COMBO / ECONOMY
   (baseItemScore 5, comboBarLevelMultiplier 1.1)
   ------------------------------------------------------------ */
export const BASE_POINTS_PER_BLOCK  = 5;
export const COMBO_WINDOW           = 1.8;
export const COMBO_MULTIPLIERS      = [1, 1.1, 1.3, 1.6, 2, 2.5, 3, 4, 5];
export const COINS_PER_BLOCK        = 1;
export const COINS_PER_LEVEL_CLEAR  = 15;
export const STARTING_COINS         = 60;
export const COINS_PER_UNUSED_BALL  = 1;

/* ------------------------------------------------------------
   POWER-UPS  (original prices: Multiball 25, Earthquake 50)
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
   ARENA / SKY / OCEAN / MATERIALS
   ------------------------------------------------------------ */
export const ARENA_GROUND_RADIUS  = 400;
export const ARENA_GRID_SIZE      = 70;
export const ARENA_GRID_DIVS      = 36;
export const ARENA_RING_RADIUS    = 17;
export const LANE_STRIP_LENGTH    = 30;
export const LANE_STRIP_WIDTH     = 3.6;

export const SKY_TOP_HEX     = 0x8fd0ff;
export const SKY_MID_HEX     = 0xc8ecff;
export const SKY_HORIZON_HEX = 0x6fc0f0;
export const SKY_BELOW_HEX   = 0x3e9bdd;

export const OCEAN_HEX          = 0x0f4c99;
export const OCEAN_ROUGHNESS    = 0.08;
export const OCEAN_METALNESS    = 0.60;
export const OCEAN_ENV_INTENSITY = 0.30;
export const OCEAN_Y            = -0.1;

export const FOG_COLOR_HEX = 0xdfeaf5;   // neutral white-blue, not saturated
export const FOG_DENSITY   = 0.0030;

/* VIVID COLOR FIX — tuned so candy colors read saturated. */
export const EXPOSURE          = 0.85;
export const ENV_INTENSITY     = 0.30;

export const SUN_INTENSITY       = 1.30;
export const SUN_POSITION        = { x: 14, y: 30, z: 18 };
export const SUN_SHADOW_MAP_SIZE = 2048;
export const SUN_SHADOW_BOUNDS   = 25;
export const SUN_SHADOW_BIAS     = -0.0006;

export const HEMI_INTENSITY    = 0.28;
export const HEMI_SKY_COLOR    = 0xffffff;
export const HEMI_GROUND_COLOR = 0x4a5f7e;

export const RIM_INTENSITY = 0.28;
export const RIM_COLOR     = 0xdfefff;
export const RIM_POSITION  = { x: -18, y: 14, z: -24 };

/* ------------------------------------------------------------
   MATERIALS  (emissive 0 on blocks — vivid, not pastel)
   ------------------------------------------------------------ */
export const BLOCK_MAT = {
  metalness: 0.15,
  roughness: 0.30,
  clearcoat: 0.30,
  clearcoatRoughness: 0.20,
  emissiveIntensity: 0.0,
  envMapIntensity: 0.30
};

export const BALL_MAT = {
  metalness: 0.25,
  roughness: 0.20,
  clearcoat: 0.80,
  clearcoatRoughness: 0.10,
  emissiveIntensity: 0.18,
  envMapIntensity: 0.35
};

export const PEDESTAL_MAT = {
  color: 0x4a5568,
  roughness: 0.55,
  metalness: 0.35
};

export const PEDESTAL_RIM_COLOR = 0x6a7a90;

export const CANNON_MAT = {
  color: 0x6b7280,
  roughness: 0.35,
  metalness: 0.85
};

export const CANNON_BASE_COLOR = 0x4a5568;

/* ------------------------------------------------------------
   UI / EFFECTS TIMING
   ------------------------------------------------------------ */
export const UI_HUD_COUNT_MS       = 420;
export const UI_PULSE_MS           = 320;
export const UI_BUTTON_FEEDBACK_MS = 380;
export const UI_OVERLAY_IN_MS      = 420;
export const UI_OVERLAY_OUT_MS     = 260;
export const UI_BALL_SPAWN_MS      = 180;

/* Particle burst */
export const FX_PARTICLE_COUNT     = 20;
export const FX_PARTICLE_LIFE_MIN  = 0.55;
export const FX_PARTICLE_LIFE_MAX  = 0.95;
export const FX_PARTICLE_GEO_SIZE  = 0.28;
export const FX_PARTICLE_GRAVITY   = 24;
export const FX_PARTICLE_SPEED_XZ  = 11;
export const FX_PARTICLE_SPEED_Y   = 10;

/* Shockwave ring */
export const FX_SHOCKWAVE_MS    = 500;
export const FX_SHOCKWAVE_START = 0.32;
export const FX_SHOCKWAVE_END   = 3.4;

/* Camera shake / punch */
export const FX_SHAKE_DURATION   = 0.32;
export const FX_SHAKE_INTENSITY  = 1.1;
export const FX_PUNCH_MS         = 200;
export const FX_PUNCH_Z_OFFSET   = 0.6;
export const FX_PUNCH_Y_OFFSET   = 0.14;
export const FX_PUNCH_FOV_OFFSET = 3.5;

/* Ball trail ghosts */
export const FX_TRAIL_ENABLED       = true;
export const FX_TRAIL_COUNT         = 10;
export const FX_TRAIL_SPAWN_MS      = 38;
export const FX_TRAIL_FADE_MS       = 350;
export const FX_TRAIL_START_SCALE   = 0.95;
export const FX_TRAIL_END_SCALE     = 0.05;
export const FX_TRAIL_START_OPACITY = 0.70;

/* Tower wobble */
export const FX_WOBBLE_ENABLED  = true;
export const FX_WOBBLE_MS       = 340;
export const FX_WOBBLE_ANGLE    = 0.09;
export const FX_WOBBLE_RADIUS   = 3.2;
export const FX_WOBBLE_STRENGTH = 1.4;

/* Score popup */
export const FX_SCORE_POPUP_MS   = 800;
export const FX_SCORE_POPUP_RISE = 3.0;

/* Overlay confetti */
export const FX_CONFETTI_COUNT   = 26;
export const FX_CONFETTI_MS      = 1200;
export const FX_CONFETTI_GRAVITY = 900;

/* Aim-dot stagger */
export const FX_AIM_DOT_STAGGER_MS = 22;
export const FX_AIM_DOT_POP_MS     = 260;

/* Combo chip pop */
export const FX_COMBO_POP_MS = 300;

/* ------------------------------------------------------------
   UI STRINGS
   ------------------------------------------------------------ */
export const UI_STRINGS = {
  intro: {
    title: 'TOWER CRASH 3D',
    text: 'Drag to orbit · Scroll to zoom · Click to fire.<br><b>Match the colors</b> to smash the tower — everything else bounces off.<br>Tap the ball counter to switch color.',
    button: 'PLAY'
  },
  win: {
    title: 'LEVEL CLEARED!',
    text: (level) => `Nice shooting! You cleared <b>level ${level}</b>.<br>Bigger towers, more colors — keep the combo alive!`,
    button: 'NEXT LEVEL'
  },
  lose: {
    title: 'OUT OF BALLS',
    text: (level) => `You ran out of balls on <b>level ${level}</b>.<br>Try orbiting to aim at blocks that match your ball color, and tap the ball counter to switch.`,
    button: 'TRY AGAIN'
  },
  hint: 'Drag to orbit · Scroll to zoom · Click to fire',
  shopTitle: 'SHOP',
  shopText: 'Spend coins on power-ups.<br>Big combos and cleared levels drop extra coins.',
  shopButton: 'CLOSE'
};

/* ------------------------------------------------------------
   MISC
   ------------------------------------------------------------ */
export const MAX_PARTICLES = 300;
export const MAX_BALLS     = 40;
export const DEBUG         = false;