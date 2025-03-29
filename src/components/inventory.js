import { player } from '../core/player.js';
import * as items from './items.js';

export const inventoryMenu = document.getElementById('inventoryMenu');
export const inventoryItemsDisplay = document.getElementById('inventoryItemsDisplay');
export const equippedItemsDisplay = document.getElementById('equippedItemsDisplay');
export const closeInventoryButton = document.getElementById('closeInventoryButton');
let inventoryOpen = false;

export function toggleInventory() {
    inventoryOpen = !inventoryOpen;
    if (inventoryMenu) {
        inventoryMenu.style.display = inventoryOpen ? 'flex' : 'none';
    }
    if (inventoryOpen) {
        displayInventory();
        displayEquippedGear();
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

function equipItem(itemIndex) {
    const item = player.inventory[itemIndex];
    if (item && item.type) {
        const slot = item.type; // Assuming item.type matches the equipment slot name
        if (player.equipped[slot]) {
            // If there's already an item in the slot, put it back in the inventory
            player.inventory.push(player.equipped[slot]);
        }
        player.equipped[slot] = item;
        player.inventory.splice(itemIndex, 1);
        displayInventory();
        displayEquippedGear();
    }
}

function unequipItem(slot) {
    if (player.equipped[slot]) {
        player.inventory.push(player.equipped[slot]);
        player.equipped[slot] = null;
        displayInventory();
        displayEquippedGear();
    }
}

if (closeInventoryButton) {
    closeInventoryButton.addEventListener('click', () => {
        toggleInventory();
    });
}