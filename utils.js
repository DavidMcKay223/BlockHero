export function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  export function getClosestEnemy(playerX, playerY, enemyArray) {
    let closestEnemy = null;
    let minDistance = Infinity;
    for (const enemy of enemyArray) {
        const dx = playerX - (enemy.x + enemy.width / 2);
        const dy = playerY - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = enemy;
        }
    }
    return closestEnemy;
}
