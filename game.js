const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const pauseScreen = document.getElementById('pauseScreen');
const resumeButton = document.getElementById('resumeButton');
const pauseEmoji = document.getElementById('pauseEmoji');
const pauseTitle = document.getElementById('pauseTitle');
const pauseMain = document.getElementById('pauseMain');
const pauseSub = document.getElementById('pauseSub');
const giftScreen = document.getElementById('giftScreen');
const giftTitle = document.getElementById('giftTitle');
const giftMain = document.getElementById('giftMain');
const giftSub = document.getElementById('giftSub');
const giftContinue = document.getElementById('giftContinue');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverSub = document.getElementById('gameOverSub');
const restartButton = document.getElementById('restartButton');

const ASSET = 'assets/';
let catEncounterImageIndex = 0;
let dogEncounterImageIndex = 0;
let animalEncounterTimer = null;
const walkImgs = [], runImgs = [], jumpImgs = [];
const dietCokeImgs = [];
const danceImgs = [];
for (const file of ['dance-1.png','dance-2.png','dance-3.png','dance-4.png','dance-2-1.png','dance-2-2.png','dance-2-3.png','dance-2-4.png']) {
  const img = new Image(); img.src = `${ASSET}dance/${file}`; danceImgs.push(img);
}
const regulatorImgs = [];
for (let i = 1; i <= 6; i++) {
  const img = new Image(); img.src = `${ASSET}regulator/regulator-${i}.png`; regulatorImgs.push(img);
}
const regulatorIcon = new Image(); regulatorIcon.src = `${ASSET}regulator-icon.png`;
const danceIcon = new Image(); danceIcon.src = `${ASSET}dance-icon.svg`;
const startSfx = new Audio(`${ASSET}sanchai.aac`);
startSfx.preload = 'auto'; startSfx.volume = 0.9;

// Game-over sound effect. Place lose.mp3 inside the assets/ folder.
const loseSfx = new Audio(`${ASSET}lose.mp3`);
loseSfx.preload = 'auto';
loseSfx.volume = 0.9;

const movieImgs = [];
const projectorIcon = new Image();
projectorIcon.src = `${ASSET}movie/projector-icon.png`;
const phoneIcon = new Image();
phoneIcon.src = `${ASSET}phone-icon.png`;
const polaroidIcon = new Image();
polaroidIcon.src = `${ASSET}icons/photo_polaroid.svg`;
const notificationIcon = new Image();
notificationIcon.src = `${ASSET}icons/phone_notification.svg`;
let polaroidMedia = [], notificationMedia = [];
fetch(`${ASSET}polaroid_sequence.json`).then(r => r.json()).then(data => { polaroidMedia = data; }).catch(() => {});
fetch(`${ASSET}notification_sequence.json`).then(r => r.json()).then(data => { notificationMedia = data; }).catch(() => {});

const hungryImgs = [];
for (let i = 1; i <= 9; i++) {
  const img = new Image();
  img.src = `${ASSET}hungry/hungry-${i}.png`;
  hungryImgs.push(img);
}
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `${ASSET}movie/movie-${i}.png`;
  movieImgs.push(img);
}
const dogImgs = {};
const DOG_SPRITE_KEYS = ['yellow', 'red', 'pink', 'blue', 'green', 'purple'];
for (const key of DOG_SPRITE_KEYS) {
  dogImgs[key] = [];
  for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `${ASSET}dogs/${key}/frame_${String(i).padStart(2, '0')}.png`;
    dogImgs[key].push(img);
  }
}

// Six approved cat walk cycles supplied for the game.
const catImgs = {};
const CAT_SPRITE_KEYS = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'];
for (const key of CAT_SPRITE_KEYS) {
  catImgs[key] = [];
  for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `${ASSET}cats/${key}/frame_${String(i).padStart(2, '0')}.png`;
    catImgs[key].push(img);
  }
}

// Approved obstacle artwork: animated sprites plus the two static warning signs.
const obstacleImgs = {
  laxuman: [],
  boss: [],
  bermiok: [],
  impromptu: [],
  network: []
};
for (const [key, count] of [['laxuman', 8], ['boss', 8], ['bermiok', 5]]) {
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.src = `${ASSET}obstacles/${key}/frame_${String(i).padStart(2, '0')}.png`;
    obstacleImgs[key].push(img);
  }
}
for (const key of ['impromptu', 'network']) {
  const img = new Image();
  img.src = `${ASSET}obstacles/${key}.png`;
  obstacleImgs[key].push(img);
}

function loadFrames(prefix, count, target) {
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.src = `${ASSET}${prefix}_${String(i).padStart(2, '0')}.png`;
    target.push(img);
  }
}
loadFrames('walk', 8, walkImgs);
loadFrames('run', 8, runImgs);
loadFrames('jump', 8, jumpImgs);
for (let i = 1; i <= 7; i++) {
  const img = new Image();
  img.src = `${ASSET}diet_coke/coke-${i}.png`;
  dietCokeImgs.push(img);
}

// Clay-making animation frames and the clay collectible icon.
const clayImgs = [];
for (let i = 1; i <= 10; i++) {
  const img = new Image();
  img.src = `${ASSET}clay/clay-${i}.png`;
  clayImgs.push(img);
}
const clayIcon = new Image();
clayIcon.src = `${ASSET}clay/clay-icon.png`; // Transparent hands-and-clay icon.

// Each clay memory reveals exactly ONE finished product. The list cycles so
// every new clay collectible reveals the next product, rather than a slideshow.
const clayProductFiles = [
  'clay-product.png',
  'clay-product-1.png',
  'clay-product-2.png',
  'clay-product-3.png',
  'clay-product-4.png',
  'clay-product-6.png',
  'clay-product-7.png',
  'clay-product-8.png'
];
const clayProductImgs = clayProductFiles.map(file => {
  const img = new Image();
  img.src = `${ASSET}clay/products/${file}`;
  return img;
});
let nextClayProductIndex = 0;


let W = 0, H = 0, dpr = 1;
function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const state = {
  running: false,
  paused: false,
  gameOver: false,
  giftPaused: false,
  time: 0,
  distance: 0,
  worldX: 0,
  energy: 0,
  memories: 0,
  pets: 0,
  speed: 145,
  nextCollectibleAt: 0,
  nextObstacleAt: 0,
  nextAnimalAt: 0,
  collectedCount: 0,
  obstacleHits: 0,
  obstacleHitsSinceFall: 0,
  hitFlashUntil: 0,
  fallenTimer: 0,
  invulnerableUntil: 0,
  presentCount: 0,
  feedback: '',
  feedbackUntil: 0,
  shake: 0,
  currentInteraction: null,
  dietCokeAnimation: null,
  movieAnimation: null,
  hungryAnimation: null,
  clayAnimation: null,
  danceAnimation: null,
  regulatorAnimation: null,
  snorePlayedFrame: -1,
  burpPlayedFrame: -1,
  recentCollectibles: [],
  recentObstacles: [],
  recentAnimals: [],
  collectibleSerial: 0,
  obstacleSerial: 0,
  animalSerial: 0
};

const player = {
  x: 0,
  y: 0,
  vy: 0,
  width: 76,
  height: 96,
  grounded: true,
  animTime: 0
};

const ground = { get y() { return H * 0.79; } };

// These are MEMORY themes. They can return much later with a different line,
// but the exact same memory does not immediately repeat.
const collectibleThemes = [
  {
    key: 'phone', name: 'PHONE CALL', icon: '☎', energy: [16, 20], color: '#a9c9dd',
    variants: [
      ['HI BITCH.', 'She called. Obviously. You are her walking-timepass.'],
      ['BABBEEEE, WHERE ARE YOU?', 'She is already telling you the entire story.'],
      ['KEEP TALKING.', 'Wake. Walk. Work. Sleep. Somehow you are always on the phone.'],
      ['YOU KNOW WHAT HAPPENED?', 'The call has officially become a podcast.']
    ]
  },
  {
    key: 'photo-memory', name: 'OUR PHOTOS', icon: '▣', energy: [20, 20], color: '#f0c878',
    variants: [
      ['A LITTLE PHOTO.', 'One of your moments together.'],
      ['FROM THE CAMERA ROLL.', 'A memory worth keeping.']
    ]
  },
  {
    key: 'notification-memory', name: 'BABYLA SENT YOU SOMETHING', icon: '▣', energy: [20, 20], color: '#dca39a',
    variants: [
      ['BABYLA SENT YOU SOMETHING.', 'A photo or video from her camera roll.'],
      ['NEW MESSAGE.', 'Something she wanted you to see.']
    ]
  },
  {
    key: 'movie', name: 'MOVIE NIGHT', icon: '▶', energy: [20, 20], color: '#c8acd8',
    variants: [
      ["BABE LET'S WATCH A MOVIE.", 'Five minutes later: asleep. You are watching alone again.'],
      ['WAIT... MY FAVOURITE PART.', 'She says this. Then immediately dozes off.'],
      ['MOVIE?', 'Blanket acquired. Movie started. She is already asleep.']
    ]
  },
  {
    key: 'diet-coke', name: 'DIET COKE', icon: 'C', energy: [15, 15], color: '#e5e5e5',
    variants: [
      ['PSSSSSHHHH!', 'Sip. Pause. BUUUURRRRP! She laughs because she loves burping in front of you.'],
      ['DIET COKE TIME.', 'Open. Drink. Giggle. Carry on.'],
      ['BUUUURRRRP!', 'Zero shame. Maximum entertainment.']
    ]
  },
  {
    key: 'clay', name: 'CLAY TIME', icon: '●', energy: [15, 18], color: '#d1a17e',
    variants: [
      ['I AM MAKING SOMETHING.', 'Clay becomes a tiny little object that somehow makes sense to her.'],
      ['LOOK WHAT I MADE.', 'Tiny clay thing. Very serious business.'],
      ['CLAY MODE.', 'She disappears into making something weird and wonderful.']
    ]
  },
  {
    key: 'dance', name: 'RANDOM DANCE', icon: '♫', energy: [16, 20], color: '#e5bf6b',
    variants: [
      ['NO WARNING. JUST DANCE.', 'One weird song. Three weird moves. Then she carries on.'],
      ['WHY AM I DANCING?', 'Excellent question. She has no answer.'],
      ['LOOK AT THIS MOVE.', 'You absolutely did not ask to see this move.']
    ]
  },
  {
    key: 'gas', name: 'GAS REGULATOR', icon: '✓', energy: [15, 18], color: '#9eb796',
    variants: [
      ['CHECKED. SENDING FOR CROSSCHECK.', 'The regulator video has been sent. Peace has been restored.'],
      ['WAIT. LET ME CHECK THE GAS.', 'Video proof acquired. You are now the official crosschecker.'],
      ['REGULATOR CHECK.', 'She is not leaving the house without checking it twice.']
    ]
  }
];

