import { player } from '../core/player.js';
import * as items from './items.js';
import { updateStatDisplay } from './stats.js';

export const shopMenu = document.getElementById('shopMenu');
export const shopInventoryDisplay = document.getElementById('shopInventoryDisplay');
export const closeShopButton = document.getElementById('closeShopButton');
let shopOpen = false;
export let currentShopInventory = [];

export function toggleShop() {
    shopOpen = !shopOpen;
    if (shopMenu) {
        shopMenu.style.display = shopOpen ? 'flex' : 'none';
    }
    if (shopOpen) {
        generateAndDisplayShop();
    }
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
            generateAndDisplayShop();
        }
    } else {
        console.log("Not enough money!");
    }
}

if (closeShopButton) {
    closeShopButton.addEventListener('click', () => {
        toggleShop();
    });
}