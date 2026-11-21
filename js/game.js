/* ============================================================
   TOWER CRASH 3D — game.js
   Entry module: builds the Three.js scene, the cannon-es world,
   and drives gameplay. Imports config.js and effects.js.
   ============================================================ */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {
  COLORS,
  BALL_RADIUS,
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
  BLOCK_SIZE,
  BLOCK_VISUAL_SCALE,
  TOWER_HEIGHT,
  TOWER_STAND_ELEV,
  TOWER_COLUMN_OFFSET,
  TOWER_X,
  TOWER_Z,
  TOWER_BLOCK_MASS,
  LEVEL_MAX,
  ballsForLevel,
  colorsForLevel,
  towerHeightForLevel,
  BASE_POINTS_PER_BLOCK,
  COMBO_WINDOW,
  COMBO_MULTIPLIERS,
  COINS_PER_BLOCK,
  COINS_PER_LEVEL_CLEAR,
  STARTING_COINS,
  COINS_PER_UNUSED_BALL,
  POWERUP_MULTIBALL,
  POWERUP_EARTHQUAKE,
  SHOTGUN_SPREAD_COUNT,
  ARENA_GROUND_RADIUS,
  ARENA_GRID_SIZE,
  ARENA_GRID_DIVS,
  ARENA_RING_RADIUS,
  ARENA_PILLAR_COUNT,
  ARENA_PILLAR_RADIUS,
  ARENA_PILLAR_HEIGHT,
  FOG_NEAR,
  FOG_FAR,
  UI_HUD_COUNT_MS,
  UI_PULSE_MS,
  UI_BUTTON_FEEDBACK_MS,
  UI_OVERLAY_IN_MS,
  UI_OVERLAY_OUT_MS,
  UI_BALL_SPAWN_MS,
  FX_PARTICLE_COUNT,
  FX_PARTICLE_LIFE_MIN,
  FX_PARTICLE_LIFE_MAX,
  FX_PARTICLE_GEO_SIZE,
  FX_PARTICLE_GRAVITY,
  FX_SHAKE_DURATION,
  FX_SHAKE_INTENSITY,
  FX_PUNCH_MS,
  FX_PUNCH_Z_OFFSET,
  FX_PUNCH_Y_OFFSET,
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
  overlayOut
} from './effects.js';

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const dom = {
  sceneHost:      document.getElementById('scene'),
  coins:          document.getElementById('hudCoins'),
  coinsWrap:      document.getElementById('hudCoinsWrap'),
  level:          document.getElementById('hudLevel'),
  levelNext:      document.getElementById('hudLevelNext'),
  progress:       document.getElementById('hudProgress'),
  progressFill:   document.getElementById('hudProgressFill'),
  progressNotch:  document.getElementById('hudProgressNotch'),
  levelWrap:      document.getElementById('hudLevelWrap'),
  btnShop:        document.getElementById('btnShop'),
  btnMultiball:   document.getElementById('btnMultiball'),
  btnEarthquake:  document.getElementById('btnEarthquake'),
  priceMultiball: document.getElementById('priceMultiball'),
  priceEarthquake:document.getElementById('priceEarthquake'),
  badgeMultiball: document.getElementById('badgeMultiball'),
  badgeEarthquake:document.getElementById('badgeEarthquake'),
  balls:          document.getElementById('hudBalls'),
  ballDot:        document.getElementById('hudBallDot'),
  ballsWrap:      document.getElementById('hudBallsWrap'),
  hint:           document.getElementById('hint'),
  overlay:        document.getElementById('overlay'),
  panel:          document.getElementById('panel'),
  ovTitle:        document.getElementById('ovTitle'),
  ovText:         document.getElementById('ovText'),
  ovBtn:          document.getElementById('ovBtn')
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
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);
dom.sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9ec9f0, FOG_NEAR, FOG_FAR);

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
   LIGHTS
   ============================================================ */
