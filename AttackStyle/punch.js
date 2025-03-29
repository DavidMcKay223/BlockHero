import { player } from '../player.js';
import { enemies, spawnEnemy } from '../enemy.js';
import { checkCollision } from '../utils.js';

const punchAttack = {
    duration: 20,
    baseDamage: 10 // Using baseDamage for clarity
};

export function handlePunchAttack() {
    if (player.isAttacking) {
        player.attackTimer--;

        if (player.attackMove === 'punch') {
            player.color = 'lightgreen';
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            const currentEnemy = enemies[i];
            if (checkCollision(player, currentEnemy)) {
                if (player.attackMove === 'punch') {
                    const damage = punchAttack.baseDamage + player.STR; // Calculate damage with STR
                    currentEnemy.health -= damage;
                    if (currentEnemy.health <= 0) {
                        const originalMaxHealth = currentEnemy.maxHealth || 100;
                        const splitHealth = originalMaxHealth * 2;

                        const originalSizeRatio = currentEnemy.sizeRatio || 1;
                        const splitSizeRatio = originalSizeRatio * 0.5;

                        const originalMoneyWorth = currentEnemy.moneyWorth || 25;
                        const splitMoneyWorth = originalMoneyWorth * 2;

                        enemies.splice(i, 1);

                        // Spawn two new enemies
                        spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                        spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });

                        player.killCount++;
                        player.money += originalMoneyWorth * 0.50;
                    }
                }
            }
        }

        if (player.attackTimer <= 0) {
            player.isAttacking = false;
            player.color = 'blue';
        }
    }
}