const obstacleThemes = [
  { key:'boss', spriteKey:'boss', name:'DEW KUMAR • TASK BIRD', icon:'!', color:'#d95c67', variants:[
    ['EDEN MADAM PLEASE YO GARIDINUS.', 'A fresh task has entered the flight path.'],
    ['URGENT TASK!', 'It would apparently take only two minutes.'],
    ['ONE MORE THING, MADAM.', 'The papers are multiplying. Dodge!']
  ]},
  { key:'laxuman', spriteKey:'laxuman', name:'LAXUMAN DAJU', icon:'!', color:'#875d6b', variants:[
    ['LAXUMAN DAJU APPEARED.', 'Dodge the snake, whether he is on the road or in the air.'],
    ['DAJU INCOMING.', 'She has approximately zero interest in this detour.'],
    ['OFFICE DRAMA DETECTED.', 'Snake ahead. Keep moving.']
  ]},
  { key:'impromptu', spriteKey:'impromptu', name:'SRISTI’S IMPROMPTU PLAN', icon:'!', color:'#e65c60', variants:[
    ['LAST-MINUTE PLAN!', 'She did not ask for this. She would like to decline.'],
    ['WE ARE GOING OUT.', 'No. She had plans. Her plans were doing nothing.'],
    ['SURPRISE PLAN.', 'She does not like surprise plans. At all.']
  ]},
  { key:'network', spriteKey:'network', name:'BAD NETWORK', icon:'×', color:'#e65c60', variants:[
    ['BAD NETWORK.', 'The call is breaking up at the worst possible time.'],
    ['HELLO? CAN YOU HEAR ME?', 'Connection lost. Patience also lost.'],
    ['NETWORK ERROR.', 'The signal has left the conversation.']
  ]},
  { key:'bermiok', spriteKey:'bermiok', name:'BERMIOK SERVICE', icon:'⌁', color:'#6e8669', variants:[
    ['BERMIOK SERVICE!', 'The journey home is long enough already.'],
    ['THE BERMIOK JEEP.', 'Road trip energy, whether she asked for it or not.'],
    ['BERMIOK AGAIN?', 'She is already calculating the journey.']
  ]}
];

const animalThemes = [
  {kind:'cat', name:'Choti', spriteKey:'cat1'},
  {kind:'cat', name:'Amuni', spriteKey:'cat2'},
  {kind:'cat', name:'Room Cat', spriteKey:'cat3'},
  {kind:'cat', name:'Tiny Cat', spriteKey:'cat4'},
  {kind:'cat', name:'Clay Cat 5', spriteKey:'cat5'},
  {kind:'cat', name:'Clay Cat 6', spriteKey:'cat6'},
  {kind:'dog', name:'Yellow Scarf Dog', spriteKey:'yellow'},
  {kind:'dog', name:'Red Scarf Dog', spriteKey:'red'},
  {kind:'dog', name:'Pink Scarf Dog', spriteKey:'pink'},
  {kind:'dog', name:'Blue Scarf Dog', spriteKey:'blue'},
  {kind:'dog', name:'Green Scarf Dog', spriteKey:'green'},
  {kind:'dog', name:'Purple Scarf Dog', spriteKey:'purple'}
];

let collectibles = [], obstacles = [], animals = [], particles = [];

function resetGame() {
  // Stop any game-over sound when starting or restarting a run.
  loseSfx.pause();
  loseSfx.currentTime = 0;
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.giftPaused = false;
  state.time = 0;
  state.distance = 0;
  state.worldX = 0;
  state.energy = 0;
  state.memories = 0;
  state.pets = 0;
  state.speed = 200;
  state.nextCollectibleAt = 360;
  state.nextObstacleAt = 620;
  state.nextAnimalAt = 900;
  state.collectedCount = 0;
  state.obstacleHits = 0;
  state.obstacleHitsSinceFall = 0;
  state.hitFlashUntil = 0;
  state.fallenTimer = 0;
  state.invulnerableUntil = 0;
  state.presentCount = 0;
  state.feedback = '';
  state.feedbackUntil = 0;
  state.shake = 0;
  state.currentInteraction = null;
  state.dietCokeAnimation = null;
  state.movieAnimation = null;
  state.hungryAnimation = null;
  state.clayAnimation = null;
  state.danceAnimation = null;
  state.regulatorAnimation = null;
  state.snorePlayedFrame = -1;
  state.burpPlayedFrame = -1;
  state.recentCollectibles = [];
  state.recentObstacles = [];
  state.recentAnimals = [];
  state.collectibleSerial = 0;
  state.obstacleSerial = 0;
  state.animalSerial = 0;
  collectibles = [];
  obstacles = [];
  animals = [];
  particles = [];

  player.x = Math.max(120, W * 0.23);
  player.y = ground.y - player.height + 10;
  player.vy = 0;
  player.grounded = true;
  player.animTime = 0;

  startScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  giftScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');

  // Seed a generous, spaced-out opening. New content continues forever below.
  spawnCollectible(W + 360);
  spawnObstacle(W + 720);
  spawnCollectible(W + 1120);
  spawnAnimal(W + 920);
  spawnObstacle(W + 1540);
  spawnCollectible(W + 1920);
  spawnAnimal(W + 2280);
}

function pickFresh(list, recent, serialKey) {
  const allowed = list.filter(x => !recent.includes(x.key));
  const pool = allowed.length ? allowed : list;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  recent.push(chosen.key);
  const limit = list.length >= 8 ? 7 : Math.max(3, list.length - 1);
  while (recent.length > limit) recent.shift();
  return chosen;
}

