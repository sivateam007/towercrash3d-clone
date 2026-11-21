/* ============================================================
   TOWER CRASH 3D — game.js
   Far-back over-the-shoulder camera, ONE tall narrow tower,
   small cannon with a big muzzle ball showing the ball count.
   Entry module: builds scene + physics, then runs gameplay.
   ============================================================ */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
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
  CAMERA_BASE,
  CAMERA_LOOK,
  CAMERA_LERP_SPEED,
  AIM_YAW_LIMIT,
  AIM_PITCH_BASE,
  AIM_PITCH_RANGE,
  AIM_PITCH_MIN,
  AIM_PITCH_MAX,
  AIM_DOT_COUNT,
  AIM_DOT_START_T,
  AIM_DOT_STEP_T,
  AIM_DOT_MIN_SCALE,
  AIM_DOT_FALLOFF_DIV,
  CANNON_POSITION,
  CANNON_BALL_SPAWN,
  CANNON_BASE_Y,
  CANNON_BARREL_RADIUS_TOP,
  CANNON_BARREL_RADIUS_BOTTOM,
  CANNON_BARREL_LENGTH,
  CANNON_BASE_RADIUS_TOP,
  CANNON_BASE_RADIUS_BOTTOM,
  CANNON_BASE_HEIGHT,
  MUZZLE_LABEL_SCALE,
  BLOCK_SIZE,
  BLOCK_VISUAL_SCALE,
  TOWER_HEIGHT,
  TOWER_STAND_ELEV,
  TOWER_COLUMN_OFFSET,
  TOWER_X,
  TOWER_Z,
  TOWER_BLOCK_MASS,
  PEDESTAL_RADIUS_TOP,
  PEDESTAL_RADIUS_BOTTOM,
  LEVEL_MAX,
  ballsForLevel,
  colorsForLevel,
  towerHeightForLevel,
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
  SKY_HORIZON_HEX,
  OCEAN_HEX,
  FOG_NEAR,
  FOG_FAR,
  FOG_COLOR_HEX,
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
  FX_WOBBLE_MS,
  FX_WOBBLE_ANGLE,
  FX_WOBBLE_RADIUS,
  FX_CONFETTI_COUNT,
  FX_CONFETTI_MS,
  FX_CONFETTI_GRAVITY,
  FX_AIM_DOT_STAGGER_MS,
  FX_AIM_DOT_POP_MS,
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
  ballTrail,
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
renderer.toneMappingExposure = 1.08;
renderer.setClearColor(0x000000, 0);
dom.sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(FOG_COLOR_HEX, FOG_NEAR, FOG_FAR);

const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  CAMERA_NEAR,
  CAMERA_FAR
);

const camBase = new THREE.Vector3(CAMERA_BASE.x, CAMERA_BASE.y, CAMERA_BASE.z);
const camLook = new THREE.Vector3(CAMERA_LOOK.x, CAMERA_LOOK.y, CAMERA_LOOK.z);
camera.position.copy(camBase);
camera.lookAt(camLook);

/* ============================================================
   SKY DOME  (bright blue sky → ocean-blue horizon)
   ============================================================ */
function makeSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.00, '#9fd9ff');
  grad.addColorStop(0.30, '#c8ecff');
  grad.addColorStop(0.55, '#8ccdf3');
  grad.addColorStop(0.78, '#5fb6f2');
  grad.addColorStop(1.00, '#2f8fe0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 512);

  /* Soft cloud band */
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 14; i++) {
    const y = 40 + Math.random() * 180;
    const x = Math.random() * 64;
    const r = 8 + Math.random() * 22;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(180, 32, 20),
  new THREE.MeshBasicMaterial({
    map: makeSkyTexture(),
    side: THREE.BackSide,
    depthWrite: false,
    fog: false
  })
);
scene.add(skyDome);

/* ============================================================
   LIGHTS
   ============================================================ */
