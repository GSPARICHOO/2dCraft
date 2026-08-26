const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Desactivar filtro lineal en Canvas (Pixel Art nítido)
ctx.imageSmoothingEnabled = false;

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

// Generación de mundo con relieve variable y árboles
function generateWorld() {
  let groundLevel = 8;

  for (let c = 0; c < COLS; c++) {
    // Variación del terreno
    if (c % 4 === 0 && c > 2) {
      groundLevel += Math.floor(Math.random() * 3) - 1;
      groundLevel = Math.max(5, Math.min(ROWS - 4, groundLevel));
    }

    // Capas de tierra y piedra
    for (let r = groundLevel; r < ROWS; r++) {
      if (r > groundLevel + 2) world[r][c] = 'piedra';
      else world[r][c] = 'tierra';
    }

    // Generar árboles ocasionales
    if (c > 3 && c < COLS - 3 && Math.random() < 0.25 && world[groundLevel][c] === 'tierra') {
      const treeHeight = 3;
      for (let i = 1; i <= treeHeight; i++) {
        world[groundLevel - i][c] = 'tronco';
      }
      // Hojas del árbol
      const top = groundLevel - treeHeight;
      world[top - 1][c] = 'hojas';
      world[top][c - 1] = 'hojas';
      world[top][c + 1] = 'hojas';
      world[top - 1][c - 1] = 'hojas';
      world[top - 1][c + 1] = 'hojas';
    }
  }
}

// Jugador y Físicas
const player = {
  x: 2 * TILE_SIZE,
  y: 0,
  width: TILE_SIZE * 0.8,
  height: TILE_SIZE * 0.9,
  vx: 0,
  vy: 0,
  speed: 3,
  jumpPower: -8.5,
  grounded: false
};

const gravity = 0.45;
const keys = {};

// Eventos de Teclado
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Interacción con Ratón
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const col = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const row = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    if (e.button === 0) world[row][col] = null; // Clic Izq: Romper
    else if (e.button === 2) world[row][col] = 'tierra'; // Clic Der: Colocar
  }
});

function update() {
  // Movimiento
  if (keys['KeyA'] || keys['ArrowLeft']) player.vx = -player.speed;
  else if (keys['KeyD'] || keys['ArrowRight']) player.vx = player.speed;
  else player.vx = 0;

  // Salto
  if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }

  player.vy += gravity;

  // Movimiento X
  player.x += player.vx;

  // Movimiento Y y detección simple de suelo
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
  // Garantizar pixelado nítido antes de dibujar cada cuadro
  ctx.imageSmoothingEnabled = false;
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