/* ============================================================
   TOWER CRASH 3D — game.js
   FULL REWRITE — orbit camera + separate fire control.
   Blocks static (mass: 0) so tower never pre-collapses.
   ============================================================ */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import anime from 'animejs';

import {
  COLORS,
  BALL_RADIUS,
  MUZZLE_BALL_RADIUS,
  BALL_SPEED,
  BALL_MASS,
  BALL_LIFE,
  BALL_SLOW_LIFE,
  BALL_MAX_AGE,
  BALL_Y_KILL,
  GRAVITY,
  HIT_RADIUS_2,
  PHYSICS_STEP,
  PHYSICS_MAX_SUBSTEP,
  SOLVER_ITERATIONS,
  SOLVER_TOLERANCE,
  LINEAR_DAMPING_BALL,
  ANGULAR_DAMPING_BALL,
  LINEAR_DAMPING_BLOCK,
  ANGULAR_DAMPING_BLOCK,
  MAT_FRICTION_BALL_BLOCK,
  MAT_RESTITUTION_BALL_BLOCK,
  MAT_FRICTION_BALL_GROUND,
  MAT_RESTITUTION_BALL_GROUND,
  MAT_FRICTION_BLOCK_BLOCK,
  MAT_RESTITUTION_BLOCK_BLOCK,
  MAT_FRICTION_BLOCK_GROUND,
  MAT_RESTITUTION_BLOCK_GROUND,
  MAT_DEFAULT_FRICTION,
  MAT_DEFAULT_RESTITUTION,
  BALL_DESTROY_SLOWDOWN,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
  CAMERA_FOCUS,
  CAMERA_DISTANCE_MIN,
  CAMERA_DISTANCE_MAX,
  CAMERA_DISTANCE_INIT,
  CAMERA_YAW_INIT,
  CAMERA_YAW_MIN,
  CAMERA_YAW_MAX,
  CAMERA_PITCH_INIT,
  CAMERA_PITCH_MIN,
  CAMERA_PITCH_MAX,
  CAMERA_MIN_Y,
  ORBIT_YAW_SENSITIVITY,
  ORBIT_PITCH_SENSITIVITY,
  WHEEL_ZOOM_STEP,
  PINCH_ZOOM_SENSITIVITY,
  DRAG_THRESHOLD_PX,
  TAP_MAX_MS,
  CAMERA_LERP_YAW,
  CAMERA_LERP_PITCH,
  CAMERA_LERP_DISTANCE,
  CANNON_FORWARD_OFFSET,
  CANNON_DOWN_OFFSET,
  CANNON_BALL_SPAWN,
  CANNON_BASE_Y,
  CANNON_BARREL_RADIUS_TOP,
  CANNON_BARREL_RADIUS_BOTTOM,
  CANNON_BARREL_LENGTH,
  CANNON_BASE_RADIUS_TOP,
  CANNON_BASE_RADIUS_BOTTOM,
  CANNON_BASE_HEIGHT,
  CANNON_SCALE,
  CANNON_MUZZLE_LABEL_SCALE,
  AIM_DOT_COUNT,
  AIM_DOT_START_T,
  AIM_DOT_STEP_T,
  AIM_DOT_MIN_SCALE,
  AIM_DOT_FALLOFF_DIV,
  AIM_DOT_RADIUS,
  AIM_RETICLE_RADIUS,
  AIM_RETICLE_SEGMENTS,
  BLOCK_SIZE,
  BLOCK_VISUAL_SCALE,
  BLOCK_EDGE_OPACITY,
  TOWER_HEIGHT,
  TOWER_STAND_ELEV,
  TOWER_X,
  TOWER_Z,
  TOWER_BLOCK_MASS,
  TOWER_FOOTPRINT,
  TOWER_BRICK_OFFSET,
  PEDESTAL_RADIUS_TOP,
  PEDESTAL_RADIUS_BOTTOM,
  PEDESTAL_RIM_RADIUS,
  PEDESTAL_RIM_HEIGHT,
  LEVEL_MAX,
  ballsForLevel,
  colorsForLevel,
  towerHeightForLevel,
  requiredClearCount,
  BASE_POINTS_PER_BLOCK,
  COMBO_WINDOW,
  COMBO_MULTIPLIERS,
  COINS_PER_BLOCK,
  COINS_PER_LEVEL_CLEAR,
  STARTING_COINS,
  POWERUP_MULTIBALL,
  POWERUP_EARTHQUAKE,
  SHOTGUN_SPREAD_COUNT,
  ARENA_GROUND_RADIUS,
  ARENA_GRID_SIZE,
  ARENA_GRID_DIVS,
  ARENA_RING_RADIUS,
  LANE_STRIP_LENGTH,
  LANE_STRIP_WIDTH,
  SKY_TOP_HEX,
  SKY_MID_HEX,
  SKY_HORIZON_HEX,
  SKY_BELOW_HEX,
  OCEAN_HEX,
  OCEAN_ROUGHNESS,
  OCEAN_METALNESS,
  OCEAN_ENV_INTENSITY,
  OCEAN_Y,
  FOG_DENSITY,
  FOG_COLOR_HEX,
  BLOCK_MAT,
  BALL_MAT,
  PEDESTAL_MAT,
  PEDESTAL_RIM_COLOR,
  CANNON_MAT,
  CANNON_BASE_COLOR,
  SUN_INTENSITY,
  SUN_POSITION,
  SUN_SHADOW_MAP_SIZE,
  SUN_SHADOW_BOUNDS,
  SUN_SHADOW_BIAS,
  HEMI_INTENSITY,
  HEMI_SKY_COLOR,
  HEMI_GROUND_COLOR,
  RIM_INTENSITY,
  RIM_COLOR,
  RIM_POSITION,
  EXPOSURE,
  ENV_INTENSITY,
  UI_HUD_COUNT_MS,
  UI_PULSE_MS,
  UI_BALL_SPAWN_MS,
  FX_PARTICLE_COUNT,
  FX_PARTICLE_LIFE_MIN,
  FX_PARTICLE_LIFE_MAX,
  FX_PARTICLE_GEO_SIZE,
  FX_PARTICLE_GRAVITY,
  FX_PARTICLE_SPEED_XZ,
  FX_PARTICLE_SPEED_Y,
  FX_TRAIL_ENABLED,
  FX_TRAIL_COUNT,
  FX_TRAIL_SPAWN_MS,
  FX_TRAIL_FADE_MS,
  FX_TRAIL_START_SCALE,
  FX_TRAIL_END_SCALE,
  FX_TRAIL_START_OPACITY,
  FX_WOBBLE_ENABLED,
  FX_WOBBLE_RADIUS,
  FX_WOBBLE_STRENGTH,
  FX_CONFETTI_COUNT,
  FX_CONFETTI_MS,
  FX_CONFETTI_GRAVITY,
  FX_AIM_DOT_STAGGER_MS,
  FX_AIM_DOT_POP_MS,
  FX_SCORE_POPUP_MS,
  FX_SCORE_POPUP_RISE,
  UI_STRINGS,
  MAX_PARTICLES,
  MAX_BALLS,
  DEBUG
} from './config.js';

