import { player } from '../player.js';
import { enemies, spawnEnemy } from '../enemy.js';
import { checkCollision } from '../utils.js';

const punchAttack = {
  duration: 20,
  damage: 10
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
          currentEnemy.health -= punchAttack.damage;
          if (currentEnemy.health <= 0) {
            enemies.splice(i, 1);
            spawnEnemy();
            player.killCount++; // Increment kill count
            player.money += 25; // Add some money (you can adjust this amount)
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