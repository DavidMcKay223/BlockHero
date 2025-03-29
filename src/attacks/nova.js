import { player } from '../core/player.js';
import { enemies, spawnEnemy } from '../core/enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../core/main.js';
import { checkCollision } from '../utils/helpers.js';
import { dpsMeter } from '../core/game.js';

const novaAttack = {
    baseDamage: 20, // Using baseDamage for clarity
    range: 150,
    projectileSpeed: 15,
    projectileColor: 'orange',
    projectileRadius: 10,
    numProjectiles: 16, // Base number of projectiles
    duration: 30 // Duration of the projectiles in frames
};

let isNovaActive = false;
let novaTimer = 0;
const novaProjectiles = [];

export function performNovaAttack() {
    if (DEBUG_MODE) console.log('Performing Nova Attack');
    if (!isNovaActive) {
        isNovaActive = true;
        novaTimer = novaAttack.duration;
        novaProjectiles.length = 0; // Clear any existing projectiles

        const extraProjectiles = Math.floor(player.INT / 50);
        const totalProjectiles = novaAttack.numProjectiles + extraProjectiles;
        const angleIncrement = (2 * Math.PI) / totalProjectiles;

        for (let i = 0; i < totalProjectiles; i++) {
            const angle = i * angleIncrement;
            const projectile = {
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                vx: Math.cos(angle) * novaAttack.projectileSpeed,
                vy: Math.sin(angle) * novaAttack.projectileSpeed,
                radius: novaAttack.projectileRadius
            };
            novaProjectiles.push(projectile);
        }
    }
}

export function handleNovaAttack() {
    if (isNovaActive) {
        novaTimer--;
        for (let i = novaProjectiles.length - 1; i >= 0; i--) {
            const projectile = novaProjectiles[i];
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;

            // Collision detection with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dx = projectile.x - (enemy.x + enemy.width / 2);
                const dy = projectile.y - (enemy.y + enemy.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const combinedRadius = projectile.radius + Math.max(enemy.width, enemy.height) / 2; // Approximate enemy radius

                if (distance < combinedRadius) {
                    const damage = novaAttack.baseDamage + player.INT; // Damage scales with INT
                    enemy.health -= damage;
                    dpsMeter.recordDamage(damage);
                    if (enemy.health <= 0) {
                        const moneyWorth = enemy.moneyWorth || 25;
                        enemies.splice(j, 1);
                        // No spawning of a new enemy - the enemy is shattered!
                        player.killCount++;
                        player.money += moneyWorth;
                    }
                    novaProjectiles.splice(i, 1); // Remove projectile after hitting
                    break;
                }
            }

            // Remove projectile if it goes out of range (simple distance check for now)
            const dxFromPlayer = projectile.x - (player.x + player.width / 2);
            const dyFromPlayer = projectile.y - (player.y + player.height / 2);
            const distanceFromPlayer = Math.sqrt(dxFromPlayer * dxFromPlayer + dyFromPlayer * dyFromPlayer);
            if (distanceFromPlayer > novaAttack.range || novaTimer <= 0) {
                novaProjectiles.splice(i, 1);
            }
        }

        if (novaTimer <= 0 && novaProjectiles.length === 0) {
            isNovaActive = false;
        }
    }
}

export function drawNovaAttack(ctx) {
    if (isNovaActive) {
        ctx.fillStyle = novaAttack.projectileColor;
        for (const projectile of novaProjectiles) {
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}