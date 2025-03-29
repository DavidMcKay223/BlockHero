import { canvas, gameWorldWidth, gameWorldHeight, DEBUG_MODE } from './main.js';
import * as punch from './AttackStyle/punch.js';
import * as hammer from './AttackStyle/hammer.js';
import * as chainLightning from './AttackStyle/chainLightning.js';
import * as whipSlash from './AttackStyle/whipSlash.js';
import * as novaAttack from './AttackStyle/nova.js'; // Import nova attack
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
  canWhipSlash: true,
  whipSlashCooldown: 20,
  whipSlashTimer: 0,
  canChainLightning: true,
  chainLightningCooldown: 45,
  chainLightningTimer: 0,
  canNovaAttack: true, // New property
  novaAttackCooldown: 60, // Adjust as needed
  novaAttackTimer: 0,
  killCount: 0,
  money: 0,
  selectedLeftClickAttack: 'punch',
  selectedRightClickAttack: 'nova'
};

export const keys = {};
let mouseClick = false;
let e;

document.addEventListener('keydown', (event) => {
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

  // Horizontal wrapping
  if (newPlayerX < 0) {
    player.x = gameWorldWidth - player.width;
  } else if (newPlayerX > gameWorldWidth - player.width) {
    player.x = 0;
  } else {
    player.x = newPlayerX;
  }

  // Vertical wrapping
  if (newPlayerY < 0) {
    player.y = gameWorldHeight - player.height;
  } else if (newPlayerY > gameWorldHeight - player.height) {
    player.y = 0;
  } else {
    player.y = newPlayerY;
  }
}

export function initiateAttack(button) {
    if (DEBUG_MODE) console.log('initiateAttack function called - button:', button, 'player.isAttacking:', player.isAttacking, 'player.canThrowHammer:', player.canThrowHammer, 'player.canWhipSlash:', player.canWhipSlash, 'player.canChainLightning:', player.canChainLightning, 'player.canNovaAttack:', player.canNovaAttack);
    if (button === 0 && !player.isAttacking) { // Left click
        if (player.selectedLeftClickAttack === 'punch') {
        if (DEBUG_MODE) console.log('Before setting isAttacking to true (Punch):', player.isAttacking);
        player.isAttacking = true;
        player.attackMove = 'punch';
        player.attackTimer = player.attackDuration;
        if (DEBUG_MODE) console.log('Left click attack initiated - player.isAttacking:', player.isAttacking, 'Attack Move:', player.attackMove);
        }
        else if (player.selectedLeftClickAttack === 'whipSlash' && player.canWhipSlash) { // Check cooldown
            if (DEBUG_MODE) console.log('Initiating Whip Slash');
            whipSlash.performWhipSlash();
            player.canWhipSlash = false;
            player.whipSlashTimer = player.whipSlashCooldown;
        }
        // Add logic for other left-click attacks if needed
    } else if (button === 2) { // Right click
        if (player.selectedRightClickAttack === 'hammer' && player.canThrowHammer) {
        hammer.throwHammers();
        player.canThrowHammer = false;
        player.hammerThrowTimer = player.hammerThrowCooldown;
        if (DEBUG_MODE) console.log('Right click attack initiated - player.canThrowHammer:', player.canThrowHammer, 'Attack Move:', player.attackMove);
        }
        else if (player.selectedRightClickAttack === 'chainLightning' && player.canChainLightning) {
            if (DEBUG_MODE) console.log('Initiating Chain Lightning');
            chainLightning.performChainLightning();
            player.canChainLightning = false;
            player.chainLightningTimer = player.chainLightningCooldown;
        }
        else if (player.selectedRightClickAttack === 'nova' && player.canNovaAttack) {
            if (DEBUG_MODE) console.log('Initiating Nova Attack');
            novaAttack.performNovaAttack();
            player.canNovaAttack = false;
            player.novaAttackTimer = player.novaAttackCooldown;
        }
        // Add logic for other right-click attacks if needed
    }
}

export function updatePlayerCooldowns() {
    if (!player.canWhipSlash) {
        player.whipSlashTimer--;
        if (player.whipSlashTimer <= 0) {
            player.canWhipSlash = true;
        }
    }
    if (!player.canChainLightning) {
        player.chainLightningTimer--;
        if (player.chainLightningTimer <= 0) {
            player.canChainLightning = true;
        }
    }
    if (!player.canThrowHammer) {
        player.hammerThrowTimer--;
        if (player.hammerThrowTimer <= 0) {
            player.canThrowHammer = true;
        }
    }
    if (!player.canNovaAttack) {
        player.novaAttackTimer--;
        if (player.novaAttackTimer <= 0) {
            player.canNovaAttack = true;
        }
    }
    // Add cooldown handling for other abilities later
}

export { mouseClick, e };