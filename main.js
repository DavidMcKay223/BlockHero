import { update, draw } from './game.js';
import { player, initiateAttack } from './player.js';
import { spawnEnemy, enemies, updateEnemies, drawEnemies } from './enemy.js'; // Import the new enemy functions
import * as items from './items.js'; // Import our items logic
import RighteousFire from './Talent/righteousFire.js';

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
    if (DEBUG_MODE) console.log('mousedown event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
    initiateAttack(event.button);
    event.preventDefault();
});

canvas.addEventListener('mouseup', (event) => {
    if (DEBUG_MODE) console.log('mouseup event - button:', event.button, 'clientX:', event.clientX, 'clientY:', event.clientY);
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

const attackMenu = document.getElementById('attackMenu');
const leftClickAttackSelect = document.getElementById('leftClickAttack');
const rightClickAttackSelect = document.getElementById('rightClickAttack');
const closeMenuButton = document.getElementById('closeMenuButton');

const strValueDisplay = document.getElementById('strValue');
const dexValueDisplay = document.getElementById('dexValue');
const intValueDisplay = document.getElementById('intValue');
const moneyValueDisplay = document.getElementById('moneyValue');
const killsValueDisplay = document.getElementById('killsValue');
const levelValueDisplay = document.getElementById('levelValue');

const increaseStrButton = document.getElementById('increaseStr');
const increaseDexButton = document.getElementById('increaseDex');
const increaseIntButton = document.getElementById('increaseInt');
const strCostDisplay = document.getElementById('strCost');
const dexCostDisplay = document.getElementById('dexCost');
const intCostDisplay = document.getElementById('intCost');

let strCost = 50;
let dexCost = 50;
let intCost = 50;

const shopMenu = document.getElementById('shopMenu');
const shopInventoryDisplay = document.getElementById('shopInventoryDisplay');
const closeShopButton = document.getElementById('closeShopButton');
let shopOpen = false;
let currentShopInventory = [];

const inventoryMenu = document.getElementById('inventoryMenu');
const inventoryItemsDisplay = document.getElementById('inventoryItemsDisplay');
const equippedItemsDisplay = document.getElementById('equippedItemsDisplay');
const closeInventoryButton = document.getElementById('closeInventoryButton');
let inventoryOpen = false;

function updateStatDisplay() {
    let totalSTR = player.STR;
    let totalDEX = player.DEX;
    let totalINT = player.INT;

    for (const slot in player.equipped) {
        const item = player.equipped[slot];
        if (item) {
            totalSTR += item.stats?.STR || 0;
            totalDEX += item.stats?.DEX || 0;
            totalINT += item.stats?.INT || 0;
        }
    }

    strValueDisplay.textContent = totalSTR;
    dexValueDisplay.textContent = totalDEX;
    intValueDisplay.textContent = totalINT;
    moneyValueDisplay.textContent = player.money;
    killsValueDisplay.textContent = player.killCount;
    levelValueDisplay.textContent = player.playerLevel;
    strCostDisplay.textContent = `(${Math.round(strCost)} Money)`;
    dexCostDisplay.textContent = `(${Math.round(dexCost)} Money)`;
    intCostDisplay.textContent = `(${Math.round(intCost)} Money)`;
}

let menuOpen = false;

function toggleMenu() {
    menuOpen = !menuOpen;
    attackMenu.style.display = menuOpen ? 'flex' : 'none';
    if (menuOpen) {
        leftClickAttackSelect.value = player.selectedLeftClickAttack;
        rightClickAttackSelect.value = player.selectedRightClickAttack;
    }
}

function toggleShop() {
    shopOpen = !shopOpen;
    shopMenu.style.display = shopOpen ? 'flex' : 'none';
    if (shopOpen) {
        generateAndDisplayShop();
    }
}

function toggleInventory() {
    inventoryOpen = !inventoryOpen;
    inventoryMenu.style.display = inventoryOpen ? 'flex' : 'none';
    if (inventoryOpen) {
        displayInventory();
        displayEquippedGear();
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        toggleMenu();
    } else if (event.key === 'b' || event.key === 'B') {
        toggleShop();
    } else if (event.key === 'i' || event.key === 'I') { // Toggle inventory on 'I'
        toggleInventory();
    } else if (event.key === '1') {
        if(righteousFireInstance.isActive){
            righteousFireInstance.deactivate();
        }else{
            righteousFireInstance.activate();
        }
    }
});

leftClickAttackSelect.addEventListener('change', (event) => {
    player.selectedLeftClickAttack = event.target.value;
    if (DEBUG_MODE) console.log('Left click attack selected:', player.selectedLeftClickAttack);
});

rightClickAttackSelect.addEventListener('change', (event) => {
    player.selectedRightClickAttack = event.target.value;
    if (DEBUG_MODE) console.log('Right click attack selected:', player.selectedRightClickAttack);
});

closeMenuButton.addEventListener('click', () => {
    toggleMenu();
});

increaseStrButton.addEventListener('click', () => {
    if (player.money >= strCost) {
        player.money -= strCost;
        player.STR+=5;
        strCost *= 1.20;
        updateStatDisplay();
    }
});

increaseDexButton.addEventListener('click', () => {
    if (player.money >= dexCost) {
        player.money -= dexCost;
        player.DEX+=5;
        dexCost *= 1.20;
        updateStatDisplay();
    }
});

increaseIntButton.addEventListener('click', () => {
    if (player.money >= intCost) {
        player.money -= intCost;
        player.INT+=5;
        intCost *= 1.20;
        updateStatDisplay();
    }
});

closeShopButton.addEventListener('click', () => {
    toggleShop();
});

closeInventoryButton.addEventListener('click', () => {
    toggleInventory();
});

const initialEnemyCount = 5;
const respawnEnemyCount = 5;

function init() {
    updateStatDisplay();
    currentShopInventory = items.generateShopInventory(5, player.playerLevel);
}

function gameLoop() {
    update();
    updateEnemies(); // Call the enemy update function
    draw(ctx);
    drawEnemies(ctx); // Call the enemy draw function

    if (player.killCount >= player.killsForNextLevel) {
        player.playerLevel++;
        player.killsForNextLevel *= 2;
        console.log(`Player leveled up! Now level ${player.playerLevel}`);
        if (shopOpen) {
            generateAndDisplayShop();
        } else {
            currentShopInventory = items.generateShopInventory(5, player.playerLevel);
        }
    }

    if (enemies.length === 0) {
        if (DEBUG_MODE) console.log('No enemies left, spawning more...');
        for (let i = 0; i < respawnEnemyCount * player.playerLevel; i++) {
            // Example of level-based enemy spawning (you can adjust the conditions and types)
            if (player.playerLevel > 2 && Math.random() < 0.4) {
                spawnEnemy({ health: 120, speed: 1.8, movementPattern: 'chase' }); // Spawn a faster enemy
            } else if (player.playerLevel > 4 && Math.random() < 0.25) {
                spawnEnemy({ health: 180, sizeRatio: 1.1, moneyWorth: 60 }); // Spawn a tankier enemy
            } else {
                spawnEnemy(); // Spawn a basic enemy
            }
        }
    }

    updateStatDisplay();

    requestAnimationFrame(gameLoop);
}

function generateAndDisplayShop() {
    shopInventoryDisplay.innerHTML = '';
    currentShopInventory = items.generateShopInventory(5, player.playerLevel);

    currentShopInventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('shop-item');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('shop-item-details');
        detailsDiv.innerHTML = `<strong>${item.name}</strong> (${item.type})<br>Cost: $${item.cost}`;

        const statsDiv = document.createElement('div');
        statsDiv.classList.add('shop-item-stats');
        let statsText = '';
        for (const stat in item.stats) {
            statsText += `${stat}: +${item.stats[stat]} `;
        }
        statsDiv.textContent = statsText;
        detailsDiv.appendChild(statsDiv);

        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.addEventListener('click', () => {
            buyItem(index);
        });

        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(buyButton);
        shopInventoryDisplay.appendChild(itemDiv);
    });
}

