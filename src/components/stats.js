export function updateStatDisplay(player) {
    const strValueDisplay = document.getElementById('strValue');
    const dexValueDisplay = document.getElementById('dexValue');
    const intValueDisplay = document.getElementById('intValue');
    const moneyValueDisplay = document.getElementById('moneyValue');
    const killsValueDisplay = document.getElementById('killsValue');
    const levelValueDisplay = document.getElementById('levelValue');
    const strCostDisplay = document.getElementById('strCost');
    const dexCostDisplay = document.getElementById('dexCost');
    const intCostDisplay = document.getElementById('intCost');

    if (!strValueDisplay || !dexValueDisplay || !intValueDisplay || !moneyValueDisplay || !killsValueDisplay || !levelValueDisplay ||
        !strCostDisplay || !dexCostDisplay || !intCostDisplay) {
        return;
    }

    strValueDisplay.textContent = player.STR;
    dexValueDisplay.textContent = player.DEX;
    intValueDisplay.textContent = player.INT;
    moneyValueDisplay.textContent = player.money;
    killsValueDisplay.textContent = player.killCount;
    levelValueDisplay.textContent = player.playerLevel;
    strCostDisplay.textContent = `(${Math.round(player.strCost)} Money)`;
    dexCostDisplay.textContent = `(${Math.round(player.dexCost)} Money)`;
    intCostDisplay.textContent = `(${Math.round(player.intCost)} Money)`;
}