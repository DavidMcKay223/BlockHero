import * as THREE from 'three';

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
import { startRendering } from './renderer.js'; // Import startRendering
import { camera, updateCamera, updateCameraAspect, initControls } from './camera.js'; // Import initControls

export const DEBUG_MODE = true;

export const gameWorldWidth = 50;
export const gameWorldHeight = 30;

player.x = 0;
player.y = 0;

let mouseX = 0;
let mouseY = 0;

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
        performArcaneExplosion(player.x + player.width / 2, player.y + player.height / 2, null);
    } else if (event.key === '3') {
        activateStatBoost();
    } else if (event.key === '4') {
        activateKillAllSplit();
    }
});

const initialEnemyCount = 5;
const respawnEnemyCount = 5;

export let playerMesh;

function init() {
    updateStatDisplay();
    startRendering(); // Initialize and start the Three.js renderer
    initControls();   // Initialize OrbitControls after the renderer is set up

    // Create a 3D cube for the player
    const playerGeometry = new THREE.BoxGeometry(player.width, player.height, 0.5);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    playerMesh.name = 'player';

    playerMesh.position.set(player.x, player.y, 0);

    scene.add(playerMesh);
}

async function gameLoop() {
    handlePlayerInput(); // Update player movement
    updateCamera(); // Update the camera to follow the player

    update(); // Update game logic
    updateEnemies(); // Update enemies' positions

    if (player.arcaneExplosionOrbs && player.arcaneExplosionOrbs.length > 0) {
        const arcaneExplosionModule = await import('../talents/arcaneExplosion.js');
        await arcaneExplosionModule.updateArcaneExplosions(player.arcaneExplosionOrbs);
    }

    if (player.killCount >= player.killsForNextLevel) {
        player.playerLevel++;
        player.killsForNextLevel *= 2;
        console.log(`Player leveled up! Now level ${player.playerLevel}`);
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

    requestAnimationFrame(gameLoop); // Ensure the game loop continues
}

export const righteousFireInstance = new RighteousFire(player);

window.onload = init;
gameLoop();

window.addEventListener('resize', () => {
    updateCameraAspect();
});

export { scene, camera };
