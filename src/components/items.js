export const gearTypes = ['helmet', 'chest', 'weapon', 'boots', 'ring', 'amulet'];
export const statTypes = ['STR', 'DEX', 'INT'];

export class Item {
    constructor(name, type, stats, cost) {
        this.name = name;
        this.type = type;
        this.stats = stats; // e.g., { STR: 5, DEX: 2 }
        this.cost = cost;
    }
}

export function generateRandomItem(level = 1) {
    const type = gearTypes[Math.floor(Math.random() * gearTypes.length)];
    const baseName = type.charAt(0).toUpperCase() + type.slice(1); // e.g., "Helmet"
    const randomNumber = Math.random().toString(36).substring(2, 7); // Generate a short random string
    const name = `${baseName} of Fortune (${randomNumber})`;

    const stats = {};
    const numStats = Math.floor(Math.random() * 3) + 1; // 1 to 3 random stats
    let totalStatBonus = 0;

    // Determine how many stats to give based on a stronger exponential "power level" influenced by level
    const maxBonusPerStat = Math.floor(Math.pow(level, 1.7)) + 1; // Strong exponential scaling for stats - UNCHANGED

    // Randomly pick stats to apply
    const availableStats = [...statTypes];
    for (let i = 0; i < numStats && availableStats.length > 0; i++) {
        const statIndex = Math.floor(Math.random() * availableStats.length);
        const stat = availableStats.splice(statIndex, 1)[0];
        const bonus = Math.floor(Math.random() * maxBonusPerStat) + 1; // 1 to maxBonusPerStat
        stats[stat] = bonus;
        totalStatBonus += bonus;
    }

    // Calculate a basic cost based on the number and magnitude of stats with a linear dependency on level - MODIFIED
    const cost = Math.max(10, Math.floor(totalStatBonus * 75 * level));

    return new Item(name, type, stats, cost);
}

export function generateShopInventory(numItems = 5, playerLevel = 1) {
    const inventory = [];
    for (let i = 0; i < numItems; i++) {
        inventory.push(generateRandomItem(playerLevel));
    }
    return inventory;
}