import { update, draw } from './game.js';
import { player, initiateAttack } from './player.js';
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

const attackMenu = document.getElementById('attackMenu');
const leftClickAttackSelect = document.getElementById('leftClickAttack');
const rightClickAttackSelect = document.getElementById('rightClickAttack');
const closeMenuButton = document.getElementById('closeMenuButton');

let menuOpen = false;

// Function to toggle the menu visibility
function toggleMenu() {
  menuOpen = !menuOpen;
  attackMenu.style.display = menuOpen ? 'flex' : 'none';

  // When opening the menu, set the dropdowns to the current player selections
  if (menuOpen) {
    leftClickAttackSelect.value = player.selectedLeftClickAttack;
    rightClickAttackSelect.value = player.selectedRightClickAttack;
  }
}

// Event listener to toggle the menu (e.g., on 'M' key press)
document.addEventListener('keydown', (event) => {
  if (event.key === 'm' || event.key === 'M') {
    toggleMenu();
  }
});

// Event listener for left click attack selection
leftClickAttackSelect.addEventListener('change', (event) => {
  player.selectedLeftClickAttack = event.target.value;
  if (DEBUG_MODE) console.log('Left click attack selected:', player.selectedLeftClickAttack);
});

// Event listener for right click attack selection
rightClickAttackSelect.addEventListener('change', (event) => {
  player.selectedRightClickAttack = event.target.value;
  if (DEBUG_MODE) console.log('Right click attack selected:', player.selectedRightClickAttack);
});

// Event listener for the close button
closeMenuButton.addEventListener('click', () => {
  toggleMenu();
});

const initialEnemyCount = 5; // You can change this number to spawn more or fewer enemies

function init() {
  for (let i = 0; i < initialEnemyCount; i++) {
    spawnEnemy();
  }
}

function gameLoop() {
  update();
  draw(ctx);
  requestAnimationFrame(gameLoop);
}

window.onload = init;
gameLoop();