import { update, draw } from './game.js';
import { player, initiateAttack } from './player.js';
import { spawnEnemy, enemies } from './enemy.js';

export const DEBUG_MODE = false; // Export DEBUG_MODE
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

export const gameWorldWidth = 1200;
export const gameWorldHeight = 700;

export { canvas, ctx };

canvas.width = gameWorldWidth;
canvas.height = gameWorldHeight;

player.y = canvas.height / 2 - 25; // Initialize player.y after canvas

let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

canvas.addEventListener('mousedown', (event) => {
    // mouseClick and e are now managed in player.js if needed there
    if (DEBUG_MODE) console.log('mousedown event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
    initiateAttack(event.button);
    event.preventDefault();
});

canvas.addEventListener('mouseup', (event) => {
    // mouseClick is now managed in player.js if needed there
    if (DEBUG_MODE) console.log('mouseup event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

const attackMenu = document.getElementById('attackMenu');
const leftClickAttackSelect = document.getElementById('leftClickAttack');
const rightClickAttackSelect = document.getElementById('rightClickAttack');
const closeMenuButton = document.getElementById('closeMenuButton');

// Get stat display elements
const strValueDisplay = document.getElementById('strValue');
const dexValueDisplay = document.getElementById('dexValue');
const intValueDisplay = document.getElementById('intValue');
const moneyValueDisplay = document.getElementById('moneyValue');
const killsValueDisplay = document.getElementById('killsValue');

// Get stat increase button elements
const increaseStrButton = document.getElementById('increaseStr');
const increaseDexButton = document.getElementById('increaseDex');
const increaseIntButton = document.getElementById('increaseInt');
const strCostDisplay = document.getElementById('strCost');
const dexCostDisplay = document.getElementById('dexCost');
const intCostDisplay = document.getElementById('intCost');

// Stat increase costs
let strCost = 50;
let dexCost = 50;
let intCost = 50;

// Function to update the stat display
function updateStatDisplay() {
    strValueDisplay.textContent = player.STR;
    dexValueDisplay.textContent = player.DEX;
    intValueDisplay.textContent = player.INT;
    moneyValueDisplay.textContent = player.money;
    killsValueDisplay.textContent = player.killCount;
    strCostDisplay.textContent = `(${strCost} Money)`;
    dexCostDisplay.textContent = `(${dexCost} Money)`;
    intCostDisplay.textContent = `(${intCost} Money)`;
}

let menuOpen = false;

// Function to toggle the menu visibility
function toggleMenu() {
    menuOpen = !menuOpen;
    attackMenu.style.display = menuOpen ? 'flex' : 'none';

    // When opening the menu, set the dropdowns to the current player selections
    if (menuOpen) {
        leftClickAttackSelect.value = player.selectedLeftClickAttack;
        rightClickAttackSelect.value = player.selectedRightClickAttack;
    }
}

// Event listener to toggle the menu (e.g., on 'M' key press)
document.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        toggleMenu();
    }
});

// Event listener for left click attack selection
leftClickAttackSelect.addEventListener('change', (event) => {
    player.selectedLeftClickAttack = event.target.value;
    if (DEBUG_MODE) console.log('Left click attack selected:', player.selectedLeftClickAttack);
});

// Event listener for right click attack selection
rightClickAttackSelect.addEventListener('change', (event) => {
    player.selectedRightClickAttack = event.target.value;
    if (DEBUG_MODE) console.log('Right click attack selected:', player.selectedRightClickAttack);
});

// Event listener for the close button
closeMenuButton.addEventListener('click', () => {
    toggleMenu();
});

increaseStrButton.addEventListener('click', () => {
    if (player.money >= strCost) {
        player.money -= strCost;
        player.STR++;
        strCost *= 1.20;
        updateStatDisplay();
    }
});

increaseDexButton.addEventListener('click', () => {
    if (player.money >= dexCost) {
        player.money -= dexCost;
        player.DEX++;
        dexCost *= 1.20;
        updateStatDisplay();
    }
});

increaseIntButton.addEventListener('click', () => {
    if (player.money >= intCost) {
        player.money -= intCost;
        player.INT++;
        intCost *= 1.20;
        updateStatDisplay();
    }
});

const initialEnemyCount = 5; // You can change this number to spawn more or fewer enemies
const respawnEnemyCount = 5; // Number of enemies to respawn

function init() {
    //for (let i = 0; i < initialEnemyCount; i++) {
    //     spawnEnemy();
    //}
    updateStatDisplay(); // Initial call to display stats
}

function gameLoop() {
    update();
    draw(ctx);

    // Check if there are no enemies left
    if (enemies.length === 0) {
        if (DEBUG_MODE) console.log('No enemies left, spawning more...');
        // Spawn 5 new enemies
        for (let i = 0; i < respawnEnemyCount; i++) {
            spawnEnemy();
        }
    }

    updateStatDisplay(); // Update stats on each frame

    requestAnimationFrame(gameLoop);
}

window.onload = init;
gameLoop();