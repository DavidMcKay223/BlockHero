export const inventory = {
    items: [],
    
    addItem(item) {
        this.items.push(item);
    },

    removeItem(itemIndex) {
        if (itemIndex > -1 && itemIndex < this.items.length) {
            this.items.splice(itemIndex, 1);
        }
    },

    displayInventory() {
        const inventoryDisplay = document.getElementById('inventoryItemsDisplay');
        inventoryDisplay.innerHTML = '';

        this.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item');

            itemDiv.innerHTML = `
                <div class="inventory-item-details">
                    <strong>${item.name}</strong> (${item.type})
                </div>
                <div class="inventory-item-stats">
                    Cost: $${item.cost}
                </div>
                <button onclick="inventory.removeItem(${index})">Remove</button>
            `;

            inventoryDisplay.appendChild(itemDiv);
        });
    }
};