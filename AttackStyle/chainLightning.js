import { player } from '../player.js';
import { enemies, spawnEnemy } from '../enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../main.js'; // Import DEBUG_MODE
import { checkCollision } from '../utils.js';

const chainLightningAttack = {
    baseDamage: 55, // Using baseDamage for clarity
    range: 450,
    bounceRange: 200, // Range for the lightning to bounce to another enemy
    maxBounces: 6, // Base maximum number of enemies the lightning can hit
    lightningColor: 'yellow',
    thickness: 25,
    duration: 15 // Duration of each lightning segment
};

let activeChainLightnings = []; // Array to store multiple active chain lightning beams

export function performChainLightning() {
    if (DEBUG_MODE) console.log('Performing Chain Lightning');
    const numBeams = 1 + Math.floor(player.INT / 50);

    for (let i = 0; i < numBeams; i++) {
        let currentTargets = [];
        let bounceCount = 0;
        let firstTarget = findClosestEnemy(player, chainLightningAttack.range, []); // Find the closest enemy

        if (firstTarget) {
            currentTargets.push(firstTarget);
            applyDamageToTarget(firstTarget, bounceCount, i); // Pass beam index for potential variations
            bounceCount++;

            activeChainLightnings.push({
                currentTargets: currentTargets,
                bounceCount: bounceCount,
                timer: chainLightningAttack.duration,
                beamIndex: i, // Identifier for the beam
                maxTotalBounces: chainLightningAttack.maxBounces + Math.floor(player.INT / 100)
            });
        }
    }
}

export function handleChainLightningAttack() {
    activeChainLightnings = activeChainLightnings.filter(lightning => {
        if (lightning.currentTargets.length > 0) {
            lightning.timer--;

            if (lightning.timer <= 0) {
                if (lightning.bounceCount <= lightning.maxTotalBounces) {
                    const lastTarget = lightning.currentTargets[lightning.currentTargets.length - 1];
                    const nextTarget = findClosestEnemy(lastTarget, chainLightningAttack.bounceRange, lightning.currentTargets);
                    if (nextTarget) {
                        lightning.currentTargets.push(nextTarget);
                        applyDamageToTarget(nextTarget, lightning.bounceCount, lightning.beamIndex);
                        lightning.bounceCount++;
                        lightning.timer = chainLightningAttack.duration;
                        return true; // Continue if bounced
                    } else {
                        return false; // No more targets to bounce to, despawn
                    }
                } else {
                    return false; // Max bounces reached, despawn
                }
            }
            return true; // Continue if timer > 0
        }
        return false; // Should not reach here if logic is correct
    });
}

function applyDamageToTarget(enemy, bounceNumber, beamIndex) {
    if (enemy && enemy.health > 0) {
        const intBonusDamage = player.INT;
        const damageMultiplier = Math.pow(2, bounceNumber); // Damage doubles per jump
        const totalDamage = (chainLightningAttack.baseDamage + intBonusDamage) * damageMultiplier;

        enemy.health -= totalDamage;
        if (enemy.health <= 0) {
            const index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1);
                player.killCount++;
                player.money += enemy.moneyWorth || 25;
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
    ctx.strokeStyle = chainLightningAttack.lightningColor;
    ctx.lineWidth = chainLightningAttack.thickness;

    for (const lightning of activeChainLightnings) {
        if (lightning.currentTargets.length > 0) {
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2); // Start at the player for each beam

            for (let i = 0; i < lightning.currentTargets.length; i++) {
                const target = lightning.currentTargets[i];
                ctx.lineTo(target.x + target.width / 2, target.y + target.height / 2);
            }
            ctx.stroke();
        }
    }
}