export let currentShopInventory = [];

export function generateShopInventory(itemCount, playerLevel) {
    const items = []; // This should be populated with actual item data
    for (let i = 0; i < itemCount; i++) {
        const item = {
            name: `Item ${i + 1}`,
            type: 'Common',
            cost: Math.floor(Math.random() * 100) + 1,
            stats: {
                STR: Math.floor(Math.random() * 10),
                DEX: Math.floor(Math.random() * 10),
                INT: Math.floor(Math.random() * 10),
            },
        };
        items.push(item);
    }
    return items;
}

export function displayShopInventory(shopInventoryDisplay) {
    shopInventoryDisplay.innerHTML = '';
    currentShopInventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('shop-item');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('shop-item-details');
        detailsDiv.innerHTML = `<strong>${item.name}</strong> (${item.type})<br>Cost: $${item.cost}`;

        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.onclick = () => buyItem(index);

        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(buyButton);
        shopInventoryDisplay.appendChild(itemDiv);
    });
}

export function buyItem(itemIndex) {
    const itemToBuy = currentShopInventory[itemIndex];
    if (player.money >= itemToBuy.cost) {
        player.money -= itemToBuy.cost;
        // Add logic to add the item to the player's inventory
        console.log(`Bought ${itemToBuy.name} for $${itemToBuy.cost}`);
    } else {
        console.log('Not enough money to buy this item.');
    }
}