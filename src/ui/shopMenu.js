export function toggleShop(shopMenu, shopOpen) {
    shopOpen = !shopOpen;
    if (shopMenu) {
        shopMenu.style.display = shopOpen ? 'flex' : 'none';
    }
    if (shopOpen) {
        generateAndDisplayShop();
    }
}

export function generateAndDisplayShop(shopInventoryDisplay, currentShopInventory, player) {
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
            statsText += `${stat}: ${item.stats[stat]}<br>`;
        }
        statsDiv.innerHTML = statsText;

        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.onclick = () => buyItem(index, currentShopInventory, player);

        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(statsDiv);
        itemDiv.appendChild(buyButton);
        shopInventoryDisplay.appendChild(itemDiv);
    });
}

export function buyItem(itemIndex, currentShopInventory, player) {
    const itemToBuy = currentShopInventory[itemIndex];
    if (player.money >= itemToBuy.cost) {
        player.money -= itemToBuy.cost;
        player.inventory.push(itemToBuy);
        updateStatDisplay(); // Assuming this function is available to update the UI
    } else {
        alert("Not enough money!");
    }
}