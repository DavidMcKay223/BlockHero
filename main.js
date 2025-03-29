import { update, draw } from './game.js';
import { player, initiateAttack } from './player.js'; // Removed keys, mouseClick, e import
import { spawnEnemy } from './enemy.js';

export const DEBUG_MODE = false; // Export DEBUG_MODE
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

export const gameWorldWidth = 2000;
export const gameWorldHeight = 2000;

export { canvas, ctx };

canvas.width = gameWorldWidth;
canvas.height = gameWorldHeight;

player.y = canvas.height / 2 - 25; // Initialize player.y after canvas

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

canvas.addEventListener('mousedown', (event) => {
  // mouseClick and e are now managed in player.js if needed there
  if (DEBUG_MODE) console.log('mousedown event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
  initiateAttack(event.button);
  event.preventDefault();
});

canvas.addEventListener('mouseup', (event) => {
  // mouseClick is now managed in player.js if needed there
  if (DEBUG_MODE) console.log('mouseup event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

function init() {
  spawnEnemy();
}

function gameLoop() {
  update();
  draw(ctx);
  requestAnimationFrame(gameLoop);
}

window.onload = init;
gameLoop();