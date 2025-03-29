import { gameWorldWidth, gameWorldHeight } from './main.js';
import { checkCollision } from './utils.js';

export const enemies = [];

export function spawnEnemy() {
  const newEnemy = {
    x: Math.random() * (gameWorldWidth - 50),
    y: Math.random() * (gameWorldHeight - 50),
    width: 50,
    height: 50,
    color: 'red',
    health: 100
  };
  enemies.push(newEnemy);
}

export function drawEnemies(ctx) {
  for (const enemy of enemies) {
    if (enemy.health > 0) {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      ctx.fillStyle = 'gray';
      ctx.fillRect(enemy.x, enemy.y - 15, enemy.width, 10);
      ctx.fillStyle = 'green';
      ctx.fillRect(enemy.x, enemy.y - 15, (enemy.health / 100) * enemy.width, 10);
    }
  }
}