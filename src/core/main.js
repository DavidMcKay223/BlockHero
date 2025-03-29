import { update, draw } from './game.js';
import { player, handlePlayerInput, updatePlayerCooldowns, initiateAttack } from './player.js';
import { spawnEnemy, enemies, updateEnemies, drawEnemies } from './enemy.js';
import RighteousFire from '../talents/righteousFire.js';
import { updateArcaneExplosions, performArcaneExplosion } from '../talents/arcaneExplosion.js';
import { toggleMenu } from '../components/menu.js';
import { toggleInventory } from '../components/inventory.js';
import { toggleShop } from '../components/shop.js';
import { updateStatDisplay } from '../components/stats.js';
import { activateStatBoost, updateStatBoost } from '../talents/statBoost.js';


export const DEBUG_MODE = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

export const gameWorldWidth = 1200;
export const gameWorldHeight = 700;

export { canvas, ctx };

canvas.width = gameWorldWidth;
canvas.height = gameWorldHeight;

player.y = canvas.height / 2 - 25;

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

canvas.addEventListener('mousedown', (event) => {
    if (DEBUG_MODE) console.log('mousedown event - button:', event.button, 'clientX:', event.button, 'clientX:', event.clientY);
    initiateAttack(event.button);
    event.preventDefault(); // keep this to prevent default browser behavior.  Important for contextmenu
});

canvas.addEventListener('mouseup', (event) => {
    if (DEBUG_MODE) console.log('mouseup event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent the default context menu
    initiateAttack(2); // Explicitly call initiateAttack with button 2 (right-click)
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        toggleMenu();
    } else if (event.key === 'b' || event.key === 'B') {
        toggleShop();
    } else if (event.key === 'i' || event.key === 'I') {
        toggleInventory();
    } else if (event.key === '1') {
        if (righteousFireInstance.isActive) {
            righteousFireInstance.deactivate();
        } else {
            righteousFireInstance.activate();
        }
    } else if (event.key === '2') {
        performArcaneExplosion(player.x + player.width / 2, player.y + player.height / 2, canvas);
    } else if (event.key === '3') {
        activateStatBoost();
    }
});

const initialEnemyCount = 5;
const respawnEnemyCount = 5;

function init() {
    updateStatDisplay();
}

async function gameLoop() {
    update();
    updateEnemies();

    if (player.arcaneExplosionOrbs && player.arcaneExplosionOrbs.length > 0) {
        const arcaneExplosionModule = await import('../talents/arcaneExplosion.js');
        await arcaneExplosionModule.updateArcaneExplosions(player.arcaneExplosionOrbs);
    }

    draw(ctx);
    drawEnemies(ctx);

    if (player.killCount >= player.killsForNextLevel) {
        player.playerLevel++;
        player.killsForNextLevel *= 2;
        console.log(`Player leveled up! Now level ${player.playerLevel}`);
        // Shop inventory will be regenerated when the shop is opened
    }

    if (enemies.length === 0) {
        if (DEBUG_MODE) console.log('No enemies left, spawning more...');
        for (let i = 0; i < respawnEnemyCount * player.playerLevel; i++) {
            if (player.playerLevel > 2 && Math.random() < 0.4) {
                spawnEnemy({ health: 120, speed: 1.8, movementPattern: 'chase' });
            } else if (player.playerLevel > 4 && Math.random() < 0.25) {
                spawnEnemy({ health: 180, sizeRatio: 1.1, moneyWorth: 60 });
            } else {
                spawnEnemy();
            }
        }
    }

    updateStatDisplay();
    updatePlayerCooldowns();
    updateStatBoost();
    requestAnimationFrame(gameLoop);
}

export const righteousFireInstance = new RighteousFire(player);

window.onload = init;
gameLoop();