import {
  burst,
  shake as cameraShake,
  punch as cameraPunch,
  countTo,
  pulse,
  buttonFeedback,
  overlayIn,
  overlayOut,
  shockwave,
  wobble,
  confetti
} from './effects.js';

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const dom = {
  sceneHost:       document.getElementById('scene'),
  coins:           document.getElementById('hudCoins'),
  coinsWrap:       document.getElementById('hudCoinsWrap'),
  level:           document.getElementById('hudLevel'),
  levelNext:       document.getElementById('hudLevelNext'),
  progress:        document.getElementById('hudProgress'),
  progressFill:    document.getElementById('hudProgressFill'),
  progressNotch:   document.getElementById('hudProgressNotch'),
  levelWrap:       document.getElementById('hudLevelWrap'),
  btnShop:         document.getElementById('btnShop'),
  btnMultiball:    document.getElementById('btnMultiball'),
  btnEarthquake:   document.getElementById('btnEarthquake'),
  priceMultiball:  document.getElementById('priceMultiball'),
  priceEarthquake: document.getElementById('priceEarthquake'),
  badgeMultiball:  document.getElementById('badgeMultiball'),
  badgeEarthquake: document.getElementById('badgeEarthquake'),
  balls:           document.getElementById('hudBalls'),
  ballDot:         document.getElementById('hudBallDot'),
  ballsWrap:       document.getElementById('hudBallsWrap'),
  hint:            document.getElementById('hint'),
  overlay:         document.getElementById('overlay'),
  panel:           document.getElementById('panel'),
  ovTitle:         document.getElementById('ovTitle'),
  ovText:          document.getElementById('ovText'),
  ovBtn:           document.getElementById('ovBtn')
};

/* ============================================================
   RENDERER / SCENE / CAMERA
   ============================================================ */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = EXPOSURE;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);
dom.sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(FOG_COLOR_HEX, FOG_DENSITY);

const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  CAMERA_NEAR,
  CAMERA_FAR
);

/* Orbit state — this replaces the old fixed camera. */
const orbit = {
  yaw:      CAMERA_YAW_INIT,
  pitch:    CAMERA_PITCH_INIT,
  distance: CAMERA_DISTANCE_INIT,
  targetYaw:      CAMERA_YAW_INIT,
  targetPitch:    CAMERA_PITCH_INIT,
  targetDistance: CAMERA_DISTANCE_INIT,
  focus: new THREE.Vector3(CAMERA_FOCUS.x, CAMERA_FOCUS.y, CAMERA_FOCUS.z)
};

/* Place camera at init so first frame is correct. */
function placeCameraFromOrbit() {
  const cp = Math.cos(orbit.pitch);
  const x = orbit.focus.x + orbit.distance * Math.sin(orbit.yaw) * cp;
  const y = orbit.focus.y + orbit.distance * Math.sin(orbit.pitch);
  const z = orbit.focus.z + orbit.distance * Math.cos(orbit.yaw) * cp;
  camera.position.set(x, Math.max(CAMERA_MIN_Y, y), z);
  camera.lookAt(orbit.focus);
}
placeCameraFromOrbit();

/* ============================================================
   SKY TEXTURE + PMREM ENVIRONMENT MAP
   ============================================================ */
function makeSkyEquirect() {
  const w = 1024, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const toHex = (n) => '#' + n.toString(16).padStart(6, '0');

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.00, toHex(SKY_TOP_HEX));
  grad.addColorStop(0.35, toHex(SKY_MID_HEX));
  grad.addColorStop(0.55, toHex(SKY_HORIZON_HEX));
  grad.addColorStop(0.72, toHex(SKY_HORIZON_HEX));
  grad.addColorStop(1.00, toHex(SKY_BELOW_HEX));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  /* Soft sun blob — reduced intensity so it doesn't wash colors. */
  const sunX = w * 0.72;
  const sunY = h * 0.18;
  const sunR = h * 0.28;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  sunGrad.addColorStop(0.00, 'rgba(255, 255, 240, 0.35)');
  sunGrad.addColorStop(0.35, 'rgba(255, 240, 200, 0.15)');
  sunGrad.addColorStop(1.00, 'rgba(255, 240, 200, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.14;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * w;
    const y = h * 0.15 + Math.random() * h * 0.25;
    const rx = 40 + Math.random() * 90;
    const ry = 8 + Math.random() * 16;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const skyTexture = makeSkyEquirect();
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
const envMap = pmrem.fromEquirectangular(skyTexture).texture;
scene.environment = envMap;
if ('environmentIntensity' in scene) {
  scene.environmentIntensity = ENV_INTENSITY;
}

const skyDomeGeo = new THREE.SphereGeometry(200, 40, 24);
const skyDomeMat = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
  depthWrite: false,
  fog: false
});
const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
scene.add(skyDome);

/* ============================================================
   LIGHTS  (vivid-color tuned: low ambient, neutral warm sun)
   ============================================================ */
const hemi = new THREE.HemisphereLight(HEMI_SKY_COLOR, HEMI_GROUND_COLOR, HEMI_INTENSITY);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, SUN_INTENSITY);
sun.position.set(SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z);
sun.castShadow = true;
sun.shadow.mapSize.set(SUN_SHADOW_MAP_SIZE, SUN_SHADOW_MAP_SIZE);
sun.shadow.camera.left   = -SUN_SHADOW_BOUNDS;
sun.shadow.camera.right  =  SUN_SHADOW_BOUNDS;
sun.shadow.camera.top    =  SUN_SHADOW_BOUNDS * 1.6;
sun.shadow.camera.bottom = -SUN_SHADOW_BOUNDS;
sun.shadow.camera.near   = 1;
sun.shadow.camera.far    = 120;
sun.shadow.bias = SUN_SHADOW_BIAS;
scene.add(sun);

const rim = new THREE.DirectionalLight(RIM_COLOR, RIM_INTENSITY);
rim.position.set(RIM_POSITION.x, RIM_POSITION.y, RIM_POSITION.z);
scene.add(rim);

/* ============================================================
   OCEAN PLANE — reflective, extends to the horizon
   ============================================================ */
const oceanGeo = new THREE.CircleGeometry(ARENA_GROUND_RADIUS, 128);
oceanGeo.rotateX(-Math.PI / 2);
const oceanMat = new THREE.MeshStandardMaterial({
  color: OCEAN_HEX,
  roughness: OCEAN_ROUGHNESS,
  metalness: OCEAN_METALNESS,
  envMapIntensity: OCEAN_ENV_INTENSITY
});
const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
oceanMesh.position.y = OCEAN_Y;
oceanMesh.receiveShadow = true;
scene.add(oceanMesh);

/* ============================================================
   ARENA DETAILS — grid, ring, lane strip
   ============================================================ */
const grid = new THREE.GridHelper(ARENA_GRID_SIZE, ARENA_GRID_DIVS, 0xbfe3ff, 0x7ac0f0);
grid.position.y = OCEAN_Y + 0.015;
grid.material.opacity = 0.18;
grid.material.transparent = true;
scene.add(grid);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(ARENA_RING_RADIUS, 0.12, 12, 128),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xbfe3ff,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.25
  })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = OCEAN_Y + 0.06;
scene.add(ring);

const laneGeo = new THREE.PlaneGeometry(LANE_STRIP_WIDTH, LANE_STRIP_LENGTH);
laneGeo.rotateX(-Math.PI / 2);
const laneMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.10,
  depthWrite: false
});
const laneStrip = new THREE.Mesh(laneGeo, laneMat);
laneStrip.position.set(0, OCEAN_Y + 0.02, (0 + TOWER_Z) / 2);
scene.add(laneStrip);

/* ============================================================
   PHYSICS WORLD
   ============================================================ */
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -GRAVITY, 0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = false;
world.solver.iterations = SOLVER_ITERATIONS;
world.solver.tolerance = SOLVER_TOLERANCE;

const matGround = new CANNON.Material('ground');
const matBlock  = new CANNON.Material('block');
const matBall   = new CANNON.Material('ball');

