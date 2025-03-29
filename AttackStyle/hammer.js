import { player } from '../player.js';
import { enemies, spawnEnemy } from '../enemy.js';
import { gameWorldWidth, gameWorldHeight } from '../main.js';
import { checkCollision } from '../utils.js';

const hammerSize = 10;
const hammerColor = 'brown';
const hammerSpeed = 10;
const baseHammerDamage = 15; // Using baseHammerDamage for clarity

const hammers = [];

export function throwHammers() {
    const numberOfHammers = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numberOfHammers; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const velocityX = Math.cos(angle) * hammerSpeed;
        const velocityY = Math.sin(angle) * hammerSpeed;

        hammers.push({
            x: player.x + player.width / 2 - hammerSize / 2,
            y: player.y + player.height / 2 - hammerSize / 2,
            width: hammerSize,
            height: hammerSize,
            color: hammerColor,
            velocityX: velocityX,
            velocityY: velocityY,
            lifetime: 100
        });
    }
}

export function updateHammers() {
    if (!player.canThrowHammer) {
        player.hammerThrowTimer--;
        if (player.hammerThrowTimer <= 0) {
            player.canThrowHammer = true;
        }
    }

    for (let i = hammers.length - 1; i >= 0; i--) {
        const hammer = hammers[i];
        hammer.x += hammer.velocityX;
        hammer.y += hammer.velocityY;
        hammer.lifetime--;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(hammer, enemy)) {
                const damage = baseHammerDamage + player.STR; // Damage scales with STR
                enemy.health -= damage;
                hammers.splice(i, 1);
                if (enemy.health <= 0) {
                    const moneyWorth = enemy.moneyWorth || 25; // Get the enemy's money worth
                    enemies.splice(j, 1);
                    // No spawning of a new enemy - the enemy is shattered!
                    player.killCount++; // Increment kill count
                    player.money += moneyWorth; // Add the money worth of the defeated enemy
                }
                break;
            }
        }

        if (hammer.lifetime <= 0 ||
            hammer.x < -hammerSize ||
            hammer.x > gameWorldWidth ||
            hammer.y < -hammerSize ||
            hammer.y > gameWorldHeight) {
            hammers.splice(i, 1);
        }
    }
}

export function drawHammers(ctx) {
    for (const hammer of hammers) {
        ctx.fillStyle = hammer.color;
        ctx.fillRect(hammer.x, hammer.y, hammer.width, hammer.height);
    }
}