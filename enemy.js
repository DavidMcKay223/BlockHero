import { gameWorldWidth, gameWorldHeight } from './main.js';
import { checkCollision } from './utils.js';

export const enemies = [];
const enemySize = 50; // Define enemy size as a constant

export function spawnEnemy() {
  let newEnemy;
  let collision = false;
  let attempts = 0;
  const maxAttempts = 100; // To prevent infinite loops in dense scenarios

  do {
    newEnemy = {
      x: Math.random() * (gameWorldWidth - enemySize),
      y: Math.random() * (gameWorldHeight - enemySize),
      width: enemySize,
      height: enemySize,
      color: 'red',
      health: 100
    };
    collision = false;
    for (const existingEnemy of enemies) {
      if (checkCollision(newEnemy, existingEnemy)) {
        collision = true;
        break;
      }
    }
    attempts++;
    if (attempts > maxAttempts) {
      console.warn("Could not find a non-overlapping position for the enemy after " + maxAttempts + " attempts.");
      return; // Exit if too many attempts fail
    }
  } while (collision);

  enemies.push(newEnemy);
}

export function drawEnemies(ctx) {
  for (const enemy of enemies) {
    if (enemy.health > 0) {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemySize, enemySize);

      ctx.fillStyle = 'gray';
      ctx.fillRect(enemy.x, enemy.y - 15, enemySize, 10);
      ctx.fillStyle = 'green';
      ctx.fillRect(enemy.x, enemy.y - 15, (enemy.health / 100) * enemySize, 10);
    }
  }
}