const hemi = new THREE.HemisphereLight(0xffffff, 0x8fc4ee, 1.15);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff6d8, 2.25);
sun.position.set(14, 28, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left   = -30;
sun.shadow.camera.right  =  30;
sun.shadow.camera.top    =  40;
sun.shadow.camera.bottom = -20;
sun.shadow.camera.near   = 1;
sun.shadow.camera.far    = 120;
sun.shadow.bias = -0.0008;
scene.add(sun);

const rim = new THREE.DirectionalLight(0xbfe3ff, 1.05);
rim.position.set(-18, 14, -24);
scene.add(rim);

const fill = new THREE.PointLight(0xfff2c8, 0.55, 70, 2);
fill.position.set(0, 10, 16);
scene.add(fill);

/* ============================================================
   ARENA — ocean floor, lane strip, ring
   ============================================================ */
const groundGeo = new THREE.CircleGeometry(ARENA_GROUND_RADIUS, 96);
groundGeo.rotateX(-Math.PI / 2);
const groundMat = new THREE.MeshStandardMaterial({
  color: OCEAN_HEX,
  roughness: 0.9,
  metalness: 0.1
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.receiveShadow = true;
groundMesh.position.y = 0;
scene.add(groundMesh);

/* Subtle grid on the ocean floor for depth */
const grid = new THREE.GridHelper(ARENA_GRID_SIZE, ARENA_GRID_DIVS, 0xbfe3ff, 0x7ac0f0);
grid.position.y = 0.015;
grid.material.opacity = 0.22;
grid.material.transparent = true;
scene.add(grid);

/* Bright ring marking the arena */
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
ring.position.y = 0.05;
scene.add(ring);

/* Lane strip running from cannon to tower — subtle direction guide */
const laneGeo = new THREE.PlaneGeometry(LANE_STRIP_WIDTH, LANE_STRIP_LENGTH);
laneGeo.rotateX(-Math.PI / 2);
const laneMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.10,
  depthWrite: false
});
const laneStrip = new THREE.Mesh(laneGeo, laneMat);
laneStrip.position.set(0, 0.02, (CANNON_POSITION.z + TOWER_Z) / 2);
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
const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 24, 18);
const muzzleBallGeo = new THREE.SphereGeometry(MUZZLE_BALL_RADIUS, 32, 24);

const blockMats = COLORS.map(c => new THREE.MeshStandardMaterial({
  color: c.hex,
  roughness: 0.36,
  metalness: 0.14,
  emissive: c.hex,
  emissiveIntensity: 0.26,
  flatShading: true
}));

const ballMats = COLORS.map(c => new THREE.MeshStandardMaterial({
  color: c.hex,
  roughness: 0.20,
  metalness: 0.30,
  emissive: c.hex,
  emissiveIntensity: 0.62,
  flatShading: true
}));

/* ============================================================
   CANNON — small barrel at bottom-center + BIG muzzle ball
   ============================================================ */
const cannonGroup = new THREE.Group();
const cannonBase = new THREE.Vector3(
  CANNON_POSITION.x,
  CANNON_POSITION.y,
  CANNON_POSITION.z
);
cannonGroup.position.copy(cannonBase);
scene.add(cannonGroup);

/* Barrel (small) */
const barrelGeo = new THREE.CylinderGeometry(
  CANNON_BARREL_RADIUS_TOP,
  CANNON_BARREL_RADIUS_BOTTOM,
  CANNON_BARREL_LENGTH,
  20
);
barrelGeo.rotateX(Math.PI / 2);
barrelGeo.translate(0, 0, CANNON_BARREL_LENGTH / 2);

const barrelMesh = new THREE.Mesh(
  barrelGeo,
  new THREE.MeshStandardMaterial({
    color: 0x8a97ab,
    roughness: 0.34,
    metalness: 0.82,
    flatShading: true
  })
);
barrelMesh.castShadow = true;
cannonGroup.add(barrelMesh);