const hemi = new THREE.HemisphereLight(0xffffff, 0x9ec9f0, 1.05);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff6d8, 2.2);
sun.position.set(14, 26, 18);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left   = -30;
sun.shadow.camera.right  =  30;
sun.shadow.camera.top    =  30;
sun.shadow.camera.bottom = -30;
sun.shadow.camera.near   = 1;
sun.shadow.camera.far    = 110;
sun.shadow.bias = -0.0008;
scene.add(sun);

const rim = new THREE.DirectionalLight(0x8ec6ff, 1.15);
rim.position.set(-16, 12, -22);
scene.add(rim);

const fill = new THREE.PointLight(0xfff2c8, 0.55, 60, 2);
fill.position.set(0, 9, 14);
scene.add(fill);

/* ============================================================
   ARENA — ground, grid, ring, pillars
   ============================================================ */
const groundGeo = new THREE.CircleGeometry(ARENA_GROUND_RADIUS, 96);
groundGeo.rotateX(-Math.PI / 2);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x2f8fe0,
  roughness: 0.92,
  metalness: 0.08
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.receiveShadow = true;
groundMesh.position.y = 0;
scene.add(groundMesh);

const grid = new THREE.GridHelper(ARENA_GRID_SIZE, ARENA_GRID_DIVS, 0xbfe3ff, 0x87c4f2);
grid.position.y = 0.012;
grid.material.opacity = 0.42;
grid.material.transparent = true;
scene.add(grid);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(ARENA_RING_RADIUS, 0.16, 12, 128),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xbfe3ff,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.25
  })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.06;
scene.add(ring);

const pillarMat = new THREE.MeshStandardMaterial({
  color: 0x8fc4ee,
  roughness: 0.72,
  metalness: 0.18
});
const pillarGeo = new THREE.BoxGeometry(1.1, ARENA_PILLAR_HEIGHT, 1.1);
for (let i = 0; i < ARENA_PILLAR_COUNT; i++) {
  const a = (i / ARENA_PILLAR_COUNT) * Math.PI * 2;
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.set(
    Math.cos(a) * ARENA_PILLAR_RADIUS,
    ARENA_PILLAR_HEIGHT / 2,
    Math.sin(a) * ARENA_PILLAR_RADIUS
  );
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  scene.add(pillar);
}

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

const blockMats = COLORS.map(c => new THREE.MeshStandardMaterial({
  color: c.hex,
  roughness: 0.38,
  metalness: 0.14,
  emissive: c.hex,
  emissiveIntensity: 0.22,
  flatShading: true
}));

const ballMats = COLORS.map(c => new THREE.MeshStandardMaterial({
  color: c.hex,
  roughness: 0.22,
  metalness: 0.28,
  emissive: c.hex,
  emissiveIntensity: 0.55,
  flatShading: true
}));

/* ============================================================
   CANNON MESH + MUZZLE BALL + BALL-COUNT LABEL
   ============================================================ */
const cannonGroup = new THREE.Group();
const cannonBase = new THREE.Vector3(
  CANNON_POSITION.x,
  CANNON_POSITION.y,
  CANNON_POSITION.z
);
cannonGroup.position.copy(cannonBase);
scene.add(cannonGroup);

const barrelGeo = new THREE.CylinderGeometry(0.5, 0.72, 2.4, 22);
barrelGeo.rotateX(Math.PI / 2);
barrelGeo.translate(0, 0, 1.2);

const barrelMesh = new THREE.Mesh(
  barrelGeo,
  new THREE.MeshStandardMaterial({
    color: 0x9aa8bc,
    roughness: 0.32,
    metalness: 0.82,
    flatShading: true
  })
);
barrelMesh.castShadow = true;
cannonGroup.add(barrelMesh);

const barrelMouth = new THREE.Mesh(
  new THREE.TorusGeometry(0.46, 0.085, 8, 22),
  new THREE.MeshStandardMaterial({
    color: 0x3a4a6a,
    roughness: 0.4,
    metalness: 0.72
  })
);
barrelMouth.position.z = 2.4;
cannonGroup.add(barrelMouth);

const baseMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.95, 1.1, 0.7, 22),
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

/* Muzzle ball preview group */
const muzzleBallGroup = new THREE.Group();
scene.add(muzzleBallGroup);