function buyItem(itemIndex) {
    const itemToBuy = currentShopInventory[itemIndex];
    if (player.money >= itemToBuy.cost) {
        player.money -= itemToBuy.cost;
        player.inventory.push(itemToBuy);
        console.log(`Bought ${itemToBuy.name}. Inventory:`, player.inventory);
        updateStatDisplay();
        if (shopOpen) {
            generateAndDisplayShop(); // Refresh the shop UI
        }
    } else {
        console.log("Not enough money!");
    }
}

function displayInventory() {
    inventoryItemsDisplay.innerHTML = '';
    player.inventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('inventory-item-details');
        detailsDiv.innerHTML = `<strong>${item.name}</strong> (${item.type})`;

        const statsDiv = document.createElement('div');
        statsDiv.classList.add('inventory-item-stats');
        let statsText = '';
        for (const stat in item.stats) {
            statsText += `${stat}: +${item.stats[stat]} `;
        }
        statsDiv.textContent = statsText;
        detailsDiv.appendChild(statsDiv);

        const equipButton = document.createElement('button');
        equipButton.textContent = 'Equip';
        equipButton.addEventListener('click', () => {
            equipItem(index);
        });

        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(equipButton);
        inventoryItemsDisplay.appendChild(itemDiv);
    });
}

function displayEquippedGear() {
    equippedItemsDisplay.innerHTML = '';
    for (const slot in player.equipped) {
        const item = player.equipped[slot];
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('equipped-item');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('equipped-item-details');
        detailsDiv.innerHTML = `<strong>${slot.charAt(0).toUpperCase() + slot.slice(1)}:</strong> ${item ? item.name : 'Empty'}`;

        if (item) {
            const unequipButton = document.createElement('button');
            unequipButton.textContent = 'Unequip';
            unequipButton.addEventListener('click', () => {
                unequipItem(slot);
            });
            detailsDiv.appendChild(unequipButton);
        }

        itemDiv.appendChild(detailsDiv);
        equippedItemsDisplay.appendChild(itemDiv);
    }
}

function equipItem(inventoryIndex) {
    const itemToEquip = player.inventory[inventoryIndex];
    const slot = itemToEquip.type;

    if (player.equipped[slot]) {
        // If there's already an item in that slot, move it back to inventory
        player.inventory.push(player.equipped[slot]);
    }

    player.equipped[slot] = itemToEquip;
    player.inventory.splice(inventoryIndex, 1); // Remove the equipped item from inventory
    displayInventory();
    displayEquippedGear();
    updateStatDisplay();
}

function unequipItem(slot) {
    const unequippedItem = player.equipped[slot];
    player.equipped[slot] = null;
    player.inventory.push(unequippedItem);
    displayInventory();
    displayEquippedGear();
    updateStatDisplay();
}

export const righteousFireInstance = new RighteousFire(player);

window.onload = init;
gameLoop();