world.addContactMaterial(new CANNON.ContactMaterial(matBall, matBlock, {
  friction: MAT_FRICTION_BALL_BLOCK,
  restitution: MAT_RESTITUTION_BALL_BLOCK
}));
world.addContactMaterial(new CANNON.ContactMaterial(matBall, matGround, {
  friction: MAT_FRICTION_BALL_GROUND,
  restitution: MAT_RESTITUTION_BALL_GROUND
}));
world.addContactMaterial(new CANNON.ContactMaterial(matBlock, matBlock, {
  friction: MAT_FRICTION_BLOCK_BLOCK,
  restitution: MAT_RESTITUTION_BLOCK_BLOCK
}));
world.addContactMaterial(new CANNON.ContactMaterial(matBlock, matGround, {
  friction: MAT_FRICTION_BLOCK_GROUND,
  restitution: MAT_RESTITUTION_BLOCK_GROUND
}));
world.defaultContactMaterial.friction = MAT_DEFAULT_FRICTION;
world.defaultContactMaterial.restitution = MAT_DEFAULT_RESTITUTION;

const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: matGround
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

/* ============================================================
   GEOMETRY / MATERIAL CACHES
   ============================================================ */
const blockGeo = new THREE.BoxGeometry(
  BLOCK_SIZE * BLOCK_VISUAL_SCALE,
  BLOCK_SIZE * BLOCK_VISUAL_SCALE,
  BLOCK_SIZE * BLOCK_VISUAL_SCALE
);
const blockEdgesGeo = new THREE.EdgesGeometry(blockGeo);

const ballGeo       = new THREE.SphereGeometry(BALL_RADIUS, 28, 20);
const muzzleBallGeo = new THREE.SphereGeometry(MUZZLE_BALL_RADIUS, 40, 28);

/* Block materials — emissive is ZERO so base color shows vivid. */
const blockMats = COLORS.map(c => new THREE.MeshPhysicalMaterial({
  color: c.hex,
  metalness: BLOCK_MAT.metalness,
  roughness: BLOCK_MAT.roughness,
  clearcoat: BLOCK_MAT.clearcoat,
  clearcoatRoughness: BLOCK_MAT.clearcoatRoughness,
  emissive: 0x000000,
  emissiveIntensity: BLOCK_MAT.emissiveIntensity,
  envMapIntensity: BLOCK_MAT.envMapIntensity
}));

const blockEdgeMats = COLORS.map(() => new THREE.LineBasicMaterial({
  color: 0x0a0f1f,
  transparent: true,
  opacity: BLOCK_EDGE_OPACITY
}));

/* Ball materials — small emissive pop so they glow, not wash. */
const ballMats = COLORS.map(c => new THREE.MeshPhysicalMaterial({
  color: c.hex,
  metalness: BALL_MAT.metalness,
  roughness: BALL_MAT.roughness,
  clearcoat: BALL_MAT.clearcoat,
  clearcoatRoughness: BALL_MAT.clearcoatRoughness,
  emissive: c.hex,
  emissiveIntensity: BALL_MAT.emissiveIntensity,
  envMapIntensity: BALL_MAT.envMapIntensity
}));

/* ============================================================
   CANNON — screen-anchored, rebuilt every frame from camera
   ============================================================ */
const cannonGroup = new THREE.Group();
scene.add(cannonGroup);
cannonGroup.scale.setScalar(CANNON_SCALE);

const barrelGeo = new THREE.CylinderGeometry(
  CANNON_BARREL_RADIUS_TOP,
  CANNON_BARREL_RADIUS_BOTTOM,
  CANNON_BARREL_LENGTH,
  24
);
barrelGeo.rotateX(Math.PI / 2);
barrelGeo.translate(0, 0, CANNON_BARREL_LENGTH / 2);

const cannonMat = new THREE.MeshPhysicalMaterial({
  color: CANNON_MAT.color,
  roughness: CANNON_MAT.roughness,
  metalness: CANNON_MAT.metalness,
  clearcoat: 0.4,
  clearcoatRoughness: 0.25,
  envMapIntensity: 0.6
});

const barrelMesh = new THREE.Mesh(barrelGeo, cannonMat);
barrelMesh.castShadow = true;
cannonGroup.add(barrelMesh);

const barrelMouth = new THREE.Mesh(
  new THREE.TorusGeometry(CANNON_BARREL_RADIUS_TOP * 1.06, 0.055, 10, 24),
  new THREE.MeshPhysicalMaterial({
    color: 0x2a3450,
    roughness: 0.35,
    metalness: 0.8,
    envMapIntensity: 0.8
  })
);
barrelMouth.position.z = CANNON_BARREL_LENGTH;
cannonGroup.add(barrelMouth);

const baseMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(
    CANNON_BASE_RADIUS_TOP,
    CANNON_BASE_RADIUS_BOTTOM,
    CANNON_BASE_HEIGHT,
    24
  ),
  new THREE.MeshPhysicalMaterial({
    color: CANNON_BASE_COLOR,
    roughness: 0.55,
    metalness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.7
  })
);
baseMesh.position.y = CANNON_BASE_Y;
baseMesh.castShadow = true;
baseMesh.receiveShadow = true;
cannonGroup.add(baseMesh);

/* Muzzle ball — big, vivid, count label */
const muzzleBallGroup = new THREE.Group();
scene.add(muzzleBallGroup);

const muzzleBallMat = ballMats[0].clone();
const muzzleBall = new THREE.Mesh(muzzleBallGeo, muzzleBallMat);
muzzleBall.castShadow = true;
muzzleBall.scale.setScalar(1.35);
muzzleBallGroup.add(muzzleBall);

const labelCanvas = document.createElement('canvas');
labelCanvas.width = 256;
labelCanvas.height = 256;
const labelCtx = labelCanvas.getContext('2d');
const labelTexture = new THREE.CanvasTexture(labelCanvas);
labelTexture.colorSpace = THREE.SRGBColorSpace;
const labelMat = new THREE.SpriteMaterial({
  map: labelTexture,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  fog: false
});
const labelSprite = new THREE.Sprite(labelMat);
labelSprite.scale.set(CANNON_MUZZLE_LABEL_SCALE, CANNON_MUZZLE_LABEL_SCALE, 1);
labelSprite.renderOrder = 999;
labelSprite.position.set(0, MUZZLE_BALL_RADIUS * 0.05, MUZZLE_BALL_RADIUS * 0.95);
muzzleBallGroup.add(labelSprite);

function drawBallCount(num) {
  labelCtx.clearRect(0, 0, 256, 256);
  const text = String(num);
  labelCtx.font = '900 150px Arial, sans-serif';
  labelCtx.textAlign = 'center';
  labelCtx.textBaseline = 'middle';
  labelCtx.lineWidth = 26;
  labelCtx.strokeStyle = 'rgba(10, 30, 60, 0.94)';
  labelCtx.strokeText(text, 128, 140);
  labelCtx.fillStyle = '#ffffff';
  labelCtx.fillText(text, 128, 140);
  labelTexture.needsUpdate = true;
}

/* ============================================================
   AIM DOTS  (straight line from muzzle to focus)
   ============================================================ */
const aimDots = [];
const dotGeo = new THREE.SphereGeometry(AIM_DOT_RADIUS, 10, 8);
const dotMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.65,
  depthWrite: false
});
for (let i = 0; i < AIM_DOT_COUNT; i++) {
  const d = new THREE.Mesh(dotGeo, dotMat);
  d.visible = false;
  d.scale.setScalar(0.001);
  scene.add(d);
  aimDots.push(d);
}

/* Reticle ring on the tower face */
const reticleGeo = new THREE.TorusGeometry(AIM_RETICLE_RADIUS, 0.045, 8, AIM_RETICLE_SEGMENTS);
const reticleMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.75,
  depthTest: false,
  depthWrite: false
});
const reticle = new THREE.Mesh(reticleGeo, reticleMat);
reticle.renderOrder = 998;
reticle.visible = false;
scene.add(reticle);

