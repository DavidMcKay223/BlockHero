import * as THREE from '../../node_modules/three/build/three.module.js';

import { update, draw } from './game.js';
import { player, handlePlayerInput, updatePlayerCooldowns, initiateAttack } from './player.js';
import { spawnEnemy, enemies, updateEnemies } from './enemy.js'; // Removed drawEnemies import
import RighteousFire from '../talents/righteousFire.js';
import { updateArcaneExplosions, performArcaneExplosion } from '../talents/arcaneExplosion.js';
import { toggleMenu } from '../components/menu.js';
import { toggleInventory } from '../components/inventory.js';
import { toggleShop } from '../components/shop.js';
import { updateStatDisplay } from '../components/stats.js';
import { activateStatBoost, updateStatBoost } from '../talents/statBoost.js';
import { activateKillAllSplit, updateKillAllSplitCooldown } from '../talents/killAllSplit.js';

// Import your Three.js modules
import { scene } from './scene.js';
import { renderer, startRendering } from './renderer.js';
import { camera, updateCamera, updateCameraAspect } from './camera.js';

export const DEBUG_MODE = false;
// const canvas = document.getElementById('gameCanvas'); // Removed 2D canvas reference
// const ctx = canvas.getContext('2d'); // Removed 2D context reference

// Game World Dimensions (These might need to be in world units now)
export const gameWorldWidth = 50;
export const gameWorldHeight = 30;

// Initial player position in the 3D world (centered)
player.x = 0;
player.y = 0;
// playerMesh.position.set(player.x, player.y, player.z); // Removed this line, as playerMesh is not yet defined here

let mouseX = 0;
let mouseY = 0;

// Removed event listeners related to the 2D canvas

document.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        toggleMenu();
    } else if (event.key === 'b' || event.key === 'B') {
        toggleShop();
    } else if (event.key === 'i' || event.key === 'I') {
        toggleInventory();
    } else if (event.key === '1') {
        if (righteousFireInstance.isActive) {
            righteousFireInstance.deactivate();
        } else {
            righteousFireInstance.activate();
        }
    } else if (event.key === '2') {
        performArcaneExplosion(player.x + player.width / 2, player.y + player.height / 2, null); // Removed canvas reference
    } else if (event.key === '3') {
        activateStatBoost();
    } else if (event.key === '4') {
        activateKillAllSplit();
    }
});

const initialEnemyCount = 5;
const respawnEnemyCount = 5;

// Export playerMesh so it can be accessed in game.js
export let playerMesh;

function init() {
    updateStatDisplay();
    startRendering(); // Initialize and start the Three.js renderer

    // Create a 3D cube for the player
    const playerGeometry = new THREE.BoxGeometry(player.width, player.height, 0.5); // Adjusted Z-dimension to 0.5 to match width/height
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color (0x0000ff)
    playerMesh = new THREE.Mesh(playerGeometry, playerMaterial); // Assign to the exported variable
    playerMesh.name = 'player'; // Set the name to 'player'

    // Set initial position based on your 2D player's starting position
    playerMesh.position.set(player.x, player.y, 0); // Adjust z as needed

    scene.add(playerMesh); // Add the player cube to the scene
}

async function gameLoop() {
    update(); // Your existing update logic

    updateEnemies();

    if (player.arcaneExplosionOrbs && player.arcaneExplosionOrbs.length > 0) {
        const arcaneExplosionModule = await import('../talents/arcaneExplosion.js');
        await arcaneExplosionModule.updateArcaneExplosions(player.arcaneExplosionOrbs);
    }

    // Removed draw(ctx) call
    // Removed drawEnemies(ctx) call

    if (player.killCount >= player.killsForNextLevel) {
        player.playerLevel++;
        player.killsForNextLevel *= 2;
        console.log(`Player leveled up! Now level ${player.playerLevel}`);
        // Shop inventory will be regenerated when the shop is opened
    }

    if (enemies.length === 0) {
        if (DEBUG_MODE) console.log('No enemies left, spawning more...');
        for (let i = 0; i < respawnEnemyCount * player.playerLevel; i++) {
            if (player.playerLevel > 2 && Math.random() < 0.4) {
                spawnEnemy({ health: 120, speed: 1.8, movementPattern: 'chase' });
            } else if (player.playerLevel > 4 && Math.random() < 0.25) {
                spawnEnemy({ health: 180, sizeRatio: 1.1, moneyWorth: 60 });
            } else {
                spawnEnemy();
            }
        }
    }

    updateStatDisplay();
    updatePlayerCooldowns();
    updateStatBoost();
    updateKillAllSplitCooldown();

    updateCamera(); // Update the 3D camera position
    renderer.render(scene, camera); // Render the 3D scene
    requestAnimationFrame(gameLoop);
}

export const righteousFireInstance = new RighteousFire(player);

window.onload = init;
gameLoop();

// Handle window resize for the Three.js renderer and camera
window.addEventListener('resize', () => {
    updateCameraAspect(); // Update the camera's aspect ratio
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    renderer.setSize(newWidth, newHeight);
});

export { scene, camera, renderer }; // Export these if other modules need direct access
