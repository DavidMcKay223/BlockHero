import { gameWorldWidth, gameWorldHeight } from './main.js';
import { checkCollision } from './utils.js';
import { player } from './player.js'; // Import player to make enemies move towards it

export const enemies = [];
const baseEnemySize = 50; // Define base enemy size

// Define different enemy types
const enemyTypes = [
    {
        name: 'Basic Block',
        color: 'red',
        baseHealth: 100,
        speed: 1,
        movementPattern: 'random', // 'random', 'chase'
        sizeRatio: 1,
        moneyWorth: 25,
        blockType: 'solid_red'
    },
    {
        name: 'Fast Block',
        color: 'orange',
        baseHealth: 75,
        speed: 2,
        movementPattern: 'chase',
        sizeRatio: 0.8,
        moneyWorth: 35,
        blockType: 'solid_orange'
    },
    {
        name: 'Tank Block',
        color: 'brown',
        baseHealth: 150,
        speed: 0.5,
        movementPattern: 'random',
        sizeRatio: 1.2,
        moneyWorth: 50,
        blockType: 'solid_brown'
    },
    {
        name: 'Green Goo',
        color: 'green',
        baseHealth: 90,
        speed: 1.5,
        movementPattern: 'chase',
        sizeRatio: 1,
        moneyWorth: 40,
        blockType: 'gooey_green'
    }
];

export function spawnEnemy(options) {
    let newEnemy;
    let collision = false;
    let attempts = 0;
    const maxAttempts = 100; // To prevent infinite loops

    // Determine which enemy type to spawn (can be based on player level later)
    const randomEnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    const health = options?.health !== undefined ? options.health : randomEnemyType.baseHealth;
    const sizeRatio = options?.sizeRatio !== undefined ? options.sizeRatio : randomEnemyType.sizeRatio;
    const moneyWorth = options?.moneyWorth !== undefined ? options.moneyWorth : randomEnemyType.moneyWorth;
    const speed = options?.speed !== undefined ? options.speed : randomEnemyType.speed;
    const movementPattern = options?.movementPattern !== undefined ? options.movementPattern : randomEnemyType.movementPattern;
    const blockType = options?.blockType !== undefined ? options.blockType : randomEnemyType.blockType;

    const spawnedEnemySize = baseEnemySize * sizeRatio;

    do {
        newEnemy = {
            x: Math.random() * (gameWorldWidth - spawnedEnemySize),
            y: Math.random() * (gameWorldHeight - spawnedEnemySize),
            width: spawnedEnemySize,
            height: spawnedEnemySize,
            color: randomEnemyType.color, // Default color from enemy type
            baseColor: randomEnemyType.color, // Keep track of base color
            health: health,
            maxHealth: health,
            sizeRatio: sizeRatio,
            moneyWorth: moneyWorth,
            speed: speed,
            movementPattern: movementPattern,
            blockType: blockType
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

export function updateEnemies() {
    for (const enemy of enemies) {
        if (enemy.movementPattern === 'random') {
            // Simple random movement
            if (Math.random() < 0.02) { // Small chance to change direction
                enemy.vx = (Math.random() - 0.5) * enemy.speed;
                enemy.vy = (Math.random() - 0.5) * enemy.speed;
            }
            enemy.x += enemy.vx || 0;
            enemy.y += enemy.vy || 0;

            // Keep enemies within the game bounds
            if (enemy.x < 0) enemy.x = 0;
            if (enemy.y < 0) enemy.y = 0;
            if (enemy.x > gameWorldWidth - enemy.width) enemy.x = gameWorldWidth - enemy.width;
            if (enemy.y > gameWorldHeight - enemy.height) enemy.y = gameWorldHeight - enemy.height;
        } else if (enemy.movementPattern === 'chase') {
            // Move towards the player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const angle = Math.atan2(dy, dx);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;
        }

        // Change color based on health
        const healthPercentage = enemy.health / enemy.maxHealth;
        if (healthPercentage > 0.7) {
            enemy.color = enemy.baseColor; // Full health, use base color
        } else if (healthPercentage > 0.3) {
            enemy.color = 'yellow'; // Damaged
        } else {
            enemy.color = 'darkred'; // Critical health
        }
    }
}

export function drawEnemies(ctx) {
    const healthBarWidth = 60;
    const healthBarHeight = 10;
    const healthBarOffsetY = 15;

    for (const enemy of enemies) {
        if (enemy.health > 0) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            // Draw health bar
            const healthBarX = enemy.x + (enemy.width - healthBarWidth) / 2;
            const healthBarY = enemy.y - healthBarOffsetY;

            ctx.fillStyle = 'gray';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            ctx.fillStyle = 'green';
            const healthPercentage = enemy.health / enemy.maxHealth;
            const currentHealthBarWidth = healthPercentage * healthBarWidth;
            ctx.fillRect(healthBarX, healthBarY, currentHealthBarWidth, healthBarHeight);

            // You could add logic here to draw different "block types"
            // For example, if enemy.blockType === 'gooey_green', draw a different shape or texture
        }
    }
}