function randomEnergy(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function tooCloseToOtherEvents(x, kind, minGap = 300) {
  // Check BOTH event types, including other obstacles. This prevents two
  // hazards from spawning into the same patch of road or sky.
  const allEvents = [...obstacles, ...collectibles];
  return allEvents.some(item => {
    if (!item.active) return false;
    const clearance = kind === 'obstacle' && item.theme && item.theme !== 'phone'
      ? Math.max(minGap, ((item.w || 80) / 2) + 190)
      : minGap;
    return Math.abs(item.x - x) < clearance;
  });
}

function safeEventX(baseX, kind) {
  let x = baseX;
  let tries = 0;
  const gap = kind === 'obstacle' ? 330 : 285;
  while (tooCloseToOtherEvents(x, kind, gap) && tries < 18) {
    x += 130 + Math.random() * 190;
    tries++;
  }
  return x;
}

function spawnCollectible(x = W + 260) {
  x = safeEventX(x, 'collectible');
  const theme = pickFresh(collectibleThemes, state.recentCollectibles, 'collectibleSerial');
  const variant = theme.variants[Math.floor(Math.random() * theme.variants.length)];
  const item = {
    id: `${theme.key}-${++state.collectibleSerial}`,
    theme: theme.key,
    name: theme.name,
    icon: theme.icon,
    color: theme.color,
    energy: randomEnergy(theme.energy),
    title: variant[0],
    sub: variant[1],
    x,
    y: 125 + Math.random() * Math.max(70, H * 0.36),
    w: 58,
    h: 58,
    active: true,
    phase: Math.random() * Math.PI * 2
  };
  collectibles.push(item);
  return item;
}

function spawnObstacle(x = W + 340) {
  x = safeEventX(x, 'obstacle');
  const theme = pickFresh(obstacleThemes, state.recentObstacles, 'obstacleSerial');
  const variant = theme.variants[Math.floor(Math.random() * theme.variants.length)];

  // The jeep stays on the road; the task bird and warning signs stay airborne.
  // Laxuman's same snake sprite can appear in either lane.
  let grounded;
  if (theme.key === 'bermiok') grounded = true;
  else if (['boss', 'impromptu', 'network'].includes(theme.key)) grounded = false;
  else if (theme.key === 'laxuman') grounded = Math.random() < 0.48;
  else grounded = ['socialising', 'work'].includes(theme.key) || Math.random() < 0.28;

  let w = grounded ? 82 : 84;
  let h = grounded ? 58 : 68;
  if (theme.key === 'laxuman') { w = grounded ? 102 : 88; h = grounded ? 68 : 78; }
  if (theme.key === 'boss') { w = 150; h = 92; }
  if (theme.key === 'bermiok') { w = 154; h = 100; }
  if (theme.key === 'impromptu' || theme.key === 'network') { w = 76; h = 76; }

  const o = {
    id: `${theme.key}-${++state.obstacleSerial}`,
    theme: theme.key,
    spriteKey: theme.spriteKey || null,
    name: theme.name,
    icon: theme.icon,
    color: theme.color,
    title: variant[0],
    sub: variant[1],
    x,
    y: grounded ? ground.y - h / 2 : 130 + Math.random() * Math.max(80, H * 0.34),
    w,
    h,
    grounded,
    trackPlayer: theme.key === 'boss',
    // Dew follows her altitude from a parallel lane, not directly on top of her.
    // The offset is fixed for this encounter so he never snaps through her path.
    followOffsetY: theme.key === 'boss' ? -118 : 0,
    active: true,
    phase: Math.random() * Math.PI * 2
  };
  obstacles.push(o);
  return o;
}

function spawnAnimal(x = W + 300) {
  const available = animalThemes.filter(a => !state.recentAnimals.includes(a.name));
  const pool = available.length ? available : animalThemes;
  const base = pool[Math.floor(Math.random() * pool.length)];
  state.recentAnimals.push(base.name);
  while (state.recentAnimals.length > 5) state.recentAnimals.shift();
  animals.push({
    ...base,
    id: `${base.kind}-${++state.animalSerial}`,
    x,
    y: ground.y - 35,
    w: 66,
    h: 40,
    active: true,
    followed: false,
    followOffset: 70 + Math.floor(Math.random() * 4) * 48,
    followSide: Math.random() < 0.5 ? -1 : 1,
    phase: Math.random() * Math.PI * 2
  });
}


const jumpSound = new Audio("assets/jump.wav");
jumpSound.volume = 0.5;

function playJumpSound() {
  jumpSound.currentTime = 0;
  jumpSound.play().catch(error => {
    console.log("Jump sound could not play:", error);
  });
}

function jump() {
  if (!state.running || state.paused || state.giftPaused) return;
  player.vy = Math.max(player.vy - 420, -720);
  player.grounded = false;
  playJumpSound();
  burst(player.x + 25, player.y + 70, '#fff1c9', 3);
}
const memorySound = new Audio("assets/collect.wav");
memorySound.volume = 0.7;

function playMemorySound() {
  memorySound.currentTime = 0;
  memorySound.play().catch(console.warn);
}

const bgMusic = new Audio("assets/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.25;


function startBackgroundMusic() {
  bgMusic.volume = 0.25;

  // Start from the beginning if the track has ended.
  if (bgMusic.ended) {
    bgMusic.currentTime = 0;
  }

  // Avoid starting a second copy if music is already playing.
  if (!bgMusic.paused) return;

  const playPromise = bgMusic.play();

  if (playPromise) {
    playPromise.catch(error => {
      console.warn("Background music could not play:", error);
    });
  }
}


function stopBackgroundMusic() {
  bgMusic.pause();
}

// Soft instrumental soundtrack for the clay-making scene.
const clayMusic = new Audio(`${ASSET}clay/ninja.mp3`);
clayMusic.loop = true;
clayMusic.volume = 0.35;
const clayRevealSound = new Audio(`${ASSET}clay/product-reveal.mp3`);
clayRevealSound.volume = 0.8;
let clayRevealPlayed = false;
function stopClayMusic() {
  clayMusic.pause();
  clayMusic.currentTime = 0;
  clayRevealSound.pause();
  clayRevealSound.currentTime = 0;
  clayRevealPlayed = false;
}


canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  jump();
}, { passive: false });

const obstacleMusic = new Audio("assets/obstacles.mp3");
obstacleMusic.volume = 0.7;
obstacleMusic.loop = false;

function playObstacleMusic() {
  obstacleMusic.currentTime = 0;
  obstacleMusic.play().catch(console.warn);
}
startButton.addEventListener('click', () => {
  resetGame();
  try { startSfx.pause(); startSfx.currentTime = 0; startSfx.play().catch(() => {}); } catch (_) {}
  startBackgroundMusic();
});

const catSound = new Audio("assets/cat.wav");
catSound.volume = 0.8;


const dogSound = new Audio("assets/dog.wav");
dogSound.volume = 0.8;

function playPetSound(kind) {
  const sound = kind === "cat" ? catSound : dogSound;
  sound.currentTime = 0;
  sound.play().catch(console.warn);
}


const cokeOpenSound = new Audio("assets/coke-open.mp3");
const cokeGulpSound = new Audio("assets/coke-drink.mp3");
const cokeBurpSound = new Audio("assets/coke-burp.mp3");

cokeOpenSound.volume = 0.8;
cokeGulpSound.volume = 0.8;
cokeBurpSound.volume = 1.0;

function playCokeEffect(sound) {
  sound.currentTime = 0;
  sound.play().catch(console.warn);
}





resumeButton.addEventListener('click', resumeInteraction);

restartButton.addEventListener('click', () => {
  resetGame();
  startBackgroundMusic();
});


giftContinue.addEventListener('click', () => {
  giftScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  state.giftPaused = false;
  state.paused = false;
});

function openInteraction(item) {
  state.paused = true;
  state.currentInteraction = item;

  // Diet Coke is a fully animated little interruption. It plays automatically
  // and returns to the run without requiring a button tap.
  if (item.theme === 'diet-coke') {
    pauseScreen.classList.add('hidden');
    state.dietCokeAnimation = {
      elapsed: 0,
      frame: 0,
        playedOpen: false,
  playedGulp: false,
  playedBurp: false,
      frameDuration: 0.52,
      finished: false
    };
    return;
  }

  if (item.theme === 'clay') {
    pauseScreen.classList.add('hidden');
    state.clayAnimation = { elapsed: 0, frame: 0, frameDuration: 0.55, phase: 'kneading', productIndex: nextClayProductIndex, revealElapsed: 0, finished: false };
    nextClayProductIndex = (nextClayProductIndex + 1) % clayProductImgs.length;
    clayRevealPlayed = false;
    clayMusic.currentTime = 0;
    clayMusic.play().catch(() => {});
    return;
  }

  if (item.theme === 'movie') {
    pauseScreen.classList.add('hidden');
    state.movieAnimation = { elapsed: 0, frame: 0, frameDuration: 0.82, finished: false };
    state.snorePlayedFrame = -1;
    return;
  }

  if (item.theme === 'phone') {
    pauseScreen.classList.add('hidden');
    state.hungryAnimation = { elapsed: 0, frame: 0, frameDuration: 0.72, finished: false };
    state.burpPlayedFrame = -1;
    return;
  }

  if (item.theme === 'photo-memory' || item.theme === 'notification-memory') {
    pauseScreen.classList.add('hidden');
    playMediaMemory(item.theme);
    return;
  }

  // These two memories are visual sequences. Timers are independent of image
  // loading, so a missing frame can never leave the game permanently paused.
  if (item.theme === 'dance') {
    pauseScreen.classList.add('hidden');
    state.danceAnimation = { elapsed: 0, frame: 0, frameDuration: 0.22, finished: false };
    return;
  }
  if (item.theme === 'gas') {
    pauseScreen.classList.add('hidden');
    state.regulatorAnimation = { elapsed: 0, frame: 0, frameDuration: 1.2, finished: false };
    return;
  }

  pauseEmoji.textContent = item.icon;
  pauseTitle.textContent = 'MEMORY • ' + item.name;
  pauseMain.textContent = item.title;
  pauseSub.textContent = item.sub;
  const encounterCard = document.getElementById('animalEncounterCard');
if (encounterCard) encounterCard.classList.add('animal-encounter-mode');
  pauseScreen.classList.remove('hidden');
}

function resumeInteraction() {
  const item = state.currentInteraction;
  pauseScreen.classList.add('hidden');
  pauseScreen.classList.remove('animal-encounter-screen');
  const encounterCard = document.getElementById('animalEncounterCard');
  if (encounterCard) encounterCard.classList.remove('animal-encounter-mode');
  pauseEmoji.style.display = '';
  pauseTitle.style.display = '';
  pauseMain.style.display = '';
  pauseSub.style.display = '';
  resumeButton.style.display = '';
  state.currentInteraction = null;
  state.dietCokeAnimation = null;
  state.paused = false;
  if (item) addEnergy(item.energy);
}

function hitObstacle(o) {
  if (!o.active || performance.now() < state.invulnerableUntil) return;
  o.active = false;
  playObstacleMusic();
  state.obstacleHits++;
  state.obstacleHitsSinceFall++;
  state.hitFlashUntil = performance.now() + 850;
  state.feedback = `HIT ${state.obstacleHitsSinceFall}/3`; 
  state.feedbackUntil = performance.now() + 1100;
  state.shake = 9;
  state.invulnerableUntil = performance.now() + 900;
  burst(player.x + 35, player.y + 40, '#e64f58', 14);

  // Three hits end the run. She gets a brief knockdown animation first.
  if (state.obstacleHitsSinceFall >= 3) {
    state.fallenTimer = 0.72;
    player.vy = 180;
    player.grounded = false;
    state.feedback = 'THREE HITS! DOWN SHE GOES.';
    state.feedbackUntil = performance.now() + 900;
  }
}

