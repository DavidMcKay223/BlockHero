import { player } from '../player.js';
import { enemies, spawnEnemy } from '../enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../main.js'; // Import DEBUG_MODE
import { checkCollision } from '../utils.js';

const chainLightningAttack = {
    damage: 55,
    range: 450,
    bounceRange: 200, // Range for the lightning to bounce to another enemy
    maxBounces: 3, // Maximum number of enemies the lightning can hit
    lightningColor: 'yellow',
    thickness: 25,
    duration: 15 // Duration of each lightning segment
};

let isChainLightningActive = false;
let chainLightningTimer = 0;
let currentTargets = []; // Array to store the sequence of hit enemies
let bounceCount = 0;

export function performChainLightning() {
    if (DEBUG_MODE) console.log('Performing Chain Lightning');
    currentTargets = [];
    bounceCount = 0;
    let firstTarget = findClosestEnemy(player); // Find the closest enemy to the player

    if (firstTarget) {
        isChainLightningActive = true;
        chainLightningTimer = chainLightningAttack.duration;
        currentTargets.push(firstTarget);
        applyDamage(firstTarget);
        bounceCount++;
    }
}

// We still need to manage the visual effect and bouncing
export function handleChainLightningAttack() {
    if (isChainLightningActive && currentTargets.length > 0) {
        chainLightningTimer--;

        if (chainLightningTimer <= 0) {
            if (bounceCount < chainLightningAttack.maxBounces) {
                const lastTarget = currentTargets[currentTargets.length - 1];
                const nextTarget = findClosestEnemy(lastTarget, chainLightningAttack.bounceRange, currentTargets);
                if (nextTarget) {
                    currentTargets.push(nextTarget);
                    applyDamage(nextTarget);
                    bounceCount++;
                    chainLightningTimer = chainLightningAttack.duration; // Reset timer for the next bounce
                } else {
                    isChainLightningActive = false;
                }
            } else {
                isChainLightningActive = false;
            }
        }
    } else if (isChainLightningActive) {
        isChainLightningActive = false; // Ensure inactive if no targets
    }
}

function applyDamage(enemy) {
    if (enemy && enemy.health > 0) {
        enemy.health -= chainLightningAttack.damage;
        if (enemy.health <= 0) {
            const index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1);
                // No spawning of new enemies upon chain lightning kill

                player.killCount++; // Increment kill count
                player.money += enemy.moneyWorth || 25; // Add the full money worth of the enemy
            }
        }
    }
}

// Modified to accept an origin (player or previous target) and optional range and ignored targets
function findClosestEnemy(origin, range = chainLightningAttack.range, ignoredTargets = []) {
    let closestEnemy = null;
    let minDistance = Infinity;
    const originCenterX = origin.x + origin.width / 2;
    const originCenterY = origin.y + origin.height / 2;

    for (const enemy of enemies) {
        if (ignoredTargets.includes(enemy)) continue; // Skip already hit targets

        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;
        const distance = Math.sqrt(
            Math.pow(originCenterX - enemyCenterX, 2) +
            Math.pow(originCenterY - enemyCenterY, 2)
        );

        if (distance < minDistance && distance <= range) {
            minDistance = distance;
            closestEnemy = enemy;
        }
    }
    return closestEnemy;
}

export function drawChainLightning(ctx) {
    if (isChainLightningActive && currentTargets.length > 0) {
        ctx.strokeStyle = chainLightningAttack.lightningColor;
        ctx.lineWidth = chainLightningAttack.thickness;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2); // Start at the player

        for (let i = 0; i < currentTargets.length; i++) {
            const target = currentTargets[i];
            ctx.lineTo(target.x + target.width / 2, target.y + target.height / 2);
        }
        ctx.stroke();
    }
}