/* ============================================================
   GAME OBJECT ARRAYS + PARTICLE POOL
   ============================================================ */
let blocks      = [];
let balls       = [];
let particles   = [];
let scorePopups = [];
let pedestals   = [];

const particleGeo = new THREE.BoxGeometry(
  FX_PARTICLE_GEO_SIZE,
  FX_PARTICLE_GEO_SIZE,
  FX_PARTICLE_GEO_SIZE
);
const particleMats = COLORS.map(c => new THREE.MeshStandardMaterial({
  color: c.hex,
  emissive: c.hex,
  emissiveIntensity: 0.55,
  roughness: 0.4,
  metalness: 0.2
}));

/* ============================================================
   STATE
   ============================================================ */
const state = {
  level: 1,
  coins: STARTING_COINS,
  animCoins: STARTING_COINS,
  ballsLeft: 0,
  animBalls: 0,
  currentColor: 0,
  playing: false,
  blocksTotal: 0,
  blocksLeft: 0,
  blocksDestroyed: 0,
  requiredClear: 0,
  combo: 0,
  lastHitTime: 0,
  multiballArmed: false,
  endTimer: 0,
  shakeTime: 0,
  punchAmount: 0,
  pendingAction: null
};

/* ============================================================
   CANNON SCREEN-ANCHOR — compute position + aim each frame
   ============================================================ */
const camForward = new THREE.Vector3();
const camDown    = new THREE.Vector3();
const camRight   = new THREE.Vector3();
const muzzleWorld = new THREE.Vector3();
const cannonLookTarget = new THREE.Vector3();

function updateCannonAnchor() {
  /* Camera basis vectors from the live camera matrix. */
  camera.getWorldDirection(camForward);
  camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();
  camDown.crossVectors(camRight, camForward).normalize();

  /* Cannon sits ahead + down from the camera, bottom-center of frame. */
  const cgPos = camera.position.clone()
    .addScaledVector(camForward, CANNON_FORWARD_OFFSET)
    .addScaledVector(camDown, CANNON_DOWN_OFFSET);

  cannonGroup.position.copy(cgPos);

  /* Cannon aims at the focus (tower mid-height). */
  cannonLookTarget.copy(orbit.focus);
  cannonGroup.lookAt(cannonLookTarget);

  /* Muzzle ball at the barrel tip. */
  muzzleWorld.set(0, 0, CANNON_BARREL_LENGTH * CANNON_SCALE);
  cannonGroup.localToWorld(muzzleWorld);
  muzzleBallGroup.position.copy(muzzleWorld);
  muzzleBallGroup.visible = state.ballsLeft > 0;
  muzzleBall.rotation.y += 0.012;
}

/* ============================================================
   AIM
   ============================================================ */
function getAimDir() {
  /* Aim from the muzzle toward the focus. */
  const dir = orbit.focus.clone().sub(muzzleBallGroup.position);
  dir.normalize();
  return dir;
}

function updateBallColorVisual() {
  const c = COLORS[state.currentColor];
  if (!c) return;
  muzzleBallMat.color.setHex(c.hex);
  muzzleBallMat.emissive.setHex(c.hex);
  muzzleBallMat.emissiveIntensity = BALL_MAT.emissiveIntensity;
  if (dom.ballDot) {
    dom.ballDot.style.background = c.css;
    dom.ballDot.style.boxShadow = `0 0 12px ${c.css}`;
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ============================================================
   TOWER — 2×2 footprint, STATIC blocks, tight stack
   ============================================================ */
function addBlock(x, y, z, colorIdx) {
  const half = BLOCK_SIZE / 2;
  const body = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(half, half, half)),
    position: new CANNON.Vec3(x, y, z),
    material: matBlock
  });
  world.addBody(body);

  const mesh = new THREE.Mesh(blockGeo, blockMats[colorIdx]);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const edges = new THREE.LineSegments(blockEdgesGeo, blockEdgeMats[colorIdx]);
  edges.position.copy(mesh.position);
  edges.quaternion.copy(mesh.quaternion);
  scene.add(edges);

  blocks.push({ mesh, edges, body, color: colorIdx });
}

function clearField() {
  for (const b of blocks) {
    scene.remove(b.mesh);
    if (b.edges) scene.remove(b.edges);
    if (b.body) world.removeBody(b.body);
  }
  blocks.length = 0;

  for (const p of pedestals) {
    scene.remove(p);
    if (p.userData && p.userData.rim) scene.remove(p.userData.rim);
  }
  pedestals.length = 0;

  for (const bl of balls) {
    scene.remove(bl.mesh);
    if (bl.body) world.removeBody(bl.body);
    if (bl.trailGroup) scene.remove(bl.trailGroup);
  }
  balls.length = 0;

  for (const pt of particles) scene.remove(pt.mesh);
  particles.length = 0;

  for (const sp of scorePopups) {
    scene.remove(sp.sprite);
    if (sp.sprite.material.map) sp.sprite.material.map.dispose();
    sp.sprite.material.dispose();
  }
  scorePopups.length = 0;
}

