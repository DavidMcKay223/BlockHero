import { canvas, gameWorldWidth, gameWorldHeight, DEBUG_MODE } from './main.js'; // Import DEBUG_MODE
import * as punch from './AttackStyle/punch.js';
import * as hammer from './AttackStyle/hammer.js';
import { enemies, spawnEnemy } from './enemy.js';
import { checkCollision } from './utils.js';

export const player = {
  x: 50,
  y: 0,
  width: 50,
  height: 50,
  color: 'blue',
  speed: 5,
  isAttacking: false,
  attackTimer: 0,
  attackDuration: 20,
  attackMove: 'punch',
  canThrowHammer: true,
  hammerThrowCooldown: 30,
  hammerThrowTimer: 0,
  selectedLeftClickAttack: 'punch',
  selectedRightClickAttack: 'hammer'
};

export const keys = {}; // Export keys as const
let mouseClick = false;
let e; // To store the mouse event for attack

document.addEventListener('keydown', (event) => { // Add listeners here
  keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

export function handlePlayerInput() {
  let newPlayerX = player.x;
  let newPlayerY = player.y;

  if (keys['w'] || keys['W'] || keys['ArrowUp']) newPlayerY -= player.speed;
  if (keys['s'] || keys['S'] || keys['ArrowDown']) newPlayerY += player.speed;
  if (keys['a'] || keys['A'] || keys['ArrowLeft']) newPlayerX -= player.speed;
  if (keys['d'] || keys['D'] || keys['ArrowRight']) newPlayerX += player.speed;

  if (newPlayerX < 0) newPlayerX = 0;
  if (newPlayerX > gameWorldWidth - player.width) newPlayerX = gameWorldWidth - player.width;
  if (newPlayerY < 0) newPlayerY = 0;
  if (newPlayerY > gameWorldHeight - player.height) newPlayerY = gameWorldHeight - player.height;

  player.x = newPlayerX;
  player.y = newPlayerY;
}

export function initiateAttack(button) {
  if (DEBUG_MODE) console.log('initiateAttack function called - button:', button, 'player.isAttacking:', player.isAttacking, 'player.canThrowHammer:', player.canThrowHammer);
  if (button === 0 && !player.isAttacking) { // Left click
    if (player.selectedLeftClickAttack === 'punch') {
      player.isAttacking = true;
      player.attackTimer = player.attackDuration;
      if (DEBUG_MODE) console.log('Left click attack initiated - player.isAttacking:', player.isAttacking);
    }
    // Add logic for other left-click attacks if needed
  } else if (button === 2 && player.canThrowHammer) { // Right click
    if (player.selectedRightClickAttack === 'hammer') {
      hammer.throwHammers();
      player.canThrowHammer = false;
      player.hammerThrowTimer = player.hammerThrowCooldown;
      if (DEBUG_MODE) console.log('Right click attack initiated - player.canThrowHammer:', player.canThrowHammer);
    }
    // Add logic for other right-click attacks if needed
  }
}

export { mouseClick, e };