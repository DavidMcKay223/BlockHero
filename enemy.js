import { gameWorldWidth, gameWorldHeight } from './main.js';
import { checkCollision } from './utils.js';

export const enemies = [];
const enemySize = 50; // Define enemy size as a constant

export function spawnEnemy(options) {
  let newEnemy;
  let collision = false;
  let attempts = 0;
  const maxAttempts = 100; // To prevent infinite loops in dense scenarios

  const defaultHealth = 100;
  const defaultSizeRatio = 1;
  const defaultMoneyWorth = 25;

  const health = options?.health !== undefined ? options.health : defaultHealth;
  const sizeRatio = options?.sizeRatio !== undefined ? options.sizeRatio : defaultSizeRatio;
  const moneyWorth = options?.moneyWorth !== undefined ? options.moneyWorth : defaultMoneyWorth;
  const spawnedEnemySize = enemySize * sizeRatio;

  do {
    newEnemy = {
      x: Math.random() * (gameWorldWidth - spawnedEnemySize),
      y: Math.random() * (gameWorldHeight - spawnedEnemySize),
      width: spawnedEnemySize,
      height: spawnedEnemySize,
      color: 'red',
      health: health,
      maxHealth: health,
      sizeRatio: sizeRatio,
      moneyWorth: moneyWorth
    };
    collision = false;
    for (const existingEnemy of enemies) {
      // Adjust collision check to use the spawned enemy size
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
  const healthBarWidth = 60; // You can adjust this value to your liking
  const healthBarHeight = 10;
  const healthBarOffsetY = 15; // Distance above the enemy

  for (const enemy of enemies) {
    if (enemy.health > 0) {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Draw health bar above the enemy
      const healthBarX = enemy.x + (enemy.width - healthBarWidth) / 2; // Center the health bar above the enemy
      const healthBarY = enemy.y - healthBarOffsetY;

      ctx.fillStyle = 'gray';
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

      ctx.fillStyle = 'green';
      const healthPercentage = enemy.health / enemy.maxHealth;
      const currentHealthBarWidth = healthPercentage * healthBarWidth;
      ctx.fillRect(healthBarX, healthBarY, currentHealthBarWidth, healthBarHeight);
    }
  }
}