function buildTower(level) {
  clearField();

  const colorCount = colorsForLevel(level);
  const palette = shuffle(COLORS.map(c => c.id)).slice(0, colorCount);
  const height = towerHeightForLevel(level);

  const baseX = TOWER_X;
  const baseZ = TOWER_Z;
  const baseY = TOWER_STAND_ELEV;

  /* Pedestal */
  const pedGeo = new THREE.CylinderGeometry(
    PEDESTAL_RADIUS_TOP,
    PEDESTAL_RADIUS_BOTTOM,
    TOWER_STAND_ELEV,
    40, 1
  );
  const pedMat = new THREE.MeshPhysicalMaterial({
    color: PEDESTAL_MAT.color,
    roughness: PEDESTAL_MAT.roughness,
    metalness: PEDESTAL_MAT.metalness,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.5
  });
  const pedestal = new THREE.Mesh(pedGeo, pedMat);
  pedestal.position.set(baseX, TOWER_STAND_ELEV / 2, baseZ);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  pedestals.push(pedestal);

  /* Rim cap */
  const rimGeo = new THREE.CylinderGeometry(
    PEDESTAL_RIM_RADIUS,
    PEDESTAL_RIM_RADIUS,
    PEDESTAL_RIM_HEIGHT,
    40, 1
  );
  const rimMat = new THREE.MeshPhysicalMaterial({
    color: PEDESTAL_RIM_COLOR,
    roughness: 0.45,
    metalness: 0.5,
    clearcoat: 0.4,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.6
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.set(baseX, TOWER_STAND_ELEV + PEDESTAL_RIM_HEIGHT / 2, baseZ);
  rimMesh.castShadow = true;
  rimMesh.receiveShadow = true;
  scene.add(rimMesh);
  pedestal.userData.rim = rimMesh;

  /* 2x2 footprint — 4 blocks per row, slight brick offset alternate rows */
  const spacing = BLOCK_SIZE;
  const halfSpan = (TOWER_FOOTPRINT - 1) / 2;
  const topOfPedestal = TOWER_STAND_ELEV + PEDESTAL_RIM_HEIGHT;

  for (let row = 0; row < height; row++) {
    const rowOffsetX = (row % 2 === 0) ? 0 : TOWER_BRICK_OFFSET;

    for (let ix = 0; ix < TOWER_FOOTPRINT; ix++) {
      for (let iz = 0; iz < TOWER_FOOTPRINT; iz++) {
        const colorIdx = palette[(row * 4 + ix * TOWER_FOOTPRINT + iz) % palette.length];
        const x = baseX + (ix - halfSpan) * spacing + rowOffsetX;
        const z = baseZ + (iz - halfSpan) * spacing;
        const y = topOfPedestal + BLOCK_SIZE / 2 + row * BLOCK_SIZE + 0.001;
        addBlock(x, y, z, colorIdx);
      }
    }
  }

  state.blocksTotal = blocks.length;
  state.blocksLeft = blocks.length;
  state.blocksDestroyed = 0;
  state.requiredClear = requiredClearCount(blocks.length);
  state.currentColor = palette[Math.floor(Math.random() * palette.length)];
  state.combo = 0;
  state.lastHitTime = 0;
}

/* ============================================================
   BALLS  — spawn at muzzle, velocity toward the focus
   ============================================================ */
function spawnBall(dir, colorIdx) {
  if (balls.length >= MAX_BALLS) return;

  const start = muzzleBallGroup.position.clone()
    .addScaledVector(dir, CANNON_BALL_SPAWN + MUZZLE_BALL_RADIUS * 0.5);

  const body = new CANNON.Body({
    mass: BALL_MASS,
    shape: new CANNON.Sphere(BALL_RADIUS),
    position: new CANNON.Vec3(start.x, start.y, start.z),
    material: matBall,
    linearDamping: LINEAR_DAMPING_BALL,
    angularDamping: ANGULAR_DAMPING_BALL
  });
  body.velocity.set(
    dir.x * BALL_SPEED,
    dir.y * BALL_SPEED,
    dir.z * BALL_SPEED
  );
  world.addBody(body);

  const mesh = new THREE.Mesh(ballGeo, ballMats[colorIdx]);
  mesh.castShadow = true;
  mesh.position.copy(start);
  mesh.scale.setScalar(0.2);
  scene.add(mesh);

  pulse(mesh, 1, UI_BALL_SPAWN_MS);

  const trailGroup = FX_TRAIL_ENABLED ? new THREE.Group() : null;
  if (trailGroup) scene.add(trailGroup);

  balls.push({
    mesh,
    body,
    color: colorIdx,
    age: 0,
    slow: 0,
    trailGroup,
    trailTimer: 0
  });
}

/* ============================================================
   SCORE POPUPS
   ============================================================ */
function spawnScorePopup(position, value, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cssColor = '#' + colorHex.toString(16).padStart(6, '0');

  ctx.font = '900 96px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(10, 30, 60, 0.92)';
  ctx.strokeText('+' + value, 128, 68);
  ctx.fillStyle = cssColor;
  ctx.fillText('+' + value, 128, 68);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeText('+' + value, 128, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    fog: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.4, 1.2, 1);
  sprite.position.copy(position);
  sprite.position.y += 1.6;
  sprite.renderOrder = 1000;
  scene.add(sprite);

  scorePopups.push({
    sprite,
    life: 0,
    max: FX_SCORE_POPUP_MS / 1000,
    startY: sprite.position.y
  });
}

/* ============================================================
   SCORING / COMBO
   ============================================================ */
let comboResetTimer = null;

function registerBlockDestroy(colorIdx, blockPosition) {
  const now = performance.now() / 1000;
  if (now - state.lastHitTime < COMBO_WINDOW) {
    state.combo = Math.min(state.combo + 1, COMBO_MULTIPLIERS.length - 1);
  } else {
    state.combo = 0;
  }
  state.lastHitTime = now;

  const mult = COMBO_MULTIPLIERS[state.combo] || 1;
  const points = Math.max(1, Math.round(BASE_POINTS_PER_BLOCK * mult));
  const coinsEarned = Math.max(1, Math.round(COINS_PER_BLOCK * mult));
  state.coins += coinsEarned;

  countTo(state, 'animCoins', state.coins, UI_HUD_COUNT_MS, () => {
    if (dom.coins) dom.coins.textContent = Math.round(state.animCoins);
  });

  pulse(dom.coinsWrap, 1.14, UI_PULSE_MS);

  if (blockPosition) {
    spawnScorePopup(blockPosition, points, COLORS[colorIdx].hex);
  }

  if (state.combo >= 1) showCombo(state.combo);
}

function showCombo(comboLevel) {
  if (!dom.hint) return;
  const label = 'COMBO x' + (comboLevel + 1) + '!';
  dom.hint.textContent = label;
  dom.hint.style.color = '#ffd23f';
  pulse(dom.hint, 1.18, UI_PULSE_MS);

  if (comboResetTimer) clearTimeout(comboResetTimer);
  comboResetTimer = setTimeout(() => {
    if (dom.hint) {
      dom.hint.textContent = UI_STRINGS.hint;
      dom.hint.style.color = '#ffffff';
    }
  }, 900);
}

/* ============================================================
   DESTRUCTION + EFFECTS
   ============================================================ */
function spawnBurst(pos, colorIdx) {
  const group = [];
  const count = Math.min(FX_PARTICLE_COUNT, MAX_PARTICLES - particles.length);

  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(particleGeo, particleMats[colorIdx]);
    m.position.copy(pos);
    m.position.x += (Math.random() - 0.5) * 0.4;
    m.position.y += (Math.random() - 0.5) * 0.4;
    m.position.z += (Math.random() - 0.5) * 0.4;
    m.scale.setScalar(0.65 + Math.random() * 0.9);
    m.castShadow = false;
    scene.add(m);

    const life = FX_PARTICLE_LIFE_MIN +
      Math.random() * (FX_PARTICLE_LIFE_MAX - FX_PARTICLE_LIFE_MIN);

    particles.push({
      mesh: m,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * FX_PARTICLE_SPEED_XZ,
        Math.random() * FX_PARTICLE_SPEED_Y + 2,
        (Math.random() - 0.5) * FX_PARTICLE_SPEED_XZ
      ),
      life: 0,
      max: life,
      rotX: (Math.random() - 0.5) * 18,
      rotY: (Math.random() - 0.5) * 18
    });
    group.push(m);
  }

  burst(group, FX_PARTICLE_LIFE_MAX * 1000);
  shockwave(scene, pos, COLORS[colorIdx].hex);
}

function destroyBlock(bk) {
  scene.remove(bk.mesh);
  if (bk.edges) scene.remove(bk.edges);
  if (bk.body) world.removeBody(bk.body);
  spawnBurst(bk.mesh.position, bk.color);
}

/* ============================================================
   HIT RESOLUTION
   ============================================================ */
function resolveHits() {
  for (const bl of balls) {
    const p = bl.body.position;
    for (let j = blocks.length - 1; j >= 0; j--) {
      const bk = blocks[j];
      const q = bk.body.position;
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dz = p.z - q.z;
      if (dx * dx + dy * dy + dz * dz > HIT_RADIUS_2) continue;

      if (bk.color === bl.color) {
        const destroyedPos = bk.mesh.position.clone();
        destroyBlock(bk);
        blocks.splice(j, 1);
        state.blocksLeft = Math.max(0, state.blocksLeft - 1);
        state.blocksDestroyed++;
        registerBlockDestroy(bk.color, destroyedPos);
        updateProgressBar();

        bl.body.velocity.x *= BALL_DESTROY_SLOWDOWN;
        bl.body.velocity.y *= BALL_DESTROY_SLOWDOWN;
        bl.body.velocity.z *= BALL_DESTROY_SLOWDOWN;

        cameraPunch(state, 1);
        cameraShake(state, 0.32);

        if (FX_WOBBLE_ENABLED) {
          wobble(blocks, destroyedPos, FX_WOBBLE_RADIUS, FX_WOBBLE_STRENGTH);
        }
      }
    }
  }
}

/* ============================================================
   HUD UPDATES
   ============================================================ */
function updateHudCoins(animate) {
  if (animate !== false) {
    countTo(state, 'animCoins', state.coins, UI_HUD_COUNT_MS, () => {
      if (dom.coins) dom.coins.textContent = Math.round(state.animCoins);
    });
  } else {
    if (dom.coins) dom.coins.textContent = state.coins;
    state.animCoins = state.coins;
  }
}