const muzzleBallMat = ballMats[0].clone();
const muzzleBall = new THREE.Mesh(ballGeo, muzzleBallMat);
muzzleBall.scale.setScalar(1.15);
muzzleBall.castShadow = true;
muzzleBallGroup.add(muzzleBall);

/* Canvas-based count label rendered as a Sprite above the muzzle ball */
const labelCanvas = document.createElement('canvas');
labelCanvas.width = 128;
labelCanvas.height = 128;
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
labelSprite.scale.set(1.15, 1.15, 1);
labelSprite.renderOrder = 999;
labelSprite.position.set(0, BALL_RADIUS * 1.9, 0);
muzzleBallGroup.add(labelSprite);

function drawBallCount(num) {
  labelCtx.clearRect(0, 0, 128, 128);
  const text = String(num);
  labelCtx.font = '900 84px Arial, sans-serif';
  labelCtx.textAlign = 'center';
  labelCtx.textBaseline = 'middle';
  labelCtx.lineWidth = 14;
  labelCtx.strokeStyle = 'rgba(10, 30, 60, 0.9)';
  labelCtx.strokeText(text, 64, 70);
  labelCtx.fillStyle = '#ffffff';
  labelCtx.fillText(text, 64, 70);
  labelTexture.needsUpdate = true;
}

/* ============================================================
   AIM DOTS
   ============================================================ */
const aimDots = [];
const dotGeo = new THREE.SphereGeometry(0.1, 8, 6);
const dotMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.58,
  depthWrite: false
});
for (let i = 0; i < AIM_DOT_COUNT; i++) {
  const d = new THREE.Mesh(dotGeo, dotMat);
  d.visible = false;
  scene.add(d);
  aimDots.push(d);
}

/* ============================================================
   GAME OBJECT ARRAYS + PARTICLE POOL
   ============================================================ */
let blocks    = [];
let balls     = [];
let particles = [];
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
  const pos = cannonBase.clone().addScaledVector(dir, CANNON_BALL_SPAWN);
  muzzleBallGroup.position.copy(pos);
  muzzleBallGroup.visible = state.ballsLeft > 0;
  muzzleBall.rotation.y += 0.015;
}

