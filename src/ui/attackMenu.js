export function displayAttackMenu() {
    const attackMenu = document.getElementById('attackMenu');
    attackMenu.style.display = 'flex';

    const leftClickAttackSelect = document.getElementById('leftClickAttack');
    const rightClickAttackSelect = document.getElementById('rightClickAttack');

    leftClickAttackSelect.addEventListener('change', (event) => {
        player.selectedLeftClickAttack = event.target.value;
    });

    rightClickAttackSelect.addEventListener('change', (event) => {
        player.selectedRightClickAttack = event.target.value;
    });

    document.getElementById('increaseStr').addEventListener('click', () => {
        increaseStat('STR');
    });

    document.getElementById('increaseDex').addEventListener('click', () => {
        increaseStat('DEX');
    });

    document.getElementById('increaseInt').addEventListener('click', () => {
        increaseStat('INT');
    });

    document.getElementById('closeMenuButton').addEventListener('click', () => {
        attackMenu.style.display = 'none';
    });
}

function increaseStat(stat) {
    let cost;
    switch (stat) {
        case 'STR':
            cost = strCost;
            if (player.money >= cost) {
                player.money -= cost;
                player.STR += 5;
                strCost *= 1.20;
            }
            break;
        case 'DEX':
            cost = dexCost;
            if (player.money >= cost) {
                player.money -= cost;
                player.DEX += 5;
                dexCost *= 1.20;
            }
            break;
        case 'INT':
            cost = intCost;
            if (player.money >= cost) {
                player.money -= cost;
                player.INT += 5;
                intCost *= 1.20;
            }
            break;
    }
    updateStatDisplay();
}

function updateStatDisplay() {
    document.getElementById('strValue').textContent = player.STR;
    document.getElementById('dexValue').textContent = player.DEX;
    document.getElementById('intValue').textContent = player.INT;
    document.getElementById('moneyValue').textContent = player.money;
    document.getElementById('killsValue').textContent = player.killCount;
    document.getElementById('levelValue').textContent = player.playerLevel;
    document.getElementById('strCost').textContent = `(${Math.round(strCost)} Money)`;
    document.getElementById('dexCost').textContent = `(${Math.round(dexCost)} Money)`;
    document.getElementById('intCost').textContent = `(${Math.round(intCost)} Money)`;
}