function updateHudBalls(animate) {
  if (animate !== false) {
    countTo(state, 'animBalls', state.ballsLeft, UI_HUD_COUNT_MS, () => {
      if (dom.balls) dom.balls.textContent = Math.round(state.animBalls);
    });
  } else {
    if (dom.balls) dom.balls.textContent = state.ballsLeft;
    state.animBalls = state.ballsLeft;
  }
  drawBallCount(state.ballsLeft);
}

function updateProgressBar() {
  const pct = state.blocksTotal > 0
    ? ((state.blocksDestroyed) / state.blocksTotal) * 100
    : 0;
  if (dom.progressFill) dom.progressFill.style.width = Math.min(100, pct) + '%';
  if (dom.progress) dom.progress.setAttribute('aria-valuenow', String(Math.round(pct)));
  if (dom.progressNotch) dom.progressNotch.style.left = '100%';
}

function updatePowerupUI() {
  const multAfford  = Math.floor(state.coins / POWERUP_MULTIBALL.price);
  const earthAfford = Math.floor(state.coins / POWERUP_EARTHQUAKE.price);

  if (dom.badgeMultiball)  dom.badgeMultiball.textContent  = multAfford;
  if (dom.badgeEarthquake) dom.badgeEarthquake.textContent = earthAfford;

  if (dom.btnMultiball)  dom.btnMultiball.disabled  = multAfford  < 1;
  if (dom.btnEarthquake) dom.btnEarthquake.disabled = earthAfford < 1;

  if (dom.btnMultiball) {
    dom.btnMultiball.classList.toggle('armed', state.multiballArmed);
  }
}

function updateLevelUI() {
  if (dom.level) dom.level.textContent = state.level;
  if (dom.levelNext) {
    dom.levelNext.textContent = 'Lv ' + Math.min(state.level + 1, LEVEL_MAX);
  }
}

function refreshAllHud() {
  updateLevelUI();
  updateHudCoins(false);
  updateHudBalls(false);
  updateProgressBar();
  updatePowerupUI();
  updateBallColorVisual();
}

/* ============================================================
   COLOR CYCLE
   ============================================================ */
function getAvailableColors() {
  const s = new Set();
  for (const b of blocks) s.add(b.color);
  return Array.from(s).sort((a, b) => a - b);
}

function cycleColor() {
  const avail = getAvailableColors();
  if (!avail.length) return;
  const i = avail.indexOf(state.currentColor);
  const next = avail[(i + 1) % avail.length];
  state.currentColor = next;
  updateBallColorVisual();
  pulse(muzzleBallGroup, 1.15, UI_PULSE_MS);
}

/* ============================================================
   SHOOT  — fires from muzzle toward camera focus
   ============================================================ */
function shoot() {
  if (!state.playing || state.ballsLeft <= 0) return;

  const dir = getAimDir();
  const color = state.currentColor;

  if (state.multiballArmed) {
    state.multiballArmed = false;
    const up = new THREE.Vector3(0, 1, 0);
    const count = SHOTGUN_SPREAD_COUNT;
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * POWERUP_MULTIBALL.spreadRad;
      const d = dir.clone().applyAxisAngle(up, offset);
      d.y += offset * POWERUP_MULTIBALL.spreadY;
      d.normalize();
      spawnBall(d, color);
    }
  } else {
    spawnBall(dir, color);
  }

  cameraPunch(state, 0.9);
  buttonFeedback(dom.btnMultiball);

  state.ballsLeft--;
  state.endTimer = 0;
  cycleColor();
  updateHudBalls(true);
  updatePowerupUI();
}

/* ============================================================
   POWER-UPS
   ============================================================ */
function doEarthquake() {
  if (!state.playing) return;

  const toDestroy = blocks.filter(
    () => Math.random() < POWERUP_EARTHQUAKE.destroyChance
  );

  for (const t of toDestroy) {
    const idx = blocks.indexOf(t);
    if (idx >= 0) {
      const destroyedPos = t.mesh.position.clone();
      destroyBlock(t);
      blocks.splice(idx, 1);
      state.blocksLeft = Math.max(0, state.blocksLeft - 1);
      state.blocksDestroyed++;
      registerBlockDestroy(t.color, destroyedPos);
    }
  }

  for (const b of blocks) {
    if (!b.body) continue;
    b.body.wakeUp();
    b.body.applyImpulse(new CANNON.Vec3(
      (Math.random() - 0.5) * POWERUP_EARTHQUAKE.impulseXZ,
      POWERUP_EARTHQUAKE.impulseY + Math.random() * POWERUP_EARTHQUAKE.impulseYJitter,
      (Math.random() - 0.5) * POWERUP_EARTHQUAKE.impulseXZ
    ));
  }

  cameraShake(state, 0.55);
  cameraPunch(state, 1);
  updateProgressBar();
}

function activateMultiball() {
  if (!state.playing) return;
  if (state.coins < POWERUP_MULTIBALL.price) return;
  if (state.multiballArmed) return;

  state.coins -= POWERUP_MULTIBALL.price;
  state.multiballArmed = true;
  updateHudCoins(true);
  updatePowerupUI();
  buttonFeedback(dom.btnMultiball);
  pulse(dom.badgeMultiball, 1.3, UI_PULSE_MS);
}

function activateEarthquake() {
  if (!state.playing) return;
  if (state.coins < POWERUP_EARTHQUAKE.price) return;

  state.coins -= POWERUP_EARTHQUAKE.price;
  updateHudCoins(true);
  updatePowerupUI();
  buttonFeedback(dom.btnEarthquake);
  pulse(dom.badgeEarthquake, 1.3, UI_PULSE_MS);
  doEarthquake();
}

/* ============================================================
   OVERLAY / LEVEL FLOW
   ============================================================ */
function showOverlay(title, text, buttonText, action) {
  if (dom.ovTitle) dom.ovTitle.innerHTML = title;
  if (dom.ovText) dom.ovText.innerHTML = text;
  if (dom.ovBtn) dom.ovBtn.textContent = buttonText;
  state.pendingAction = action;
  overlayIn(dom.overlay, dom.panel);
}

function hideOverlay(callback) {
  overlayOut(dom.overlay, dom.panel, () => {
    const action = state.pendingAction;
    state.pendingAction = null;
    if (callback) callback();
    if (action) action();
  });
}

function startLevel() {
  buildTower(state.level);

  state.ballsLeft = ballsForLevel(state.level);
  state.animBalls = state.ballsLeft;
  state.endTimer = 0;
  state.multiballArmed = false;
  state.combo = 0;
  state.lastHitTime = 0;
  state.playing = true;

  refreshAllHud();
  updateBallColorVisual();

  countTo(state, 'animBalls', state.ballsLeft, UI_HUD_COUNT_MS, () => {
    if (dom.balls) dom.balls.textContent = Math.round(state.animBalls);
  });

  cameraPunch(state, 0.6);
}

function winLevel() {
  state.playing = false;
  state.coins += COINS_PER_LEVEL_CLEAR;
  updateHudCoins(true);
  updatePowerupUI();

  if (typeof confetti === 'function') {
    confetti(dom.panel, FX_CONFETTI_COUNT, FX_CONFETTI_MS, FX_CONFETTI_GRAVITY);
  }

  if (state.level >= LEVEL_MAX) {
    showOverlay(
      'YOU WIN!',
      'You cleared every tower in the run. Nice work!',
      'PLAY AGAIN',
      () => {
        state.level = 1;
        state.coins = STARTING_COINS;
        startLevel();
      }
    );
    return;
  }

  const clearedLevel = state.level;
  state.level++;

  showOverlay(
    'LEVEL CLEARED!',
    UI_STRINGS.win.text(clearedLevel) +
      '<br><b>+' + COINS_PER_LEVEL_CLEAR + ' coins</b>',
    UI_STRINGS.win.button,
    () => startLevel()
  );
}