function updateBallColorVisual() {
  const c = COLORS[state.currentColor];
  if (!c) return;
  muzzleBallMat.color.setHex(c.hex);
  muzzleBallMat.emissive.setHex(c.hex);
  muzzleBallMat.emissiveIntensity = 0.55;
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

function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

/* ============================================================
   TOWER BUILDING
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

  blocks.push({ mesh, body, color: colorIdx });
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
    world.removeBody(bl.body);
  }
  balls.length = 0;

  for (const pt of particles) scene.remove(pt.mesh);
  particles.length = 0;
}

function buildTower(level) {
  clearField();

  const colorCount = colorsForLevel(level);
  const palette = shuffle(COLORS.map(c => c.id)).slice(0, colorCount);
  const height = towerHeightForLevel(level);

  const baseX = TOWER_X;
  const baseZ = TOWER_Z;
  const baseY = TOWER_STAND_ELEV;

  /* Pedestal (visual stand under the column) */
  const pedGeo = new THREE.CylinderGeometry(1.35, 1.65, TOWER_STAND_ELEV, 24);
  const pedMat = new THREE.MeshStandardMaterial({
    color: 0x5a7aa8,
    roughness: 0.6,
    metalness: 0.35
  });
  const pedestal = new THREE.Mesh(pedGeo, pedMat);
  pedestal.position.set(baseX, TOWER_STAND_ELEV / 2, baseZ);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  pedestals.push(pedestal);

  /* Single tall narrow column with slight per-block jitter */
  for (let i = 0; i < height; i++) {
    const colorIdx = palette[i % palette.length];
    const jx = (Math.random() - 0.5) * TOWER_COLUMN_OFFSET * 2;
    const jz = (Math.random() - 0.5) * TOWER_COLUMN_OFFSET * 2;
    const y = baseY + BLOCK_SIZE / 2 + i * BLOCK_SIZE + 0.001;
    addBlock(baseX + jx, y, baseZ + jz, colorIdx);
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

  const start = cannonBase.clone().addScaledVector(dir, CANNON_BALL_SPAWN);

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

  balls.push({
    mesh,
    body,
    color: colorIdx,
    age: 0,
    slow: 0
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
   DESTRUCTION + PARTICLES
   ============================================================ */
function spawnBurst(pos, colorIdx) {
  const group = [];
  const count = Math.min(FX_PARTICLE_COUNT, MAX_PARTICLES - particles.length);
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(particleGeo, particleMats[colorIdx]);
    m.position.copy(pos);
    m.position.x += (Math.random() - 0.5) * 0.3;
    m.position.y += (Math.random() - 0.5) * 0.3;
    m.position.z += (Math.random() - 0.5) * 0.3;
    m.scale.setScalar(0.6 + Math.random() * 0.9);
    scene.add(m);

    const life = FX_PARTICLE_LIFE_MIN +
      Math.random() * (FX_PARTICLE_LIFE_MAX - FX_PARTICLE_LIFE_MIN);

    particles.push({
      mesh: m,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 9 + 2,
        (Math.random() - 0.5) * 10
      ),
      life: 0,
      max: life,
      rotX: (Math.random() - 0.5) * 16,
      rotY: (Math.random() - 0.5) * 16
    });
    group.push(m);
  }
  burst(group, FX_PARTICLE_LIFE_MAX * 1000);
}

function destroyBlock(bk) {
  scene.remove(bk.mesh);
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
        destroyBlock(bk);
        blocks.splice(j, 1);
        state.blocksLeft = Math.max(0, state.blocksLeft - 1);
        registerBlockDestroy(bk.color);
        updateProgressBar();

        bl.body.velocity.x *= BALL_DESTROY_SLOWDOWN;
        bl.body.velocity.y *= BALL_DESTROY_SLOWDOWN;
        bl.body.velocity.z *= BALL_DESTROY_SLOWDOWN;

        cameraPunch(state, 1);
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

  cameraPunch(state, 0.8);
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

  cameraShake(state, FX_SHAKE_DURATION);
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
}

function activateEarthquake() {
  if (!state.playing) return;
  if (state.coins < POWERUP_EARTHQUAKE.price) return;

  state.coins -= POWERUP_EARTHQUAKE.price;
  updateHudCoins(true);
  updatePowerupUI();
  buttonFeedback(dom.btnEarthquake);
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
   MAIN UPDATE
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
    const scale = Math.max(
      AIM_DOT_MIN_SCALE,
      1 - i / (aimDots.length * AIM_DOT_FALLOFF_DIV)
    );
    dot.scale.setScalar(scale);
  }
}

function applyCameraEffects() {
  let punchZ = 0;
  let punchY = 0;
  if (state.punchAmount > 0) {
    punchZ = state.punchAmount * FX_PUNCH_Z_OFFSET;
    punchY = state.punchAmount * FX_PUNCH_Y_OFFSET;
  }

  let shakeX = 0, shakeY = 0, shakeZ = 0;
  if (state.shakeTime > 0) {
    const k = state.shakeTime * FX_SHAKE_INTENSITY;
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
}

function update(dt) {
  if (state.playing) resolveHits();

  world.step(PHYSICS_STEP, dt, PHYSICS_MAX_SUBSTEP);

  for (const b of blocks) {
    b.mesh.position.copy(b.body.position);
    b.mesh.quaternion.copy(b.body.quaternion);
  }

  for (let i = balls.length - 1; i >= 0; i--) {
    const bl = balls[i];
    bl.mesh.position.copy(bl.body.position);
    bl.mesh.quaternion.copy(bl.body.quaternion);

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
      balls.splice(i, 1);
    }
  }

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
   INPUT HANDLERS
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
  dom.ballsWrap.style.pointerEvents = 'auto';
  dom.ballsWrap.style.cursor = 'pointer';
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
let rafId = 0;

function loop(now) {
  rafId = requestAnimationFrame(loop);

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
  rafId = requestAnimationFrame(loop);
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