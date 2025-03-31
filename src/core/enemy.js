import * as THREE from 'three';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE, scene } from './main.js';
import { checkCollision2D, checkCollision3D } from '../utils/helpers.js'; // Import both collision functions
import { player } from './player.js';

export const enemies = [];
let nextEnemyId = 0;
const baseEnemySize = 0.5;
const enemyTypes = [
    {
        name: 'Basic Block',
        color: 'red',
        baseHealth: 1000,
        speed: 0.01,
        movementPattern: 'random',
        sizeRatio: 1,
        moneyWorth: 25,
        blockType: 'solid_red'
    },
    {
        name: 'Fast Block',
        color: 'orange',
        baseHealth: 750,
        speed: 0.02,
        movementPattern: 'chase',
        sizeRatio: 0.8,
        moneyWorth: 35,
        blockType: 'solid_orange'
    },
    {
        name: 'Tank Block',
        color: 'brown',
        baseHealth: 1500,
        speed: 0.005,
        movementPattern: 'random',
        sizeRatio: 1.2,
        moneyWorth: 50,
        blockType: 'solid_brown'
    },
    {
        name: 'Green Goo',
        color: 'green',
        baseHealth: 900,
        speed: 0.015,
        movementPattern: 'chase',
        sizeRatio: 1,
        moneyWorth: 40,
        blockType: 'gooey_green'
    }
];

export function spawnEnemy(options) {
    let newEnemy;
    let collision = false;
    let attempts = 0;
    const maxAttempts = 100;

    // Determine which enemy type to spawn
    const randomEnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    let health;

    if (player.playerLevel < 5) {
        health = options?.health !== undefined ?
            options.health : Math.round(randomEnemyType.baseHealth * Math.pow(2.5, player.playerLevel));
    } else if (player.playerLevel >= 5 && player.playerLevel < 10) {
        health = options?.health !== undefined ?
            options.health : Math.round(randomEnemyType.baseHealth * Math.pow(5.5, player.playerLevel));
    } else {
        health = options?.health !== undefined ?
            options.health : Math.round(randomEnemyType.baseHealth * Math.pow(10.5, player.playerLevel));
    }

    const sizeRatio = options?.sizeRatio !== undefined ? options.sizeRatio : randomEnemyType.sizeRatio;
    const moneyWorth = options?.moneyWorth !== undefined ? options.moneyWorth : randomEnemyType.moneyWorth;
    const speed = options?.speed !== undefined ? options.speed : randomEnemyType.speed;
    const movementPattern = options?.movementPattern !== undefined ? options.movementPattern : randomEnemyType.movementPattern;
    const blockType = options?.blockType !== undefined ? options.blockType : randomEnemyType.blockType;

    const spawnedEnemySize = baseEnemySize * sizeRatio;
    const enemyId = nextEnemyId++;

    let x, y, z;

    do {
        x = Math.random() * (gameWorldWidth - spawnedEnemySize);
        y = Math.random() * (gameWorldHeight - spawnedEnemySize);
        z = Math.random() * 10 - 5;
        newEnemy = {
            id: enemyId,
            x: x,
            y: y,
            z: z,
            width: spawnedEnemySize,
            height: spawnedEnemySize,
            color: randomEnemyType.color,
            baseColor: randomEnemyType.color,
            health: health,
            maxHealth: health,
            sizeRatio: sizeRatio,
            moneyWorth: moneyWorth,
            speed: speed,
            movementPattern: movementPattern,
            blockType: blockType
        };
        collision = false;
        for (const existingEnemy of enemies) {
            // Use the 2D collision check for spawning
            if (checkCollision2D(newEnemy, existingEnemy)) {
                collision = true;
                break;
            }
        }
        attempts++;
        if (attempts > maxAttempts) {
            console.warn("Could not find a non-overlapping position for the enemy after " + maxAttempts + " attempts.");
            return;
        }
    } while (collision);

    // Create 3D object for the enemy
    let geometry;
    if (blockType.includes('block')) {
        geometry = new THREE.BoxGeometry(spawnedEnemySize, spawnedEnemySize, spawnedEnemySize);
    } else if (blockType.includes('gooey')) {
        geometry = new THREE.SphereGeometry(spawnedEnemySize / 2, 32, 32);
    } else {
        geometry = new THREE.BoxGeometry(spawnedEnemySize, spawnedEnemySize, spawnedEnemySize);
    }
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(randomEnemyType.color) });
    const enemyMesh = new THREE.Mesh(geometry, material);
    enemyMesh.position.set(newEnemy.x + spawnedEnemySize / 2 - gameWorldWidth / 2, newEnemy.y + spawnedEnemySize / 2 - gameWorldHeight / 2, newEnemy.z);
    enemyMesh.name = `enemy-${enemyId}`;
    scene.add(enemyMesh);

    newEnemy.mesh = enemyMesh; // Attach the mesh to the enemy object
    enemies.push(newEnemy);

    if (DEBUG_MODE) {
        console.log("Spawned enemy:", newEnemy);
    }
}

export function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.movementPattern === 'random') {
            // Simple random movement in X and Y
            if (Math.random() < 0.02) {
                enemy.vx = (Math.random() - 0.5) * enemy.speed;
                enemy.vy = (Math.random() - 0.5) * enemy.speed;
            }
            enemy.x += enemy.vx || 0;
            enemy.y += enemy.vy || 0;

            // Keep enemies within the game bounds (for X and Y)
            if (enemy.x < 0) enemy.x = 0;
            if (enemy.y < 0) enemy.y = 0;
            if (enemy.x > gameWorldWidth - enemy.width) enemy.x = gameWorldWidth - enemy.width;
            if (enemy.y > gameWorldHeight - enemy.height) enemy.y = gameWorldHeight - enemy.height;

            // Update enemy.z for random movement
            if (Math.random() < 0.01) {
                enemy.vz = (Math.random() - 0.5) * enemy.speed * 0.5;
            }
            enemy.z += enemy.vz || 0;

        } else if (enemy.movementPattern === 'chase') {
            // Move towards the player in X and Y
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const angle = Math.atan2(dy, dx);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;

            // Chase in Z direction
            const dz = player.z - enemy.z;
            if (Math.abs(dz) > 0.1) {
                enemy.z += Math.sign(dz) * enemy.speed * 0.3;
            }
        }

        // Change color based on health
        const healthPercentage = enemy.health / enemy.maxHealth;
        if (healthPercentage > 0.7) {
            enemy.color = enemy.baseColor;
        } else if (healthPercentage > 0.3) {
            enemy.color = 'yellow';
        } else {
            enemy.color = 'darkred';
        }

        // Check if the enemy is dead
        if (enemy.health <= 0) {
            removeEnemy(enemy); // Remove enemy from the scene and array
            continue;
        }

        // Update 3D object position
        if (enemy.mesh) {
            enemy.mesh.position.set(
                enemy.x + enemy.width / 2 - gameWorldWidth / 2,
                enemy.y + enemy.height / 2 - gameWorldHeight / 2,
                enemy.z
            );
        }
    }
}

// Removed drawEnemies function

export function removeEnemy(enemyToRemove) {
    const index = enemies.indexOf(enemyToRemove);
    if (index > -1) {
        enemies.splice(index, 1);
        const enemyObject = scene.getObjectByName(`enemy-${enemyToRemove.id}`);
        if (enemyObject) {
            scene.remove(enemyObject);
        }
    }
}