function loseLevel() {
  state.playing = false;
  showOverlay(
    UI_STRINGS.lose.title,
    UI_STRINGS.lose.text(state.level),
    UI_STRINGS.lose.button,
    () => startLevel()
  );
}

/* ============================================================
   AIM DOTS  — straight line from muzzle toward focus
   ============================================================ */
const aimDotTargets = new Array(AIM_DOT_COUNT).fill(0);

function updateAimDots() {
  const start = muzzleBallGroup.position.clone();
  const end = orbit.focus.clone();
  const show = state.playing && state.ballsLeft > 0;

  for (let i = 0; i < aimDots.length; i++) {
    const t = (i + 1) / (aimDots.length + 1);
    const p = start.clone().lerp(end, t);

    const dot = aimDots[i];
    dot.position.copy(p);
    dot.visible = show;

    const targetScale = Math.max(
      AIM_DOT_MIN_SCALE,
      1 - i / (aimDots.length * AIM_DOT_FALLOFF_DIV)
    );

    if (dot.visible) {
      if (aimDotTargets[i] < 0.5) {
        aimDotTargets[i] = 1;
        anime({
          targets: dot.scale,
          x: targetScale, y: targetScale, z: targetScale,
          duration: FX_AIM_DOT_POP_MS,
          delay: i * FX_AIM_DOT_STAGGER_MS,
          easing: 'easeOutBack'
        });
      } else {
        dot.scale.setScalar(targetScale);
      }
    } else {
      if (aimDotTargets[i] > 0.5) {
        aimDotTargets[i] = 0;
        anime({
          targets: dot.scale,
          x: 0.001, y: 0.001, z: 0.001,
          duration: 180,
          easing: 'easeInQuad'
        });
      }
    }
  }

  /* Reticle on the focus point */
  if (show && blocks.length > 0) {
    reticle.visible = true;
    reticle.position.copy(orbit.focus);
    reticle.lookAt(camera.position);
    reticle.rotation.z += 0.005;
  } else {
    reticle.visible = false;
  }
}

/* ============================================================
   CAMERA EFFECTS  (shake + punch + FOV kick)
   ============================================================ */
const camShakeOffset = new THREE.Vector3();
const camPunchOffset = new THREE.Vector3();

function applyCameraEffects() {
  let punchZ = 0;
  let punchY = 0;
  if (state.punchAmount > 0) {
    punchZ = state.punchAmount * 0.6;
    punchY = state.punchAmount * 0.14;
  }

  let shakeX = 0, shakeY = 0, shakeZ = 0;
  if (state.shakeTime > 0) {
    const k = state.shakeTime * 1.1;
    shakeX = (Math.random() - 0.5) * k;
    shakeY = (Math.random() - 0.5) * k;
    shakeZ = (Math.random() - 0.5) * k * 0.6;
  }

  /* Base orbit position + shake + punch */
  const cp = Math.cos(orbit.pitch);
  const baseX = orbit.focus.x + orbit.distance * Math.sin(orbit.yaw) * cp;
  const baseY = orbit.focus.y + orbit.distance * Math.sin(orbit.pitch);
  const baseZ = orbit.focus.z + orbit.distance * Math.cos(orbit.yaw) * cp;

  camera.position.set(
    baseX + shakeX,
    Math.max(CAMERA_MIN_Y, baseY + shakeY + punchY),
    baseZ + shakeZ - punchZ
  );
  camera.lookAt(orbit.focus);

  const targetFov = CAMERA_FOV + (state.punchAmount > 0 ? state.punchAmount * FX_PUNCH_FOV_OFFSET : 0);
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = targetFov;
    camera.updateProjectionMatrix();
  }
}

/* ============================================================
   ORBIT CAMERA — smoothing + clamping
   ============================================================ */
function updateOrbit(dt) {
  /* Smooth yaw */
  const yawLerp = 1 - Math.exp(-CAMERA_LERP_YAW * dt);
  orbit.yaw += (orbit.targetYaw - orbit.yaw) * yawLerp;

  /* Smooth pitch */
  const pitchLerp = 1 - Math.exp(-CAMERA_LERP_PITCH * dt);
  orbit.pitch += (orbit.targetPitch - orbit.pitch) * pitchLerp;

  /* Smooth distance */
  const distLerp = 1 - Math.exp(-CAMERA_LERP_DISTANCE * dt);
  orbit.distance += (orbit.targetDistance - orbit.distance) * distLerp;

  /* Clamp yaw */
  orbit.targetYaw = Math.max(CAMERA_YAW_MIN, Math.min(CAMERA_YAW_MAX, orbit.targetYaw));

  /* Clamp pitch */
  orbit.targetPitch = Math.max(CAMERA_PITCH_MIN, Math.min(CAMERA_PITCH_MAX, orbit.targetPitch));

  /* Clamp distance */
  orbit.targetDistance = Math.max(CAMERA_DISTANCE_MIN, Math.min(CAMERA_DISTANCE_MAX, orbit.targetDistance));
}

/* ============================================================
   BALL TRAILS
   ============================================================ */
const trailGeo = new THREE.SphereGeometry(BALL_RADIUS * 0.85, 12, 10);

function spawnTrailGhost(bl) {
  if (!bl.trailGroup) return;
  if (bl.trailGroup.children.length >= FX_TRAIL_COUNT) {
    const oldest = bl.trailGroup.children[0];
    bl.trailGroup.remove(oldest);
    if (oldest.material) oldest.material.dispose();
  }

  const mat = new THREE.MeshBasicMaterial({
    color: COLORS[bl.color].hex,
    transparent: true,
    opacity: FX_TRAIL_START_OPACITY,
    depthWrite: false
  });
  const ghost = new THREE.Mesh(trailGeo, mat);
  ghost.position.copy(bl.mesh.position);
  ghost.scale.setScalar(FX_TRAIL_START_SCALE);
  bl.trailGroup.add(ghost);

  anime({
    targets: ghost.scale,
    x: FX_TRAIL_END_SCALE,
    y: FX_TRAIL_END_SCALE,
    z: FX_TRAIL_END_SCALE,
    duration: FX_TRAIL_FADE_MS,
    easing: 'easeOutQuad'
  });
  anime({
    targets: mat,
    opacity: 0,
    duration: FX_TRAIL_FADE_MS,
    easing: 'easeOutQuad',
    complete: () => {
      if (bl.trailGroup) bl.trailGroup.remove(ghost);
      mat.dispose();
    }
  });
}

/* ============================================================
   MAIN UPDATE
   ============================================================ */
