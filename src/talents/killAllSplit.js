import * as enemy from '../core/enemy.js';
import { DEBUG_MODE } from '../core/main.js';

const killAllCooldownDuration = 60 * 60; // 1 minute * 60 ticks per second
let canUseKillAll = true;
let killAllCooldownTimer = 0;

export function activateKillAllSplit() {
    if (canUseKillAll) {
        if (DEBUG_MODE) console.log('Kill All and Split activated!');
        const originalEnemyCount = enemy.enemies.length;
        const originalEnemiesData = [...enemy.enemies]; // Create a copy to iterate over

        // Clear all existing enemies
        enemy.enemies.length = 0;

        // Spawn 10 new enemies for each original enemy
        originalEnemiesData.forEach(originalEnemy => {
            for (let i = 0; i < 10; i++) {
                enemy.spawnEnemy({
                    health: originalEnemy.health, // You might want to adjust this
                    speed: originalEnemy.speed,
                    movementPattern: originalEnemy.movementPattern,
                    moneyWorth: (originalEnemy.moneyWorth || 25) * 10,
                    sizeRatio: (originalEnemy.sizeRatio || 1) * 1.5 // Increase size by 50%
                });
            }
        });

        // Start the cooldown
        canUseKillAll = false;
        killAllCooldownTimer = killAllCooldownDuration;
    } else if (DEBUG_MODE) {
        console.log(`Kill All is on cooldown. Remaining: ${Math.ceil(killAllCooldownTimer / 60)} seconds`);
    }
}

export function updateKillAllSplitCooldown() {
    if (!canUseKillAll) {
        killAllCooldownTimer--;
        if (killAllCooldownTimer <= 0) {
            canUseKillAll = true;
            if (DEBUG_MODE) console.log('Kill All cooldown finished.');
        }
    }
}