function petAnimal(a) {
  if (a.followed) return;

  playPetSound(a.kind);
  a.followed = true;
  state.pets++;
  state.paused = true;
  state.currentInteraction = null;

  const encounterCard = document.getElementById('animalEncounterCard');
  if (!encounterCard) {
    state.paused = false;
    return;
  }

  pauseEmoji.style.display = 'none';
  pauseTitle.style.display = 'none';
  pauseMain.style.display = 'none';
  pauseSub.style.display = 'none';
  resumeButton.style.display = 'none';

  let encounterImage = document.getElementById('animalEncounterImage');
  if (!encounterImage) {
    encounterImage = document.createElement('img');
    encounterImage.id = 'animalEncounterImage';
    encounterImage.alt = a.kind === 'cat' ? 'Babyla interacting with a cat' : 'Babyla interacting with a dog';
    encounterImage.style.display = 'block';
    encounterImage.style.width = 'auto';
    encounterImage.style.maxWidth = 'min(92vw, 520px)';
    encounterImage.style.maxHeight = '48vh';
    encounterImage.style.objectFit = 'contain';
    encounterImage.style.objectPosition = 'center bottom';
    encounterImage.style.margin = '0 auto';
    encounterCard.insertBefore(encounterImage, encounterCard.firstChild);
  }

  if (a.kind === 'cat') {
    const images = ['cat-1.png', 'cat-2.png'];
    encounterImage.src = ASSET + images[catEncounterImageIndex];
    catEncounterImageIndex = (catEncounterImageIndex + 1) % images.length;
    encounterImage.alt = 'Babyla interacting with a cat';
  } else {
    const images = ['dog-1.png', 'dog-2.png'];
    encounterImage.src = ASSET + images[dogEncounterImageIndex];
    dogEncounterImageIndex = (dogEncounterImageIndex + 1) % images.length;
    encounterImage.alt = 'Babyla interacting with a dog';
  }

  encounterCard.classList.add('animal-encounter-mode');
  pauseScreen.classList.add('animal-encounter-screen');
  pauseScreen.classList.remove('hidden');

  state.feedback = 'NEW WALKING COMPANION';
  state.feedbackUntil = performance.now() + 1400;

  clearTimeout(animalEncounterTimer);
  animalEncounterTimer = setTimeout(() => {
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('animal-encounter-screen');
    encounterCard.classList.remove('animal-encounter-mode');
    pauseEmoji.style.display = '';
    pauseTitle.style.display = '';
    pauseMain.style.display = '';
    pauseSub.style.display = '';
    resumeButton.style.display = '';
    state.paused = false;
    state.currentInteraction = null;
  }, 1600);
}

function update(dt) {
  if (!state.running || state.giftPaused) return;

  if (state.dietCokeAnimation) {
    updateDietCokeAnimation(dt);
    updateParticles(dt);
    return;
  }
  if (state.clayAnimation) {
    updateClayAnimation(dt);
    updateParticles(dt);
    return;
  }
  if (state.movieAnimation) {
    updateMovieAnimation(dt);
    updateParticles(dt);
    return;
  }
  if (state.hungryAnimation) {
    updateHungryAnimation(dt);
    updateParticles(dt);
    return;
  }
  if (state.danceAnimation) {
    updateMemorySequence('danceAnimation', danceImgs.length, dt);
    updateParticles(dt);
    return;
  }
  if (state.regulatorAnimation) {
    updateMemorySequence('regulatorAnimation', regulatorImgs.length, dt);
    updateParticles(dt);
    return;
  }

  if (state.paused) return;

  state.time += dt;
  state.distance += state.speed * dt;
  state.worldX += state.speed * dt;
  player.animTime += dt;

  // Faster flying pace, with a controlled ceiling so the player still has time to react.
  state.speed = 200 + Math.min(70, state.time * 0.85);

  // Temporary knockdown after the third obstacle hit.
  if (state.fallenTimer > 0) {
    state.fallenTimer -= dt;
    player.vy += 1750 * dt;
    player.y += player.vy * dt;
    const floorY = ground.y - player.height + 10;
    if (player.y >= floorY) {
      player.y = floorY;
      player.vy = 0;
    }
    if (state.fallenTimer <= 0) {
      // The third hit is the actual end of this run.
      // We let the knockdown animation finish first, then stop the game.
      state.gameOver = true;
      state.running = false;
      state.paused = true;
      player.grounded = true;
      player.animTime = 0;
      showGameOver();
    }
    updateParticles(dt);
    return;
  }

  player.vy += 1500 * dt;
  player.y += player.vy * dt;

  const floorY = ground.y - player.height + 10;
  if (player.y >= floorY) {
    player.y = floorY;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  // Endless, steady pacing. These intervals do NOT grow with time.
  if (state.worldX >= state.nextCollectibleAt) {
    spawnCollectible(W + 280 + Math.random() * 220);
    state.nextCollectibleAt += 390 + Math.random() * 180;
  }
  if (state.worldX >= state.nextObstacleAt) {
    spawnObstacle(W + 340 + Math.random() * 260);
    state.nextObstacleAt += 440 + Math.random() * 180;
  }
  if (state.worldX >= state.nextAnimalAt) {
    spawnAnimal(W + 380 + Math.random() * 420);
    state.nextAnimalAt += 1150 + Math.random() * 850;
  }

  for (const c of collectibles) {
    c.x -= state.speed * dt;
    c.y += Math.sin(state.time * 2 + c.phase) * 4 * dt;
    if (c.active && rectHit(playerRect(), { x: c.x - 22, y: c.y - 22, w: 44, h: 44 })) collect(c);
  }

  for (const o of obstacles) {
    o.x -= state.speed * dt;
    if (o.grounded) {
      o.y = ground.y - o.h / 2;
    } else if (o.trackPlayer) {
      // Dew tracks her altitude from a parallel lane, keeping a clear dodge gap.
      // Slow easing makes him feel like he's following, without locking onto her hitbox.
      const playerCenterY = player.y + player.height / 2;
      // Keep him above her while she's low, and below her when she flies high.
      // Hysteresis prevents the bird from switching lanes repeatedly near mid-screen.
      if (playerCenterY < H * 0.42) o.followOffsetY = 118;
      else if (playerCenterY > H * 0.58) o.followOffsetY = -118;
      const desired = playerCenterY + o.followOffsetY;
      const targetY = Math.max(92 + o.h / 2, Math.min(ground.y - o.h / 2 - 14, desired));
      const follow = Math.min(1, 1.25 * dt);
      o.y += (targetY - o.y) * follow;
    } else if (!['impromptu', 'network'].includes(o.theme)) {
      // The warning signs stay still in the air; other animated characters bob slightly.
      o.y += Math.sin(state.time * 2.2 + o.phase) * 15 * dt;
    }

    const hitBox = o.theme === 'boss'
      ? { x: o.x - o.w * 0.30, y: o.y - o.h * 0.27, w: o.w * 0.60, h: o.h * 0.54 }
      : o.grounded
        ? { x: o.x - o.w * 0.43, y: o.y - o.h * 0.40, w: o.w * 0.86, h: o.h * 0.76 }
        : { x: o.x - o.w * 0.38, y: o.y - o.h * 0.36, w: o.w * 0.76, h: o.h * 0.72 };
    if (o.active && rectHit(playerRect(), hitBox)) hitObstacle(o);
  }

  for (const a of animals) {
    if (a.followed) continue;
    a.x -= state.speed * dt;
    a.y = ground.y - 35;

    // No magnetic pull. Animals are simply encounters on the ground.
    const dx = Math.abs(a.x - player.x);
    if (dx < 60 && player.grounded) petAnimal(a);
  }

  // Companions walk alongside her, sometimes ahead and sometimes behind.
  const followers = animals.filter(a => a.followed);
  followers.forEach((a, i) => {
    const side = a.followSide || (i % 2 ? 1 : -1);
    const target = player.x + side * (a.followOffset || (62 + i * 30));
    a.x += (target - a.x) * Math.min(1, dt * 5.5);
    // Followers stay on the ground while their sprite frames provide the run.
    a.y = ground.y - 35;
  });

  collectibles = collectibles.filter(c => c.active || c.x > -130);
  obstacles = obstacles.filter(o => o.active || o.x > -150);
  animals = animals.filter(a => a.followed || a.x > -150);

  if (state.energy >= 100) {
    state.energy = 0;
    state.obstacleHitsSinceFall = 0;
    state.invulnerableUntil = performance.now() + 1400;
    state.feedback = '100 CHECKPOINT! HITS CLEARED';
    state.feedbackUntil = performance.now() + 2300;
    burst(player.x + 30, player.y + 20, '#ffd76a', 24);
  }
  updateParticles(dt);
}


function updateMemorySequence(stateKey, frameCount, dt) {
  const anim = state[stateKey];
  if (!anim) return;
  anim.elapsed += dt;
  // Clamp frame count and finish on elapsed time, never on image load state.
  anim.frame = Math.min(Math.max(0, frameCount - 1), Math.floor(anim.elapsed / anim.frameDuration));
  if (anim.elapsed >= anim.frameDuration * frameCount + 0.35 && !anim.finished) {
    anim.finished = true;
    const item = state.currentInteraction;
    state[stateKey] = null;
    state.currentInteraction = null;
    state.paused = false;
    if (item) addEnergy(item.energy || 16);
  }
}


function drawMemorySequence(anim, frames, heading, fallbackIcon) {
  if (!anim) return;

  ctx.save();

  const img = frames[Math.min(anim.frame, frames.length - 1)];

  if (img && img.complete && img.naturalWidth > 0) {
    const maxW = Math.min(W - 28, 700);
    const maxH = Math.min(H - 40, 760);
    const scale = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight
    );

    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    // Draw only the transparent animation frame.
    // No dark overlay and no white card.
    ctx.drawImage(
      img,
      (W - dw) / 2,
      (H - dh) / 2,
      dw,
      dh
    );
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#54384b';
    ctx.font = '900 32px system-ui';
    ctx.fillText(heading || fallbackIcon, W / 2, H / 2);
  }

  ctx.restore();
}

