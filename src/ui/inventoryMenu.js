export function displayInventory(inventoryItems, inventoryItemsDisplay) {
    inventoryItemsDisplay.innerHTML = '';
    inventoryItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('inventory-item-details');
        detailsDiv.innerHTML = `<strong>${item.name}</strong> (${item.type})`;

        const statsDiv = document.createElement('div');
        statsDiv.classList.add('inventory-item-stats');
        statsDiv.innerHTML = `Stats: ${item.stats.join(', ')}`;

        const useButton = document.createElement('button');
        useButton.textContent = 'Use';
        useButton.onclick = () => useItem(index);

        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(statsDiv);
        itemDiv.appendChild(useButton);
        inventoryItemsDisplay.appendChild(itemDiv);
    });
}

export function useItem(index) {
    // Logic for using an item from the inventory
    console.log(`Using item at index: ${index}`);
    // Implement item usage logic here
}