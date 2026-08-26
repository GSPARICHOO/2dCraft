const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 32;
const COLS = canvas.width / TILE_SIZE;
const ROWS = canvas.height / TILE_SIZE;

// Cargador de imágenes
const images = {};
const textureFiles = [
  'tierra', 'hojas', 'tronco', 'piedra', 'tablas',
  'mesa de crafteo', 'jugador', 'pico', 'espada', 'palo'
];

let loadedCount = 0;
textureFiles.forEach(name => {
  images[name] = new Image();
  images[name].src = `assets/${name}.png`;
  images[name].onload = () => {
    loadedCount++;
    if (loadedCount === textureFiles.length) initGame();
  };
});

// Matriz del mundo
const world = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function generateWorld() {
  const groundLevel = 9;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r > groundLevel + 2) world[r][c] = 'piedra';
      else if (r >= groundLevel) world[r][c] = 'tierra';
    }
  }
  // Árbol de ejemplo
  world[8][6] = 'tronco';
  world[7][6] = 'tronco';
  world[6][6] = 'hojas';
  world[6][5] = 'hojas';
  world[6][7] = 'hojas';
}

// Estado del jugador y físicas
const player = {
  x: 2 * TILE_SIZE,
  y: 0,
  width: TILE_SIZE * 0.8,
  height: TILE_SIZE * 0.9,
  vx: 0,
  vy: 0,
  speed: 3,
  jumpPower: -8,
  grounded: false
};

const gravity = 0.4;
const keys = {};

// Teclado
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Ratón (Romper con Clic Izquierdo, Poner Tierra con Clic Derecho)
canvas.addEventListener('contextmenu', e => e.preventDefault()); // Evitar menú secundario
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const col = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const row = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    if (e.button === 0) world[row][col] = null; // Clic izq -> Romper
    else if (e.button === 2) world[row][col] = 'tierra'; // Clic der -> Poner bloque
  }
});

function update() {
  // Movimiento Horizontal
  if (keys['KeyA'] || keys['ArrowLeft']) player.vx = -player.speed;
  else if (keys['KeyD'] || keys['ArrowRight']) player.vx = player.speed;
  else player.vx = 0;

  // Salto
  if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }

  // Aplicar Gravedad
  player.vy += gravity;

  // Actualizar X y colisión horizontal básica
  player.x += player.vx;

  // Actualizar Y y colisión con el suelo (simple)
  player.y += player.vy;
  const feetRow = Math.floor((player.y + player.height) / TILE_SIZE);
  const colLeft = Math.floor(player.x / TILE_SIZE);
  const colRight = Math.floor((player.x + player.width) / TILE_SIZE);

  if (feetRow < ROWS && (world[feetRow]?.[colLeft] || world[feetRow]?.[colRight])) {
    player.y = (feetRow * TILE_SIZE) - player.height;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Renderizar Terreno
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = world[r][c];
      if (tile && images[tile]) {
        ctx.drawImage(images[tile], c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Renderizar Jugador
  if (images['jugador']) {
    ctx.drawImage(images['jugador'], player.x, player.y, player.width, player.height);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function initGame() {
  generateWorld();
  gameLoop();
}