/* Barrel mouth ring */
const barrelMouth = new THREE.Mesh(
  new THREE.TorusGeometry(CANNON_BARREL_RADIUS_TOP * 1.05, 0.055, 8, 22),
  new THREE.MeshStandardMaterial({
    color: 0x3a4a6a,
    roughness: 0.4,
    metalness: 0.72
  })
);
barrelMouth.position.z = CANNON_BARREL_LENGTH;
cannonGroup.add(barrelMouth);

/* Base (small) */
const baseMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(
    CANNON_BASE_RADIUS_TOP,
    CANNON_BASE_RADIUS_BOTTOM,
    CANNON_BASE_HEIGHT,
    20
  ),
  new THREE.MeshStandardMaterial({
    color: 0x4a5a7a,
    roughness: 0.7,
    metalness: 0.42
  })
);
baseMesh.position.y = CANNON_BASE_Y;
baseMesh.castShadow = true;
baseMesh.receiveShadow = true;
cannonGroup.add(baseMesh);

/* Muzzle ball group — floats just past the barrel mouth */
const muzzleBallGroup = new THREE.Group();
scene.add(muzzleBallGroup);

const muzzleBallMat = ballMats[0].clone();
const muzzleBall = new THREE.Mesh(muzzleBallGeo, muzzleBallMat);
muzzleBall.castShadow = true;
muzzleBallGroup.add(muzzleBall);

/* Canvas-based ball-count label rendered as a camera-facing sprite */
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
labelSprite.scale.set(MUZZLE_LABEL_SCALE, MUZZLE_LABEL_SCALE, 1);
labelSprite.renderOrder = 999;
labelSprite.position.set(0, MUZZLE_BALL_RADIUS * 0.05, MUZZLE_BALL_RADIUS * 0.95);
muzzleBallGroup.add(labelSprite);

function drawBallCount(num) {
  labelCtx.clearRect(0, 0, 256, 256);
  const text = String(num);
  labelCtx.font = '900 148px Arial, sans-serif';
  labelCtx.textAlign = 'center';
  labelCtx.textBaseline = 'middle';
  labelCtx.lineWidth = 26;
  labelCtx.strokeStyle = 'rgba(10, 30, 60, 0.92)';
  labelCtx.strokeText(text, 128, 138);
  labelCtx.fillStyle = '#ffffff';
  labelCtx.fillText(text, 128, 138);
  labelTexture.needsUpdate = true;
}

/* ============================================================
   AIM DOTS
   ============================================================ */
const aimDots = [];
const dotGeo = new THREE.SphereGeometry(0.09, 8, 6);
const dotMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.62,
  depthWrite: false
});
for (let i = 0; i < AIM_DOT_COUNT; i++) {
  const d = new THREE.Mesh(dotGeo, dotMat);
  d.visible = false;
  d.scale.setScalar(0.001);
  scene.add(d);
  aimDots.push(d);
}

/* ============================================================
   GAME OBJECT ARRAYS + PARTICLE POOL
   ============================================================ */
let blocks    = [];
let balls     = [];
let particles = [];
let trails    = [];
let pedestals = [];

const particleGeo = new THREE.BoxGeometry(
  FX_PARTICLE_GEO_SIZE,
  FX_PARTICLE_GEO_SIZE,
  FX_PARTICLE_GEO_SIZE
);
const particleMats = COLORS.map(c => new THREE.MeshBasicMaterial({ color: c.hex }));

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
  combo: 0,
  lastHitTime: 0,
  multiballArmed: false,
  endTimer: 0,
  shakeTime: 0,
  punchAmount: 0,
  fovPunch: 0,
  pendingAction: null
};

/* ============================================================
   AIM
   ============================================================ */
let aimYaw = 0;
let aimPitch = AIM_PITCH_BASE;

function getAimDir() {
  const cp = Math.cos(aimPitch);
  return new THREE.Vector3(
    Math.sin(aimYaw) * cp,
    Math.sin(aimPitch),
    -Math.cos(aimYaw) * cp
  );
}