function update(dt) {
  if (state.playing) resolveHits();

  world.step(PHYSICS_STEP, dt, PHYSICS_MAX_SUBSTEP);

  /* Blocks are static — no integration, but sync anyway for safety */
  for (const b of blocks) {
    b.mesh.position.copy(b.body.position);
    b.mesh.quaternion.copy(b.body.quaternion);
    if (b.edges) {
      b.edges.position.copy(b.body.position);
      b.edges.quaternion.copy(b.body.quaternion);
    }
  }

  /* Balls + trails */
  for (let i = balls.length - 1; i >= 0; i--) {
    const bl = balls[i];
    bl.mesh.position.copy(bl.body.position);
    bl.mesh.quaternion.copy(bl.body.quaternion);

    if (bl.trailGroup) {
      bl.trailTimer += dt * 1000;
      if (bl.trailTimer >= FX_TRAIL_SPAWN_MS) {
        bl.trailTimer = 0;
        spawnTrailGhost(bl);
      }
    }

    bl.age += dt;
    const v = bl.body.velocity;
    const sp = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (sp < 1.6) bl.slow += dt; else bl.slow = 0;

    if (
      bl.age > BALL_LIFE + BALL_MAX_AGE ||
      bl.slow > BALL_SLOW_LIFE ||
      bl.body.position.y < BALL_Y_KILL
    ) {
      world.removeBody(bl.body);
      scene.remove(bl.mesh);
      if (bl.trailGroup) scene.remove(bl.trailGroup);
      balls.splice(i, 1);
    }
  }

  /* Particles */
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt;
    p.vel.y -= FX_PARTICLE_GRAVITY * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    p.mesh.rotation.x += p.rotX * dt;
    p.mesh.rotation.y += p.rotY * dt;
    if (p.life >= p.max) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }

  /* Score popups — rise and fade */
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const sp = scorePopups[i];
    sp.life += dt;
    const k = sp.life / sp.max;
    sp.sprite.position.y = sp.startY + FX_SCORE_POPUP_RISE * k;
    if (sp.sprite.material) {
      sp.sprite.material.opacity = Math.max(0, 1 - k * 1.15);
    }
    if (sp.life >= sp.max) {
      scene.remove(sp.sprite);
      if (sp.sprite.material.map) sp.sprite.material.map.dispose();
      sp.sprite.material.dispose();
      scorePopups.splice(i, 1);
    }
  }

  /* Camera + cannon + aim (order matters) */
  updateOrbit(dt);
  applyCameraEffects();
  updateCannonAnchor();
  updateAimDots();

  /* Win / Lose */
  if (state.playing) {
    if (state.blocksDestroyed >= state.requiredClear) {
      winLevel();
    } else if (state.ballsLeft === 0 && balls.length === 0) {
      state.endTimer += dt;
      if (state.endTimer > 1.0) loseLevel();
    } else {
      state.endTimer = 0;
    }
  }
}

/* ============================================================
   INPUT — orbit on drag, fire on tap, zoom on wheel/pinch
   ============================================================ */
const activePointers = new Map();
let isOrbitDrag = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartTime = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let pinchStartDist = 0;
let pinchStartTarget = 0;

/* Cursor hints */
renderer.domElement.style.cursor = 'grab';

function setCursorGrabbing() {
  renderer.domElement.style.cursor = 'grabbing';
}
function setCursorGrab() {
  renderer.domElement.style.cursor = 'grab';
}

function onPointerDown(e) {
  if (e.target !== renderer.domElement) return;

  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 1) {
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    dragStartTime = performance.now();
    isOrbitDrag = false;
    try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {}
  } else if (activePointers.size === 2) {
    const pts = Array.from(activePointers.values());
    pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    pinchStartTarget = orbit.targetDistance;
    isOrbitDrag = true;
  }
}

function onPointerMove(e) {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 1) {
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    const totalDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);

    if (totalDist > DRAG_THRESHOLD_PX) {
      isOrbitDrag = true;
      setCursorGrabbing();
    }

    if (isOrbitDrag) {
      orbit.targetYaw -= dx * ORBIT_YAW_SENSITIVITY;
      orbit.targetPitch -= dy * ORBIT_PITCH_SENSITIVITY;
      orbit.targetYaw = Math.max(CAMERA_YAW_MIN, Math.min(CAMERA_YAW_MAX, orbit.targetYaw));
      orbit.targetPitch = Math.max(CAMERA_PITCH_MIN, Math.min(CAMERA_PITCH_MAX, orbit.targetPitch));
    }

    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  } else if (activePointers.size === 2) {
    const pts = Array.from(activePointers.values());
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const delta = dist - pinchStartDist;
    orbit.targetDistance = pinchStartTarget - delta * PINCH_ZOOM_SENSITIVITY;
    orbit.targetDistance = Math.max(
      CAMERA_DISTANCE_MIN,
      Math.min(CAMERA_DISTANCE_MAX, orbit.targetDistance)
    );
  }
}

function onPointerUp(e) {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.delete(e.pointerId);

  try { renderer.domElement.releasePointerCapture(e.pointerId); } catch (_) {}

  if (activePointers.size === 0) {
    const elapsed = performance.now() - dragStartTime;
    if (!isOrbitDrag && elapsed < TAP_MAX_MS) {
      if (state.playing) shoot();
    }
    setCursorGrab();
    isOrbitDrag = false;
  }

  if (activePointers.size < 2) {
    pinchStartDist = 0;
  }
}

function onPointerCancel(e) {
  if (activePointers.has(e.pointerId)) {
    activePointers.delete(e.pointerId);
  }
  if (activePointers.size === 0) {
    isOrbitDrag = false;
    setCursorGrab();
  }
}

function onWheel(e) {
  if (e.target !== renderer.domElement) return;
  e.preventDefault();

  const dir = Math.sign(e.deltaY);
  orbit.targetDistance += dir * WHEEL_ZOOM_STEP;
  orbit.targetDistance = Math.max(
    CAMERA_DISTANCE_MIN,
    Math.min(CAMERA_DISTANCE_MAX, orbit.targetDistance)
  );
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove, { passive: true });
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerCancel);
renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

/* Prevent context menu so right-drag doesn't open the browser menu */
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

/* Keyboard shortcuts */
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state.playing) shoot();
  }
  if (e.code === 'KeyQ') {
    if (state.playing) activateEarthquake();
  }
  if (e.code === 'KeyE') {
    if (state.playing) activateMultiball();
  }
});

/* HUD + buttons */
if (dom.ballsWrap) {
  dom.ballsWrap.addEventListener('click', () => {
    if (!state.playing) return;
    cycleColor();
    pulse(dom.ballsWrap, 1.06, UI_PULSE_MS);
  });
}

if (dom.btnMultiball) {
  dom.btnMultiball.addEventListener('click', activateMultiball);
}
if (dom.btnEarthquake) {
  dom.btnEarthquake.addEventListener('click', activateEarthquake);
}

if (dom.btnShop) {
  dom.btnShop.addEventListener('click', () => {
    buttonFeedback(dom.btnShop);
  });
}

if (dom.ovBtn) {
  dom.ovBtn.addEventListener('click', () => {
    hideOverlay();
  });
}

/* ============================================================
   RESIZE
   ============================================================ */
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

/* ============================================================
   MAIN LOOP
   ============================================================ */
let lastTime = performance.now();

function loop(now) {
  requestAnimationFrame(loop);

  let dt = (now - lastTime) / 1000;
  lastTime = now;

  if (!isFinite(dt) || dt < 0) dt = 0;
  dt = Math.min(dt, 0.05);

  update(dt);
  renderer.render(scene, camera);
}

/* ============================================================
   BOOT
   ============================================================ */
function boot() {
  /* Prime camera + cannon anchor for the very first frame. */
  applyCameraEffects();
  updateCannonAnchor();
  drawBallCount(0);
  refreshAllHud();

  if (dom.hint) dom.hint.textContent = UI_STRINGS.hint;
  if (dom.priceMultiball)  dom.priceMultiball.textContent  = POWERUP_MULTIBALL.price;
  if (dom.priceEarthquake) dom.priceEarthquake.textContent = POWERUP_EARTHQUAKE.price;

  showOverlay(
    UI_STRINGS.intro.title,
    UI_STRINGS.intro.text,
    UI_STRINGS.intro.button,
    () => {
      state.level = 1;
      state.coins = STARTING_COINS;
      state.animCoins = STARTING_COINS;
      startLevel();
    }
  );

  lastTime = performance.now();
  requestAnimationFrame(loop);
}

boot();

if (DEBUG) {
  window.__tc = {
    scene,
    camera,
    renderer,
    world,
    state,
    orbit,
    blocks,
    balls,
    particles,
    startLevel,
    shoot,
    cycleColor
  };
}