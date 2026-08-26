const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 32;
const COLS = canvas.width / TILE_SIZE; // 25 bloques
const ROWS = canvas.height / TILE_SIZE; // 15 bloques

// Cargar texturas
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

// Matriz del mundo (0 = aire)
const world = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function generateWorld() {
  const groundLevel = 8;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r > groundLevel + 2) world[r][c] = 'piedra';
      else if (r >= groundLevel) world[r][c] = 'tierra';
    }
  }
  // Generar un árbol básico
  world[7][5] = 'tronco';
  world[6][5] = 'tronco';
  world[5][5] = 'hojas';
  world[5][4] = 'hojas';
  world[5][6] = 'hojas';
}

// Posición del jugador
const player = { x: 2 * TILE_SIZE, y: (8 - 1) * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar terreno
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = world[r][c];
      if (tile && images[tile]) {
        ctx.drawImage(images[tile], c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Dibujar jugador
  if (images['jugador']) {
    ctx.drawImage(images['jugador'], player.x, player.y, player.width, player.height);
  }
}

// Interacción con el mouse (destruir bloques)
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const col = Math.floor(mouseX / TILE_SIZE);
  const row = Math.floor(mouseY / TILE_SIZE);

  if (e.button === 0) { // Clic izquierdo: romper bloque
    world[row][col] = null;
    draw();
  }
});

function initGame() {
  generateWorld();
  draw();
}