function updatePointer(clientX, clientY) {
  const nx = (clientX / window.innerWidth) * 2 - 1;
  const ny = -((clientY / window.innerHeight) * 2 - 1);
  aimYaw = nx * AIM_YAW_LIMIT;
  aimPitch = AIM_PITCH_BASE + ny * AIM_PITCH_RANGE;
  aimPitch = Math.max(AIM_PITCH_MIN, Math.min(AIM_PITCH_MAX, aimPitch));
}

function updateCannonVisual() {
  const dir = getAimDir();
  const forward = new THREE.Vector3(0, 0, 1);
  cannonGroup.quaternion.setFromUnitVectors(forward, dir);
}

function updateMuzzleBall() {
  const dir = getAimDir();
  const pos = cannonBase.clone().addScaledVector(dir, CANNON_BALL_SPAWN + MUZZLE_BALL_RADIUS * 0.75);
  muzzleBallGroup.position.copy(pos);
  muzzleBallGroup.visible = state.ballsLeft > 0;
  muzzleBall.rotation.y += 0.012;
}

function updateBallColorVisual() {
  const c = COLORS[state.currentColor];
  if (!c) return;
  muzzleBallMat.color.setHex(c.hex);
  muzzleBallMat.emissive.setHex(c.hex);
  muzzleBallMat.emissiveIntensity = 0.62;
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
   TOWER — single tall narrow column, tightly stacked
   ============================================================ */
function addBlock(x, y, z, colorIdx) {
  const half = BLOCK_SIZE / 2;
  const body = new CANNON.Body({
    mass: TOWER_BLOCK_MASS,
    shape: new CANNON.Box(new CANNON.Vec3(half, half, half)),
    position: new CANNON.Vec3(x, y, z),
    material: matBlock,
    linearDamping: LINEAR_DAMPING_BLOCK,
    angularDamping: ANGULAR_DAMPING_BLOCK
  });
  body.allowSleep = false;
  world.addBody(body);

  const mesh = new THREE.Mesh(blockGeo, blockMats[colorIdx]);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  blocks.push({ mesh, body, color: colorIdx, wobbleOffset: 0 });
}

function clearField() {
  for (const b of blocks) {
    scene.remove(b.mesh);
    if (b.body) world.removeBody(b.body);
  }
  blocks.length = 0;

  for (const p of pedestals) scene.remove(p);
  pedestals.length = 0;

  for (const bl of balls) {
    scene.remove(bl.mesh);
    if (bl.body) world.removeBody(bl.body);
    if (bl.trailGroup) scene.remove(bl.trailGroup);
  }
  balls.length = 0;

  for (const pt of particles) scene.remove(pt.mesh);
  particles.length = 0;

  for (const t of trails) scene.remove(t.mesh);
  trails.length = 0;
}

function buildTower(level) {
  clearField();

  const colorCount = colorsForLevel(level);
  const palette = shuffle(COLORS.map(c => c.id)).slice(0, colorCount);
  const height = towerHeightForLevel(level);

  const baseX = TOWER_X;
  const baseZ = TOWER_Z;
  const baseY = TOWER_STAND_ELEV;

  /* Pedestal under the column */
  const pedGeo = new THREE.CylinderGeometry(
    PEDESTAL_RADIUS_TOP,
    PEDESTAL_RADIUS_BOTTOM,
    TOWER_STAND_ELEV,
    26
  );
  const pedMat = new THREE.MeshStandardMaterial({
    color: 0x4a6a9a,
    roughness: 0.55,
    metalness: 0.4
  });
  const pedestal = new THREE.Mesh(pedGeo, pedMat);
  pedestal.position.set(baseX, TOWER_STAND_ELEV / 2, baseZ);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  pedestals.push(pedestal);

  /* Tightly stacked single column */
  for (let i = 0; i < height; i++) {
    const colorIdx = palette[i % palette.length];
    const y = baseY + BLOCK_SIZE / 2 + i * BLOCK_SIZE + 0.001;
    addBlock(baseX, y, baseZ, colorIdx);
  }

  state.blocksTotal = blocks.length;
  state.blocksLeft = blocks.length;
  state.currentColor = palette[Math.floor(Math.random() * palette.length)];
  state.combo = 0;
  state.lastHitTime = 0;
}

/* ============================================================
   BALLS
   ============================================================ */
function spawnBall(dir, colorIdx) {
  if (balls.length >= MAX_BALLS) return;

  const start = cannonBase.clone().addScaledVector(dir, CANNON_BALL_SPAWN + MUZZLE_BALL_RADIUS * 0.75);

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
   SCORING / COMBO
   ============================================================ */
let comboResetTimer = null;

function registerBlockDestroy(colorIdx) {
  const now = performance.now() / 1000;
  if (now - state.lastHitTime < COMBO_WINDOW) {
    state.combo = Math.min(state.combo + 1, COMBO_MULTIPLIERS.length - 1);
  } else {
    state.combo = 0;
  }
  state.lastHitTime = now;

  const mult = COMBO_MULTIPLIERS[state.combo] || 1;
  const coinsEarned = Math.max(1, Math.floor(COINS_PER_BLOCK * mult));
  state.coins += coinsEarned;

  countTo(state, 'animCoins', state.coins, UI_HUD_COUNT_MS, () => {
    if (dom.coins) dom.coins.textContent = Math.round(state.animCoins);
  });

  pulse(dom.coinsWrap, 1.14, UI_PULSE_MS);

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
    m.position.x += (Math.random() - 0.5) * 0.35;
    m.position.y += (Math.random() - 0.5) * 0.35;
    m.position.z += (Math.random() - 0.5) * 0.35;
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
  if (bk.body) world.removeBody(bk.body);
  spawnBurst(bk.mesh.position, bk.color);
}

/* ============================================================
   HIT RESOLUTION  (same-color destroys + chains, others bounce)
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
        destroyBlock(bk);
        blocks.splice(j, 1);
        state.blocksLeft = Math.max(0, state.blocksLeft - 1);
        registerBlockDestroy(bk.color);
        updateProgressBar();

        bl.body.velocity.x *= BALL_DESTROY_SLOWDOWN;
        bl.body.velocity.y *= BALL_DESTROY_SLOWDOWN;
        bl.body.velocity.z *= BALL_DESTROY_SLOWDOWN;

        cameraPunch(state, 1);
        cameraShake(state, 0.18);

        if (FX_WOBBLE_ENABLED) wobble(blocks, bk.mesh.position);
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
    ? ((state.blocksTotal - state.blocksLeft) / state.blocksTotal) * 100
    : 0;
  if (dom.progressFill) dom.progressFill.style.width = pct + '%';
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
   SHOOT
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
      destroyBlock(t);
      blocks.splice(idx, 1);
      state.blocksLeft = Math.max(0, state.blocksLeft - 1);
      registerBlockDestroy(t.color);
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
   AIM DOTS
   ============================================================ */
function updateAimDots() {
  const dir = getAimDir();
  const start = cannonBase.clone().addScaledVector(dir, CANNON_BALL_SPAWN);
  const v = dir.clone().multiplyScalar(BALL_SPEED);
  const show = state.playing && state.ballsLeft > 0;

  for (let i = 0; i < aimDots.length; i++) {
    const t = AIM_DOT_START_T + i * AIM_DOT_STEP_T;
    const p = start.clone().addScaledVector(v, t);
    p.y -= 0.5 * GRAVITY * t * t;

    const dot = aimDots[i];
    dot.position.copy(p);
    dot.visible = show && p.y > -0.4;
    const targetScale = Math.max(
      AIM_DOT_MIN_SCALE,
      1 - i / (aimDots.length * AIM_DOT_FALLOFF_DIV)
    );
    if (dot.visible) {
      /* stagger the pop-in only once, then hold steady */
      if (dot.scale.x < 0.05) {
        dot.scale.setScalar(0.001);
        import('animejs').then(({ default: animeLib }) => {
          animeLib({
            targets: dot.scale,
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: FX_AIM_DOT_POP_MS,
            delay: i * FX_AIM_DOT_STAGGER_MS,
            easing: 'easeOutBack'
          });
        });
      } else {
        dot.scale.setScalar(targetScale);
      }
    } else {
      dot.scale.setScalar(0.001);
    }
  }
}

/* ============================================================
   CAMERA EFFECTS  (shake + punch + slight FOV zoom)
   ============================================================ */
function applyCameraEffects() {
  let punchZ = 0;
  let punchY = 0;
  if (state.punchAmount > 0) {
    punchZ = state.punchAmount * 0.6;
    punchY = state.punchAmount * 0.14;
  }

  let shakeX = 0, shakeY = 0, shakeZ = 0;
  if (state.shakeTime > 0) {
    const k = state.shakeTime * 0.9;
    shakeX = (Math.random() - 0.5) * k;
    shakeY = (Math.random() - 0.5) * k;
    shakeZ = (Math.random() - 0.5) * k * 0.6;
  }

  camera.position.set(
    camBase.x + shakeX,
    camBase.y + shakeY + punchY,
    camBase.z + shakeZ - punchZ
  );
  camera.lookAt(camLook);

  const targetFov = CAMERA_FOV + (state.punchAmount > 0 ? state.punchAmount * 2.2 : 0);
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = targetFov;
    camera.updateProjectionMatrix();
  }
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
    oldest.material.dispose && oldest.material.dispose();
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

  import('animejs').then(({ default: animeLib }) => {
    animeLib({
      targets: ghost.scale,
      x: FX_TRAIL_END_SCALE,
      y: FX_TRAIL_END_SCALE,
      z: FX_TRAIL_END_SCALE,
      duration: FX_TRAIL_FADE_MS,
      easing: 'easeOutQuad'
    });
    animeLib({
      targets: mat,
      opacity: 0,
      duration: FX_TRAIL_FADE_MS,
      easing: 'easeOutQuad',
      complete: () => {
        if (bl.trailGroup) bl.trailGroup.remove(ghost);
        mat.dispose();
      }
    });
  });
}

/* ============================================================
   MAIN UPDATE
   ============================================================ */
function update(dt) {
  if (state.playing) resolveHits();

  world.step(PHYSICS_STEP, dt, PHYSICS_MAX_SUBSTEP);

  /* Sync block visuals */
  for (const b of blocks) {
    b.mesh.position.copy(b.body.position);
    b.mesh.quaternion.copy(b.body.quaternion);
  }

  /* Sync / cull balls + trails */
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

  updateCannonVisual();
  updateMuzzleBall();
  updateAimDots();
  applyCameraEffects();

  /* Win / Lose */
  if (state.playing) {
    if (state.blocksLeft === 0) {
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
   INPUT
   ============================================================ */
let pointerDown = false;

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDown = true;
  updatePointer(e.clientX, e.clientY);
});

window.addEventListener('pointermove', (e) => {
  if (e.target !== renderer.domElement && !pointerDown) return;
  updatePointer(e.clientX, e.clientY);
}, { passive: true });

window.addEventListener('pointerup', (e) => {
  if (!pointerDown) return;
  pointerDown = false;
  if (e.target === renderer.domElement) {
    updatePointer(e.clientX, e.clientY);
    shoot();
  }
});

window.addEventListener('pointercancel', () => { pointerDown = false; });

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
  updateCannonVisual();
  updateMuzzleBall();
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
    blocks,
    balls,
    particles,
    startLevel,
    shoot,
    cycleColor
  };
}