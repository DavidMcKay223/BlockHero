import { player } from '../core/player.js';
import { enemies, spawnEnemy } from '../core/enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../core/main.js';
import { checkCollision3D } from '../utils/helpers.js';
import { dpsMeter } from '../core/game.js';

const punchAttack = {
    duration: 20,
    baseDamage: 10 // Using baseDamage for clarity
};

export function handlePunchAttack(playerMesh) {
    if (player.isAttacking) {
        player.attackTimer--;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (checkCollision3D(playerMesh, enemy.mesh)) {
                const damage = punchAttack.baseDamage + player.STR;
                enemy.health -= damage;
                dpsMeter.recordDamage(damage);

                if (enemy.health <= 0) {
                    scene.remove(enemy.mesh); // Remove enemy mesh from scene
                    enemies.splice(i, 1);
                    player.killCount++;
                    player.money += enemy.moneyWorth || 25;
                }
            }
        }

        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
}