function updateDietCokeAnimation(dt) {
  const anim = state.dietCokeAnimation;
  if (!anim) return;

  anim.elapsed += dt;
  const totalDuration = anim.frameDuration * dietCokeImgs.length;

  anim.frame = Math.min(
    dietCokeImgs.length - 1,
    Math.floor(anim.elapsed / anim.frameDuration)
  );
// Can opening / fizz
if (anim.frame >= 1 && !anim.playedOpen) {
  anim.playedOpen = true;
  playCokeEffect(cokeOpenSound);
}

// Drinking
if (anim.frame >= 5 && !anim.playedGulp) {
  anim.playedGulp = true;
  playCokeEffect(cokeGulpSound);
}

// Big burp near the end
if (anim.frame >= dietCokeImgs.length - 2 && !anim.playedBurp) {
  anim.playedBurp = true;
  playCokeEffect(cokeBurpSound);
}
  if (anim.elapsed >= totalDuration && !anim.finished) {
    anim.finished = true;
    const item = state.currentInteraction;

    state.dietCokeAnimation = null;
    state.currentInteraction = null;
    state.paused = false;

    if (item) addEnergy(15);
  }
}


function updateClayAnimation(dt) {
  const anim = state.clayAnimation;
  if (!anim) return;

  if (anim.phase === 'kneading') {
    anim.elapsed += dt;
    anim.frame = Math.min(clayImgs.length - 1, Math.floor(anim.elapsed / anim.frameDuration));
    if (anim.elapsed >= anim.frameDuration * clayImgs.length) {
      anim.phase = 'product';
      anim.revealElapsed = 0;
      clayMusic.pause();
      clayMusic.currentTime = 0;
      clayRevealPlayed = true;
      clayRevealSound.currentTime = 0;
      clayRevealSound.play().catch(() => {});
    }
    return;
  }

  // Hold one finished product on screen for this clay collectible only.
  anim.revealElapsed += dt;
  if (anim.revealElapsed >= 2.8) {
    const item = state.currentInteraction;
    state.clayAnimation = null;
    state.currentInteraction = null;
    state.paused = false;
    stopClayMusic();
    if (item) addEnergy(item.energy || 16);
  }
}

function updateHungryAnimation(dt) {
  const anim = state.hungryAnimation;
  if (!anim) return;
  anim.elapsed += dt;
  anim.frame = Math.min(hungryImgs.length - 1, Math.floor(anim.elapsed / anim.frameDuration));

  // The final burp frame gets a short, deliberately ridiculous sound.
  if (anim.frame === 7 && state.burpPlayedFrame !== anim.frame) {
    state.burpPlayedFrame = anim.frame;
    playFunnyBurp();
  }

  if (anim.elapsed >= anim.frameDuration * hungryImgs.length && !anim.finished) {
    anim.finished = true;
    const item = state.currentInteraction;
    state.hungryAnimation = null;
    state.currentInteraction = null;
    state.paused = false;
    if (item) addEnergy(20);
  }
}

function playFunnyBurp() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!movieAudioContext) movieAudioContext = new AudioCtx();
    if (movieAudioContext.state === 'suspended') movieAudioContext.resume();
    const t = movieAudioContext.currentTime;
    const osc = movieAudioContext.createOscillator();
    const gain = movieAudioContext.createGain();
    const filter = movieAudioContext.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.55);
    osc.frequency.exponentialRampToValueAtTime(82, t + 0.78);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
    gain.gain.setValueAtTime(0.065, t + 0.42);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.82);
    osc.connect(filter); filter.connect(gain); gain.connect(movieAudioContext.destination);
    osc.start(t); osc.stop(t + 0.84);
  } catch (_) { /* Audio is optional; animation still plays without it. */ }
}

function updateMovieAnimation(dt) {
  const anim = state.movieAnimation;
  if (!anim) return;
  anim.elapsed += dt;
  anim.frame = Math.min(movieImgs.length - 1, Math.floor(anim.elapsed / anim.frameDuration));

  // A deliberately ridiculous little snore on the sleeping frames.
  
if (anim.frame >= 4 && state.snorePlayedFrame === -1) {
  state.snorePlayedFrame = anim.frame;
  playFunnySnore();
}

  if (anim.elapsed >= anim.frameDuration * movieImgs.length && !anim.finished) {
    anim.finished = true;
    const item = state.currentInteraction;
    snoreSound.pause();
snoreSound.currentTime = 0;
    state.movieAnimation = null;
    state.currentInteraction = null;
    state.paused = false;
    if (item) addEnergy(20);
  }
}


const snoreSound = new Audio('assets/snore.mp3');
snoreSound.preload = 'auto';
snoreSound.volume = 0.75;

function playFunnySnore() {
  snoreSound.pause();
  snoreSound.currentTime = 0;
  snoreSound.play().catch(console.warn);
}


function showGameOver() {
  // Stop the looping gameplay soundtrack as soon as Babyla dies.
  stopBackgroundMusic();
  bgMusic.currentTime = 0;

  // Keep the birthday message, but show the run's results as easy-to-scan bullets.
  gameOverSub.innerHTML = `
    <p>Happy Birthday, love. You did great!! You have collected so many little pieces of your world. ♥</p>
    <ul class="game-over-stats">
      <li><strong>Memories collected:</strong> ${state.collectedCount}</li>
      <li><strong>Little friends made:</strong> ${state.pets}</li>
      <li><strong>Distance travelled:</strong> ${Math.floor(state.distance)} metres</li>
    </ul>
  `;

  // Play the supplied lose.mp3 when the end screen appears.
  loseSfx.pause();
  loseSfx.currentTime = 0;
  loseSfx.play().catch(error => {
    console.warn('Game-over sound could not play:', error);
  });

  gameOverScreen.classList.remove('hidden');
}

function collect(item) {
  if (!item || !item.active || state.paused || state.giftPaused) return;

  item.active = false;
  state.memories++;
  state.collectedCount++;

  burst(item.x, item.y, item.color || '#d7b7ff', 12);
  state.feedback = 'MEMORY FOUND';
  state.feedbackUntil = performance.now() + 1100;

  // The interaction pauses the game. Energy is awarded only when she
  // finishes the little memory scene and presses KEEP FLYING.
 playMemorySound();
  openInteraction(item);
}

function addEnergy(n) {
  state.energy = Math.min(100, state.energy + n);
  state.feedback = `+${n} MEMORY`;
  state.feedbackUntil = performance.now() + 1100;
}

function playerRect() {
  return { x: player.x - 24, y: player.y + 12, w: 48, h: 78 };
}

function rectHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.8) * 120,
      life: 0.6 + Math.random() * 0.5,
      color
    });
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 140 * dt;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
}

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sx = state.shake ? ((Math.random() - 0.5) * state.shake) : 0;
  const sy = state.shake ? ((Math.random() - 0.5) * state.shake) : 0;
  state.shake = Math.max(0, state.shake - 0.6);
  ctx.save();
  ctx.translate(sx, sy);
  drawSky();
  drawWorld();
  drawHUD();
  drawParticles();
  drawDietCokeAnimation();
  drawMovieAnimation();
  drawClayAnimation();
  drawHungryAnimation();
  drawMemorySequence(state.danceAnimation, danceImgs, 'NO WARNING. JUST DANCE!', '♫');
  drawMemorySequence(state.regulatorAnimation, regulatorImgs, 'REGULATOR CHECK!', '✓');
  ctx.restore();
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#73c4d0');
  g.addColorStop(0.62, '#a9e1df');
  g.addColorStop(1, '#e8d9b5');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,249,229,.88)';
  for (let i = 0; i < 5; i++) {
    const x = ((i * 260 - state.worldX * 0.12) % (W + 260) + W + 260) % (W + 260) - 130;
    const y = 70 + (i % 3) * 70;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 22, y - 8, 24, 0, Math.PI * 2);
    ctx.arc(x + 48, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWorld() {
  const gy = ground.y;

  ctx.fillStyle = '#6e9470';
  ctx.beginPath();
  ctx.moveTo(0, gy - 110);
  for (let x = -40; x < W + 80; x += 170) {
    ctx.lineTo(x + 70, gy - 180);
    ctx.lineTo(x + 170, gy - 105);
  }
  ctx.lineTo(W, gy);
  ctx.lineTo(0, gy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d9bf8b';
  ctx.fillRect(0, gy, W, H - gy);
  ctx.fillStyle = 'rgba(114,91,65,.22)';
  for (let x = -((state.worldX * 0.7) % 90); x < W; x += 90) ctx.fillRect(x, gy + 38, 34, 4);
  ctx.fillStyle = '#6b5d55';
  ctx.fillRect(0, gy - 4, W, 4);

  for (const a of animals) {
    if (!a.followed && a.x > -100 && a.x < W + 100) drawAnimal(a);
  }
  for (const c of collectibles) {
    if (c.active && c.x > -100 && c.x < W + 100) drawCollectible(c);
  }
  for (const o of obstacles) {
    if (o.active && o.x > -120 && o.x < W + 120) drawObstacle(o);
  }
  const followersOnScreen = animals.filter(a => a.followed && a.x > -120 && a.x < W + 120);
  followersOnScreen.forEach((a, i) => drawAnimal(a, true, i));

  drawPlayer();
}

function drawPlayer() {
  let frames;
  let idx;

  if (state.fallenTimer > 0) {
    frames = jumpImgs;
    idx = 7;
  } else if (player.grounded) {
    const running = state.speed > 170;
    frames = running ? runImgs : walkImgs;
    idx = Math.floor(player.animTime * (running ? 11 : 7)) % frames.length;
  } else {
    // Use the user's eight individually cropped transparent jump frames.
    frames = jumpImgs;
    const phase = player.vy < 0
      ? Math.min(3, Math.floor((-player.vy) / 210))
      : Math.min(7, 4 + Math.floor(player.vy / 220));
    idx = Math.max(0, Math.min(frames.length - 1, phase));
  }

  const img = frames[idx];
  if (!img || !img.complete || !img.naturalWidth) return;

  const dw = player.grounded ? 108 : 112;
  const dh = player.grounded ? 128 : 132;
  ctx.drawImage(img, player.x - dw / 2, player.y - 16, dw, dh);
}

// Find the visible pixels inside a sprite. The supplied PNGs contain transparent
// padding, so positioning the full image at ground.y makes the actual feet float.
const animalVisibleBounds = new WeakMap();
function getAnimalVisibleBounds(img) {
  if (animalVisibleBounds.has(img)) return animalVisibleBounds.get(img);
  const w = img.naturalWidth, h = img.naturalHeight;
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(img, 0, 0);
  const pixels = offCtx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  // Ignore faint background-removal fringe pixels; retain antialiased outlines.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] > 48) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bounds = maxX >= minX && maxY >= minY
    ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
    : { x: 0, y: 0, w, h };
  animalVisibleBounds.set(img, bounds);
  return bounds;
}

function drawGroundedAnimalFrame(img, maxW, maxH) {
  if (!img || !img.complete || !img.naturalWidth) return false;
  const b = getAnimalVisibleBounds(img);
  const fit = Math.min(maxW / b.w, maxH / b.h);
  const drawW = b.w * fit;
  const drawH = b.h * fit;
  // Coordinates are relative to the actual ground line. Cropped visible pixels
  // end exactly at y=0, regardless of transparent padding in the source PNG.
  ctx.drawImage(img, b.x, b.y, b.w, b.h, -drawW / 2, -drawH, drawW, drawH);
  return true;
}

function drawAnimal(a, followed = false, followerIndex = 0) {
  const x = a.x;
  const followerScale = followed
    ? Math.max(0.48, 1 - followerIndex * 0.11)
    : 0.78;
  ctx.save();
  // The transform origin is the road surface, not the top of the PNG canvas.
  ctx.translate(x, ground.y);
  ctx.scale(followerScale, followerScale);

  let drewSprite = false;
  if (a.kind === 'dog' && a.spriteKey && dogImgs[a.spriteKey]) {
    const frames = dogImgs[a.spriteKey];
    const frameIndex = Math.floor((state.time * 10.5 + (a.phase || 0)) % frames.length);
    drewSprite = drawGroundedAnimalFrame(frames[frameIndex], 78, 67);
  } else if (a.kind === 'cat' && a.spriteKey && catImgs[a.spriteKey]) {
    const frames = catImgs[a.spriteKey];
    const frameIndex = Math.floor((state.time * 8.5 + (a.phase || 0)) % frames.length);
    drewSprite = drawGroundedAnimalFrame(frames[frameIndex], 80, 67);
  }

  // Keep a simple fallback only if an asset has not loaded yet.
  if (!drewSprite && a.kind === 'cat') {
    ctx.fillStyle = '#635d5c';
    ctx.beginPath(); ctx.ellipse(0, -18, 25, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7c756f';
    ctx.beginPath(); ctx.moveTo(-18, -30); ctx.lineTo(-8, -54); ctx.lineTo(0, -34); ctx.lineTo(12, -54); ctx.lineTo(20, -30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff4d7';
    ctx.beginPath(); ctx.arc(-8, -27, 3, 0, Math.PI * 2); ctx.arc(8, -27, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#302b38';
    ctx.beginPath(); ctx.arc(-8, -27, 1.5, 0, Math.PI * 2); ctx.arc(8, -27, 1.5, 0, Math.PI * 2); ctx.fill();
  } else if (!drewSprite) {
    ctx.fillStyle = '#9b6c4e';
    ctx.beginPath(); ctx.ellipse(0, -20, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b6815b';
    ctx.beginPath(); ctx.arc(0, -38, 19, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#302b38';
    ctx.beginPath(); ctx.arc(-6, -39, 2, 0, Math.PI * 2); ctx.arc(6, -39, 2, 0, Math.PI * 2); ctx.fill();
  }

  if (followed) {
    ctx.fillStyle = '#e96b73';
    ctx.font = '18px system-ui';
    ctx.fillText('♥', -6, -Math.max(75, 76));
  }
  ctx.restore();
}

function drawCollectible(c) {
  const y = c.y + Math.sin(state.time * 3 + c.phase) * 5;
  ctx.save();
  ctx.translate(c.x, y);

  // Universal soft pulse so every collectible has a visible glow, including
  // icon fallbacks. Keep this lightweight and isolated to drawing only.
  const glowPulse = 0.88 + (Math.sin(state.time * 3.0 + c.phase) + 1) * 0.06;
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = c.color || '#ffd66f';
  ctx.shadowColor = c.color || '#ffd66f';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35 * glowPulse, 35 * glowPulse, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (c.theme === 'photo-memory' || c.theme === 'notification-memory') {
    const iconImg = c.theme === 'photo-memory' ? polaroidIcon : notificationIcon;
    const pulse = 0.9 + (Math.sin(state.time * 2.4 + c.phase) + 1) * 0.035;
    ctx.save();
    ctx.globalAlpha = 0.13 * pulse;
    ctx.fillStyle = '#ffd66f'; ctx.shadowColor = '#ffd66f'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.ellipse(0, 0, 34 * pulse, 34 * pulse, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (iconImg.complete && iconImg.naturalWidth) {
      ctx.save(); ctx.shadowColor = 'rgba(255,205,91,.35)'; ctx.shadowBlur = 5;
      ctx.drawImage(iconImg, -34, -34, 68, 68); ctx.restore();
    } else {
      ctx.fillStyle = c.theme === 'photo-memory' ? '#fff4df' : '#dca39a';
      ctx.strokeStyle = '#44312b'; ctx.lineWidth = 2;
      roundRect(-25, -30, 50, 60, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#44312b'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(c.theme === 'photo-memory' ? '▣' : '1', 0, 8);
    }
    ctx.restore();
    return;
  }

  if (c.theme === 'phone') {
    const pulse = 0.82 + (Math.sin(state.time * 2.7 + c.phase) + 1) * 0.07;
    ctx.save();
    ctx.globalAlpha = 0.16 * pulse;
    ctx.fillStyle = '#ffd66f';
    ctx.shadowColor = '#ffd66f';
    ctx.shadowBlur = 17;
    ctx.beginPath(); ctx.ellipse(0, 0, 34 * pulse, 36 * pulse, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (phoneIcon.complete && phoneIcon.naturalWidth) {
      ctx.save();
      ctx.shadowColor = 'rgba(255,205,91,.55)';
      ctx.shadowBlur = 7 + pulse * 4;
      ctx.drawImage(phoneIcon, -27, -34, 54, 68);
      ctx.restore();
    } else {
      ctx.fillStyle = '#e9b5aa'; ctx.strokeStyle = '#302b38'; ctx.lineWidth = 2;
      roundRect(-20, -30, 40, 60, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff1d9'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('♥', 0, 3);
    }
    ctx.restore();
    return;
  }

  if (c.theme === 'movie') {
    // Subtle pulsing golden collectible aura around the projector illustration.
    const pulse = 0.72 + (Math.sin(state.time * 3.1 + c.phase) + 1) * 0.14;
    ctx.save();
    ctx.globalAlpha = 0.23 * pulse;
    ctx.fillStyle = '#ffd66f';
    ctx.shadowColor = '#ffd66f';
    ctx.shadowBlur = 28;
    ctx.beginPath(); ctx.ellipse(0, 0, 47 * pulse, 34 * pulse, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (projectorIcon.complete && projectorIcon.naturalWidth) {
      ctx.save();
      ctx.shadowColor = 'rgba(255,205,91,.8)';
      ctx.shadowBlur = 14 + pulse * 5;
      ctx.drawImage(projectorIcon, -43, -30, 86, 60);
      ctx.restore();
    } else {
      ctx.fillStyle = '#fff8e9'; ctx.strokeStyle = '#e7b54f'; ctx.lineWidth = 3;
      roundRect(-31, -22, 62, 44, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#302b38'; ctx.beginPath(); ctx.arc(13, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd66f'; ctx.beginPath(); ctx.arc(13, 0, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (c.theme === 'diet-coke') {
    // Clean silver can language for the Diet Coke collectible.
    ctx.shadowColor = 'rgba(255,220,120,.85)';
    ctx.shadowBlur = 16;
    const grad = ctx.createLinearGradient(-18, -30, 18, 30);
    grad.addColorStop(0, '#f8f8f8');
    grad.addColorStop(0.45, '#c9c9c9');
    grad.addColorStop(0.7, '#f5f5f5');
    grad.addColorStop(1, '#aaaaaa');
    ctx.fillStyle = grad;
    roundRect(-18, -29, 36, 58, 8); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1.5;
    roundRect(-18, -29, 36, 58, 8); ctx.stroke();

    ctx.fillStyle = '#8d8d8d';
    ctx.beginPath(); ctx.ellipse(0, -25, 13, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ececec';
    ctx.beginPath(); ctx.ellipse(0, -26, 8, 2, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#25252b';
    ctx.font = 'italic 700 7px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Diet', 0, -2);
    ctx.fillStyle = '#c72f38';
    ctx.font = '900 11px Georgia, serif';
    ctx.fillText('Coke', 0, 10);

    ctx.fillStyle = '#777';
    ctx.beginPath(); ctx.ellipse(0, 25, 13, 3.5, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#302b38';
    ctx.font = '900 8px system-ui';
    ctx.fillText('MEMORY', 0, 48);
    ctx.restore();
    return;
  }

  if (c.theme === 'clay') {
    const pulse = 0.9 + (Math.sin(state.time * 3 + c.phase) + 1) * 0.06;
    ctx.save();
    ctx.shadowColor = 'rgba(255,190,145,.8)';
    ctx.shadowBlur = 14;
    if (clayIcon.complete && clayIcon.naturalWidth) {
      ctx.drawImage(clayIcon, -31 * pulse, -31 * pulse, 62 * pulse, 62 * pulse);
    } else {
      ctx.fillStyle = '#f5d8c4';
      ctx.strokeStyle = '#8f6653';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 29 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = '27px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🧸', 0, 1);
    }
    ctx.restore();
    ctx.restore();
    return;
  }

  if (c.theme === 'gas' || c.theme === 'dance') {
    const iconImg = c.theme === 'gas' ? regulatorIcon : danceIcon;
    const pulse = 0.92 + (Math.sin(state.time * 2.8 + c.phase) + 1) * 0.045;
    ctx.save();
    ctx.globalAlpha = 0.2; ctx.fillStyle = c.color; ctx.shadowColor = c.color; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(0, 0, 34 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (iconImg.complete && iconImg.naturalWidth) {
      ctx.save(); ctx.shadowColor = c.color; ctx.shadowBlur = 8;
      const size = c.theme === 'gas' ? 68 : 60;
      ctx.drawImage(iconImg, -size/2, -size/2, size, size); ctx.restore();
    } else {
      ctx.fillStyle = '#fff4df'; ctx.strokeStyle = '#44312b'; ctx.lineWidth = 2;
      roundRect(-25, -27, 50, 54, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#44312b'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(c.theme === 'gas' ? '✓' : '♫', 0, 8);
    }
    ctx.restore();
    return;
  }

  // Default memory collectible.
  ctx.shadowColor = 'rgba(255,255,255,.75)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(255,250,235,.98)';
  ctx.strokeStyle = '#fff8df';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 31, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = c.color;
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#302b38';
  ctx.font = '900 13px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(c.icon, 0, 0);

  ctx.fillStyle = '#302b38';
  ctx.font = '900 9px system-ui';
  ctx.fillText('MEMORY', 0, 47);
  ctx.restore();
}

function drawDietCokeAnimation() {
  const anim = state.dietCokeAnimation;
  if (!anim) return;

  const img = dietCokeImgs[anim.frame];
  if (!img || !img.complete || !img.naturalWidth) return;

  ctx.save();
// Slightly blur the game already drawn on the canvas
ctx.filter = 'blur(4px)';
ctx.drawImage(canvas, 0, 0, W, H);
ctx.filter = 'none';

// Dark translucent overlay
ctx.fillStyle = 'rgba(35,31,38,0.35)';
ctx.fillRect(0, 0, W, H);
  // Dim the world rather than replacing it, so the player can still feel
  // where she was when the little Diet Coke scene started.
  

  const cardW = Math.min(W - 28, 620);
  const cardH = Math.min(H - 120, 690);
  const cardX = (W - cardW) / 2;
  const cardY = Math.max(54, (H - cardH) / 2);

  

  const maxW = cardW - 36;
  const maxH = cardH - 80;
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;

  ctx.drawImage(img, W / 2 - dw / 2, H / 2 - dh / 2, dw, dh);

  ctx.restore();
}


function drawClayAnimation() {
  const anim = state.clayAnimation;
  if (!anim) return;
  ctx.save();
  ctx.fillStyle = 'rgba(35,31,38,.58)';
  ctx.fillRect(0, 0, W, H);

  if (anim.phase === 'kneading') {
    const img = clayImgs[anim.frame];
    if (img && img.complete && img.naturalWidth) {
      const maxW = Math.min(W - 24, 700);
      const maxH = Math.min(H - 40, 760);
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, W / 2 - dw / 2, H / 2 - dh / 2, dw, dh);
    } else {
      ctx.textAlign = 'center'; ctx.fillStyle = '#fff4e8';
      ctx.font = '900 24px system-ui'; ctx.fillText('CLAY TIME', W / 2, H / 2);
    }
  } else {
    // A single-product reveal. Transparent product PNG is shown large and alone,
    // against the finished clay-making frame, then gameplay resumes.
    const bg = clayImgs[clayImgs.length - 1];
    if (bg && bg.complete && bg.naturalWidth) {
      const bw = Math.min(W - 24, 700), bh = Math.min(H - 40, 760);
      const bs = Math.min(bw / bg.naturalWidth, bh / bg.naturalHeight);
      ctx.globalAlpha = 0.45;
      ctx.drawImage(bg, W / 2 - bg.naturalWidth * bs / 2, H / 2 - bg.naturalHeight * bs / 2, bg.naturalWidth * bs, bg.naturalHeight * bs);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(255,248,239,.97)';
    ctx.strokeStyle = '#302b38'; ctx.lineWidth = 3;
    const cardW = Math.min(W - 36, 480), cardH = Math.min(H - 90, 540);
    const cardX = (W - cardW) / 2, cardY = (H - cardH) / 2;
    roundRect(cardX, cardY, cardW, cardH, 24); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#7f4e69';
    ctx.font = '900 17px system-ui';
    ctx.fillText('LOOK WHAT I MADE!', W / 2, cardY + 34);
    const product = clayProductImgs[anim.productIndex];
    if (product && product.complete && product.naturalWidth) {
      const maxW = cardW - 42, maxH = cardH - 88;
      const scale = Math.min(maxW / product.naturalWidth, maxH / product.naturalHeight);
      const dw = product.naturalWidth * scale, dh = product.naturalHeight * scale;
      ctx.drawImage(product, W / 2 - dw / 2, cardY + 48 + (cardH - 62 - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#302b38'; ctx.font = '16px system-ui';
      ctx.fillText('Her little clay creation', W / 2, H / 2);
    }
    ctx.fillStyle = '#625866'; ctx.font = '12px system-ui';
    ctx.fillText('A LITTLE BABYLA CREATION', W / 2, cardY + cardH - 20);
  }
  ctx.restore();
}

function drawHungryAnimation() {
  const anim = state.hungryAnimation;
  if (!anim) return;
  const img = hungryImgs[anim.frame];
  ctx.save();
  ctx.fillStyle = 'rgba(35,31,38,.58)';
  ctx.fillRect(0, 0, W, H);

  const maxW = Math.min(W - 22, 700);
  const maxH = Math.min(H - 36, 760);
  if (img && img.complete && img.naturalWidth) {
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.drawImage(img, W / 2 - dw / 2, H / 2 - dh / 2, dw, dh);
  }
  // +20 Memory appears briefly on the final sleeping frame, then the run resumes.
  if (anim.frame === hungryImgs.length - 1) {
    ctx.textAlign = 'center';
    ctx.font = '900 26px system-ui';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#302b38';
    ctx.fillStyle = '#fff4d7';
    ctx.strokeText('+20 MEMORY', W / 2, H * 0.84);
    ctx.fillText('+20 MEMORY', W / 2, H * 0.84);
  }
  ctx.restore();
}


function drawMovieAnimation() {
  const anim = state.movieAnimation;
  if (!anim) return;

  const img = movieImgs[anim.frame];

  ctx.save();

  if (img && img.complete && img.naturalWidth > 0) {
    const maxW = Math.min(W - 24, 760);
    const maxH = Math.min(H - 40, 820);

    const scale = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight
    );

    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    // Draw only the movie frame.
    // No dark overlay and no white card.
    ctx.drawImage(
      img,
      (W - dw) / 2,
      (H - dh) / 2,
      dw,
      dh
    );
  } else {
    ctx.fillStyle = '#fff4e8';
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MOVIE NIGHT', W / 2, H / 2);
  }

  ctx.restore();
}

function drawObstacle(o) {
  const staticSign = ['impromptu', 'network'].includes(o.theme);
  const y = o.grounded ? ground.y - o.h / 2 : (staticSign ? o.y : o.y + Math.sin(state.time * 2 + o.phase) * 5);

  // Use the supplied artwork whenever a matching sprite exists.
  if (o.spriteKey && obstacleImgs[o.spriteKey] && obstacleImgs[o.spriteKey].length) {
    const frames = obstacleImgs[o.spriteKey];
    const animated = ['laxuman', 'boss', 'bermiok'].includes(o.theme);
    const rate = o.theme === 'bermiok' ? 7 : o.theme === 'boss' ? 9 : 7;
    const idx = animated ? Math.floor(state.time * rate + o.phase) % frames.length : 0;
    const img = frames[idx];
    if (img && img.complete && img.naturalWidth) {
      ctx.save();
      ctx.translate(o.x, y);
      // Jeep is grounded with its wheels at road level; all other sprites are centered in their lane.
      ctx.drawImage(img, -o.w / 2, -o.h / 2, o.w, o.h);
      ctx.restore();
    }
    // Never draw the old generic placeholder behind a custom sprite while it loads.
    return;
  }

  // Fallback for legacy obstacles only; current obstacle rotation uses custom art exclusively.
  ctx.save();
  ctx.translate(o.x, y);
  if (o.grounded) {
    ctx.fillStyle = 'rgba(53,43,52,.98)';
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 4;
    roundRect(-43, -28, 86, 56, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = o.color;
    ctx.fillRect(-35, -20, 70, 7);
    ctx.fillStyle = '#fff4e8';
    ctx.font = '900 21px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.icon, 0, 2);
    ctx.fillStyle = '#fff4e8';
    ctx.font = '900 8px system-ui';
    ctx.fillText('JUMP OVER', 0, 19);
  } else {
    ctx.fillStyle = 'rgba(53,43,52,.96)';
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 4;
    roundRect(-43, -35, 86, 70, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = o.color;
    ctx.beginPath(); ctx.moveTo(-34,-26); ctx.lineTo(-22,-26); ctx.lineTo(-34,-14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(34,26); ctx.lineTo(22,26); ctx.lineTo(34,14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff4e8';
    ctx.font = '900 24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.icon, 0, -4);
    ctx.fillStyle = '#fff4e8';
    ctx.font = '900 8px system-ui';
    ctx.fillText('DANGER', 0, 23);
  }
  ctx.restore();
}

function drawHUD() {
  const pad = 12;
  const h = 78;
  const w = Math.min(W - 24, 720);
  ctx.fillStyle = 'rgba(255,248,233,.93)';
  ctx.strokeStyle = '#302b38';
  ctx.lineWidth = 3;
  roundRect(pad, 12, w, h, 18); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#302b38';
  ctx.font = '900 14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`DIST ${Math.floor(state.distance)}m`, pad + 14, 35);
  ctx.fillText(`TIME ${Math.floor(state.time)}s`, pad + 150, 35);
  ctx.fillText(`MEMORIES ${state.memories}`, pad + 270, 35);
  ctx.fillStyle = '#625866';
  ctx.font = '900 11px system-ui';
  ctx.fillText(`PETS ${state.pets}`, pad + w - 72, 35);

  ctx.fillStyle = '#302b38';
  ctx.font = '900 11px system-ui';
  ctx.fillText('MEMORY', pad + 14, 64);
  const bx = pad + 72;
  // Reserve a small right-hand bay for the three-hit indicator.
  const bw = Math.max(70, w - 174);
  ctx.fillStyle = '#eadfce';
  roundRect(bx, 51, bw, 18, 9); ctx.fill();
  if (state.energy > 0) {
    ctx.fillStyle = '#e86b73';
    roundRect(bx, 51, bw * (state.energy / 100), 18, 9); ctx.fill();
  }
  ctx.fillStyle = '#302b38';
  ctx.font = '900 10px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`${state.energy}/100`, bx + bw + 6, 63);
  ctx.font = '900 9px system-ui';
  ctx.fillStyle = '#625866';
  ctx.fillText('HITS', pad + w - 60, 47);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(pad + w - 54 + i * 15, 61, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = i < state.obstacleHitsSinceFall ? '#e64f58' : '#d8c9bd';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = i < state.obstacleHitsSinceFall ? '#9d2634' : '#b9a99e';
    ctx.stroke();
  }

  if (performance.now() < state.hitFlashUntil) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, (state.hitFlashUntil - performance.now()) / 850);
    ctx.strokeStyle = '#e64f58';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, W - 8, H - 8);
    ctx.fillStyle = '#e64f58';
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`OBSTACLE HIT  •  ${state.obstacleHitsSinceFall}/3`, W / 2, 112);
    ctx.restore();
  }

  if (performance.now() < state.feedbackUntil) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(48,43,56,.9)';
    roundRect(W / 2 - 145, H - 62, 290, 36, 18); ctx.fill();
    ctx.fillStyle = '#fff8e9';
    ctx.font = '900 12px system-ui';
    ctx.fillText(state.feedback, W / 2, H - 39);
  }
  ctx.textAlign = 'left';
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 5, 5);
  }
  ctx.globalAlpha = 1;
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
  last = now;
  try {
    update(dt);
    draw();
  } catch (err) {
    console.error('Game loop error:', err);
    state.feedback = 'KEEP FLYING';
    state.feedbackUntil = performance.now() + 1200;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


// Photo-stack and notification collectibles use the user's supplied media.
let mediaSequence = [], mediaSequenceIndex = 0, mediaSequenceTimer = null, mediaSequenceMode = null, mediaSequenceRewarded = false;
function shuffledCopy(list) { return [...list].sort(() => Math.random() - 0.5); }
let photoSequenceIndex = 0;
function buildShortSequence(theme) {
  const source = theme === 'photo-memory'
    ? polaroidMedia
    : notificationMedia;

  if (!source.length) return [];

  const groups = new Map();

  source.forEach((item, index) => {
    const caption = (item.caption || '').trim();
    const isLooseFile =
      !caption || caption.toLowerCase() === 'random';

    const key = isLooseFile
      ? `individual-${index}`
      : caption.toLowerCase();

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  const sequences = [...groups.values()];
  const chosen = sequences[
    photoSequenceIndex % sequences.length
  ];

  photoSequenceIndex++;

  return chosen;
}

function playMediaMemory(theme) {
  mediaSequenceMode = theme;
  mediaSequence = buildShortSequence(theme);
  mediaSequenceIndex = 0;
  mediaSequenceRewarded = false;
  const overlay = document.getElementById('mediaMemoryOverlay');
  if (!overlay) { finishMediaMemory(); return; }
  overlay.style.display = 'flex';
  document.getElementById('mmNext').style.display = 'none';
document.getElementById('mmSkip').style.display = 'none';
  document.getElementById('mmReward').style.display = 'none';
  document.getElementById('mmKicker').textContent = theme === 'photo-memory' ? 'A little memory' : 'A notification from Babyla';
  document.getElementById('mmHeading').textContent = theme === 'photo-memory' ? 'Our Photos' : 'Babyla sent you something';
  if (!mediaSequence.length) { finishMediaMemory(); return; }
  showMediaMemoryFrame();
}

function showMediaMemoryFrame() {
  clearTimeout(mediaSequenceTimer);

  const stage = document.getElementById('mmStage');
  const item = mediaSequence[mediaSequenceIndex];

  if (!stage || !item) {
    finishMediaMemory();
    return;
  }

  stage.innerHTML = '';

  const nextButton = document.getElementById('mmNext');
  const skipButton = document.getElementById('mmSkip');
  const reward = document.getElementById('mmReward');

  if (reward) reward.style.display = 'none';
  if (nextButton) {
    nextButton.textContent =
      mediaSequenceIndex === mediaSequence.length - 1
        ? 'Finish'
        : 'Next';
  }

  document.getElementById('mmKicker').textContent =
    mediaSequenceMode === 'photo-memory'
      ? 'A little memory'
      : 'A notification from Babyla';

  const card = document.createElement('div');
  card.className =
    mediaSequenceMode === 'photo-memory'
      ? 'mm-polaroid'
      : 'mm-notification';

  const isVideo = item.type === 'video';
  const media = document.createElement(isVideo ? 'video' : 'img');

  media.src = item.src;
  media.style.display = 'block';
  media.style.width = '100%';
  media.style.maxWidth = '100%';
  media.style.maxHeight = '55vh';
  media.style.objectFit = 'contain';
  media.style.backgroundColor = 'transparent';

  if (isVideo) {
    media.muted = false;
    media.defaultMuted = false;
    media.volume = 1;
    media.autoplay = true;
    media.playsInline = true;
    media.controls = true;
    media.preload = 'auto';
    media.loop = false;
    media.setAttribute('playsinline', '');
    media.setAttribute('webkit-playsinline', '');

    media.addEventListener('error', () => {
      console.error('Video failed to load:', item.src);
    });

    media.addEventListener('ended', () => {
      advanceMediaMemory(true);
    }, { once: true });
  } else {
    media.alt = item.caption || 'A memory';
    media.loading = 'eager';
    media.decoding = 'async';

    media.addEventListener('error', () => {
      console.error('Photo failed to load:', item.src);
      media.alt = 'Photo could not be loaded: ' + item.src;
      media.style.minHeight = '100px';
    }, { once: true });
  }

  if (mediaSequenceMode === 'photo-memory') {
    card.appendChild(media);

    const caption = document.createElement('div');
    caption.className = 'mm-caption';
    caption.textContent = item.caption || 'A little moment';
    card.appendChild(caption);
  } else {
    card.appendChild(media);

    const info = document.createElement('div');
    const who = document.createElement('strong');
    who.textContent = 'Babyla';

    const what = document.createElement('span');
    what.textContent =
      (isVideo ? 'sent you a video' : 'sent you a photo') +
      (item.date ? ' · ' + item.date : '');

    info.appendChild(who);
    info.appendChild(what);
    card.appendChild(info);
  }

  stage.appendChild(card);

  if (isVideo) {
    // Try autoplay with sound. If the browser blocks it,
    // the visible video controls let her start it manually.
    const playPromise = media.play();

    if (playPromise) {
      playPromise.catch(error => {
        console.warn(
          'Video autoplay was blocked. Tap Play on the video.',
          error
        );
      });
    }

    // Do not cut videos off after a few seconds.
    // The video advances when playback finishes.
  } else {
    // Keep each photo visible long enough to see it.
    const duration =
      mediaSequenceMode === 'photo-memory' ? 2400 : 2200;

    mediaSequenceTimer = setTimeout(() => {
      advanceMediaMemory(true);
    }, duration);
  }
}

function advanceMediaMemory(autoAdvance = false) {
  clearTimeout(mediaSequenceTimer);
  if (mediaSequenceIndex < mediaSequence.length - 1) {
    mediaSequenceIndex++;
    showMediaMemoryFrame();
  } else {
    finishMediaMemory();
  }
}
function finishMediaMemory() {
  if (mediaSequenceRewarded) return;
  mediaSequenceRewarded = true;
  clearTimeout(mediaSequenceTimer);
  const stage = document.getElementById('mmStage');
  if (stage) stage.innerHTML = '';
  const kicker = document.getElementById('mmKicker');
  const heading = document.getElementById('mmHeading');
  const reward = document.getElementById('mmReward');
  const next = document.getElementById('mmNext');
closeMediaMemory();
addEnergy(20);
}
function closeMediaMemory() {
  clearTimeout(mediaSequenceTimer);
  const overlay = document.getElementById('mediaMemoryOverlay');
  if (overlay) overlay.style.display = 'none';
  state.currentInteraction = null;
  state.paused = false;
}
function bindMediaMemoryControls() {
  const next = document.getElementById('mmNext');
  const skip = document.getElementById('mmSkip');
  const close = document.getElementById('mmClose');
  if (next) next.addEventListener('click', () => {
    if (mediaSequenceRewarded) closeMediaMemory();
    else advanceMediaMemory(false);
  });
  if (skip) skip.addEventListener('click', () => {
    if (mediaSequenceRewarded) closeMediaMemory();
    else advanceMediaMemory(false);
  });
  if (close) close.addEventListener('click', () => finishMediaMemory());
}
bindMediaMemoryControls();