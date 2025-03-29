import { player } from '../player.js';
import { enemies, spawnEnemy } from '../enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../main.js'; // Import DEBUG_MODE
import { checkCollision } from '../utils.js';

const whipSlashAttack = {
    damage: 80,
    range: 140,
    whipColor: 'purple',
    thickness: 8,
    duration: 10 // We might still use this for the visual effect duration
};

let isWhipSlashActive = false;
let whipSlashTimer = 0;

export function performWhipSlash() {
    if (DEBUG_MODE) console.log('Performing Whip Slash');
    isWhipSlashActive = true;
    whipSlashTimer = whipSlashAttack.duration; // Start the visual timer

    const whipHitbox = getWhipHitbox();
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (checkCollision(whipHitbox, enemy)) {
            enemy.health -= whipSlashAttack.damage;
            if (enemy.health <= 0) {
                const originalMaxHealth = enemy.maxHealth || 100;
                const splitHealth = originalMaxHealth / 4;

                const originalSizeRatio = enemy.sizeRatio || 1;
                const splitSizeRatio = originalSizeRatio * 1.20; // Increase size by 20%

                const originalMoneyWorth = enemy.moneyWorth || 25;
                const splitMoneyWorth = originalMoneyWorth / 4;

                enemies.splice(i, 1);

                // Spawn four new enemies at random locations
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });

                player.killCount++; // Increment kill count
                player.money += originalMoneyWorth; // Award the full money worth for defeating the original enemy
            }
        }
    }
}

// We still need to manage the visual effect
export function handleWhipSlashAttack() {
    if (isWhipSlashActive) {
        whipSlashTimer--;
        if (whipSlashTimer <= 0) {
            isWhipSlashActive = false;
        }
    }
}

function getWhipHitbox() {
    return {
        x: player.x + player.width,
        y: player.y + player.height / 4,
        width: whipSlashAttack.range,
        height: player.height / 2
    };
}

export function drawWhipSlash(ctx) {
    if (isWhipSlashActive) {
        ctx.strokeStyle = whipSlashAttack.whipColor;
        ctx.lineWidth = whipSlashAttack.thickness;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width, player.y + player.height / 2);
        ctx.lineTo(player.x + player.width + whipSlashAttack.range, player.y + player.height / 2);
        ctx.stroke();
    }
}