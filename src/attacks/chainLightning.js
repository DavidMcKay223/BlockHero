import * as THREE from '../../node_modules/three/build/three.module.js';
import { player } from '../core/player.js';
import { enemies, spawnEnemy } from '../core/enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../core/main.js';
import { checkCollision } from '../utils/helpers.js';
import { dpsMeter } from '../core/game.js';

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
        let totalDamage = (chainLightningAttack.baseDamage + intBonusDamage) * damageMultiplier;
        let damageRollMultiplier = 1;

        // Determine the multiplier range based on player's INT
        if (player.INT >= 1000) {
            damageRollMultiplier = Math.floor(Math.random() * 10) + 1; // 1 to 10
        } else if (player.INT >= 500) {
            damageRollMultiplier = Math.floor(Math.random() * 7) + 1; // 1 to 7
        } else if (player.INT >= 100) {
            damageRollMultiplier = Math.floor(Math.random() * 3) + 1; // 1 to 3
        } else {
            // For INT less than 100, no extra multiplier (stays at 1)
        }

        totalDamage *= damageRollMultiplier;

        enemy.health -= totalDamage;
        dpsMeter.recordDamage(totalDamage);
        if (enemy.health <= 0) {
            const index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1);
                player.killCount++;
                player.money += enemy.moneyWorth || 25;
            }
        }

        if (DEBUG_MODE && damageRollMultiplier > 1) {
            console.log(`Chain Lightning (Beam ${beamIndex + 1}, Bounce ${bounceNumber + 1}) hit enemy with damage: ${totalDamage} (Base: ${chainLightningAttack.baseDamage + intBonusDamage}, Multiplier: ${damageMultiplier}, INT Bonus Roll: ${damageRollMultiplier}x)`);
        } else if (DEBUG_MODE) {
            console.log(`Chain Lightning (Beam ${beamIndex + 1}, Bounce ${bounceNumber + 1}) hit enemy with damage: ${totalDamage} (Base: ${chainLightningAttack.baseDamage + intBonusDamage}, Multiplier: ${damageMultiplier})`);
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

export function updateChainLightningInScene(scene) {
    activeChainLightnings.forEach(lightning => {
        if (lightning.currentTargets.length > 0) {
            const startPoint = new THREE.Vector3(player.x + player.width / 2, player.y + player.height / 2, player.z);

            for (let i = 0; i < lightning.currentTargets.length; i++) {
                const target = lightning.currentTargets[i];
                const endPoint = new THREE.Vector3(
                    target.x + target.width / 2,
                    target.y + target.height / 2,
                    target.z
                );
                const lightningName = `chainLightning-${lightning.beamIndex}-${i}`;
                let lightningObject = scene.getObjectByName(lightningName);

                if (!lightningObject) {
                    const points = [startPoint.clone(), endPoint.clone()];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Yellow color
                    lightningObject = new THREE.Line(geometry, material);
                    lightningObject.name = lightningName;
                    scene.add(lightningObject);
                } else {
                    const points = [startPoint.clone(), endPoint.clone()];
                    lightningObject.geometry.setFromPoints(points);
                    lightningObject.geometry.needsUpdate = true;
                }
                startPoint.copy(endPoint); // Next segment starts where the previous one ended
            }
        }
    });
}
