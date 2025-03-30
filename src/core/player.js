import { gameWorldWidth, gameWorldHeight, DEBUG_MODE, playerMesh } from './main.js'; // Import playerMesh
import * as punch from '../attacks/punch.js';
import * as hammer from '../attacks/hammer.js';
import * as chainLightning from '../attacks/chainLightning.js';
import * as whipSlash from '../attacks/whipSlash.js';
import * as novaAttack from '../attacks/nova.js';
import { renderer } from './renderer.js'; // Import the renderer

export const player = {
    x: 0, // Initial X position at origin (will be synced with playerMesh)
    y: 0, // Initial Y position at origin (will be synced with playerMesh)
    z: 0, // Initial Z position (will be synced with playerMesh)
    width: 0.5, // Adjust width for 3D world units
    height: 0.5, // Adjust height for 3D world units
    color: 'blue',
    speed: 0.05, // Adjust speed for 3D world units
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
    canArcaneExplosion: true,
    arcaneExplosionCooldown: 75, // Adjust as needed (in game ticks)
    arcaneExplosionTimer: 0,
    killCount: 0,
    money: 0,
    selectedLeftClickAttack: 'punch',
    selectedRightClickAttack: 'chainLightning',
    selectedNumber2Talent: 'arcaneExplosion', // Set it as the default for slot 2
    arcaneExplosionOrbs: [], // Array to hold active orbs
    // New stats
    STR: 10, // Strength
    DEX: 10, // Dexterity
    INT: 10,  // Intelligence
    playerLevel: 1, // Initial player level
    killsForNextLevel: 50, // Kills needed to reach the next level (level 2)
    inventory: [], // Array to hold owned items
    equipped: { // Object to hold equipped gear
        helmet: null,
        chest: null,
        weapon: null,
        boots: null,
        ring: null,
        amulet: null
    }
};

export const keys = {};
let mouseClick = false;
let e;

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === '2' && player.selectedNumber2Talent === 'arcaneExplosion' && player.canArcaneExplosion) {
        import('../talents/arcaneExplosion.js').then(module => {
            module.performArcaneExplosion(player.x, player.y, player.z); // Pass player's logical position
            player.canArcaneExplosion = false;
            player.arcaneExplosionTimer = player.arcaneExplosionCooldown;
            if (DEBUG_MODE) console.log("Arcane Explosion initiated!");
        });
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

export function handlePlayerInput() {
    if (!playerMesh) return; // Ensure playerMesh exists

    let moveX = 0;
    let moveY = 0;
    let moveZ = 0;

    if (keys['w'] || keys['W'] || keys['ArrowUp']) moveY += player.speed; // Forward/Up (in typical 3D world Y)
    if (keys['s'] || keys['S'] || keys['ArrowDown']) moveY -= player.speed; // Backward/Down
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) moveX -= player.speed; // Left
    if (keys['d'] || keys['D'] || keys['ArrowRight']) moveX += player.speed; // Right
    if (keys[' '] || keys['Spacebar']) moveZ += player.speed; // Up (in typical 3D world Z)
    if (keys['Shift']) moveZ -= player.speed; // Down

    playerMesh.position.x += moveX;
    playerMesh.position.y += moveY;
    playerMesh.position.z += moveZ;

    // Keep the player's logical x, y, z updated with the mesh's position
    player.x = playerMesh.position.x;
    player.y = playerMesh.position.y;
    player.z = playerMesh.position.z;
}

// Add event listener for mouse clicks on the renderer's canvas
renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left click
        initiateAttack(0);
    } else if (event.button === 2) { // Right click
        initiateAttack(2);
    }
});

// Prevent default right-click context menu
renderer.domElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

export function initiateAttack(button) {
    if (DEBUG_MODE) console.log('initiateAttack function called - button:', button, 'player.isAttacking:', player.isAttacking, 'player.canThrowHammer:', player.canThrowHammer, 'player.canWhipSlash:', player.canWhipSlash, 'player.canChainLightning:', player.canChainLightning, 'player.canNovaAttack:', player.canNovaAttack);
    if (button === 0 && !player.isAttacking) { // Left click
        if (player.selectedLeftClickAttack === 'punch') {
            if (DEBUG_MODE) console.log('Before setting isAttacking to true (Punch):', player.isAttacking);
            player.isAttacking = true;
            player.attackMove = 'punch';
            player.attackTimer = player.attackDuration;
            punch.handlePunchAttack(player.x, player.y, player.z); // Pass player's 3D position
            if (DEBUG_MODE) console.log('Left click attack initiated - player.isAttacking:', player.isAttacking, 'Attack Move:', player.attackMove);
        } else if (player.selectedLeftClickAttack === 'whipSlash' && player.canWhipSlash) { // Check cooldown
            if (DEBUG_MODE) console.log('Initiating Whip Slash');
            whipSlash.performWhipSlash(player.x, player.y, player.z); // Pass player's 3D position
            player.canWhipSlash = false;
            player.whipSlashTimer = player.whipSlashCooldown;
        }
        // Add logic for other left-click attacks if needed
    } else if (button === 2) { // Right click
        if (player.selectedRightClickAttack === 'hammer' && player.canThrowHammer) {
            hammer.throwHammers(player.x, player.y, player.z); // Pass player's 3D position
            player.canThrowHammer = false;
            player.hammerThrowTimer = player.hammerThrowCooldown;
            if (DEBUG_MODE) console.log('Right click attack initiated - player.canThrowHammer:', player.canThrowHammer, 'Attack Move:', player.attackMove);
        } else if (player.selectedRightClickAttack === 'chainLightning' && player.canChainLightning) {
            if (DEBUG_MODE) console.log('Initiating Chain Lightning');
            chainLightning.performChainLightning(player.x, player.y, player.z); // Pass player's 3D position
            player.canChainLightning = false;
            player.chainLightningTimer = player.chainLightningCooldown;
        } else if (player.selectedRightClickAttack === 'nova' && player.canNovaAttack) {
            if (DEBUG_MODE) console.log('Initiating Nova Attack');
            novaAttack.performNovaAttack(player.x, player.y, player.z); // Pass player's 3D position
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
    if (!player.canArcaneExplosion) {
        player.arcaneExplosionTimer--;
        if (player.arcaneExplosionTimer <= 0) {
            player.canArcaneExplosion = true;
        }
    }
    // Add cooldown handling for other abilities later
}

export { mouseClick, e };
