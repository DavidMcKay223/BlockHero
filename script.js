const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 2000;
canvas.height = 1500;

const gameWorldWidth = 2000;
const gameWorldHeight = 1500;

const player = {
  x: 50,
  y: canvas.height / 2 - 25,
  width: 50,
  height: 50,
  color: 'blue',
  speed: 5,
  isAttacking: false,
  attackTimer: 0,
  attackDuration: 20,
  attackMove: 'punch'
};

const enemy = {
  x: gameWorldWidth - 100,
  y: gameWorldHeight / 2 - 25,
  width: 50,
  height: 50,
  color: 'red',
  health: 100
};

const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height
};

const keys = {};
let mouseX = 0;
let mouseY = 0;
let mouseClick = false;

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
  mouseClick = true;
  if (!player.isAttacking) {
    player.isAttacking = true;
    player.attackTimer = player.attackDuration;
  }
});

document.addEventListener('mouseup', (e) => {
  mouseClick = false;
});

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function update() {
  let newPlayerX = player.x;
  let newPlayerY = player.y;

  // Movement (WASD and Arrow Keys)
  if (keys['w'] || keys['W'] || keys['ArrowUp']) newPlayerY -= player.speed;
  if (keys['s'] || keys['S'] || keys['ArrowDown']) newPlayerY += player.speed;
  if (keys['a'] || keys['A'] || keys['ArrowLeft']) newPlayerX -= player.speed;
  if (keys['d'] || keys['D'] || keys['ArrowRight']) newPlayerX += player.speed;

  // Keep player within bounds of the game world (check BEFORE applying movement)
  if (newPlayerX < 0) {
    newPlayerX = 0;
  } else if (newPlayerX > gameWorldWidth - player.width) {
    newPlayerX = gameWorldWidth - player.width;
  }

  if (newPlayerY < 0) {
    newPlayerY = 0;
  } else if (newPlayerY > gameWorldHeight - player.height) {
    newPlayerY = gameWorldHeight - player.height;
  }

  player.x = newPlayerX;
  player.y = newPlayerY;

  camera.x = player.x - camera.width / 2;
  camera.y = player.y - camera.height / 2;

  if (camera.x < 0) camera.x = 0;
  if (camera.y < 0) camera.y = 0;
  if (camera.x > gameWorldWidth - camera.width) camera.x = gameWorldWidth - camera.width;
  if (camera.y > gameWorldHeight - camera.height) camera.y = gameWorldHeight - camera.height;

  if (player.isAttacking) {
    player.attackTimer--;

    if (player.attackMove === 'punch') {
      player.color = 'lightgreen';
    }

    if (checkCollision(player, enemy)) {
      if (player.attackMove === 'punch') {
        enemy.health -= 10;
        console.log('Enemy Health:', enemy.health);
      }
    }

    if (player.attackTimer <= 0) {
      player.isAttacking = false;
      player.color = 'blue';
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  ctx.fillStyle = 'lightgray';
  ctx.fillRect(0, 0, gameWorldWidth, gameWorldHeight);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (enemy.health > 0) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    ctx.fillStyle = 'gray';
    ctx.fillRect(enemy.x, enemy.y - 15, enemy.width, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(enemy.x, enemy.y - 15, (enemy.health / 100) * enemy.width, 10);
  } else {
    console.log('Enemy destroyed!');
  }

  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();