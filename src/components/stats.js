import { player } from '../core/player.js';
import { DEBUG_MODE } from '../core/main.js';

export const strValueDisplay = document.getElementById('strValue');
export const dexValueDisplay = document.getElementById('dexValue');
export const intValueDisplay = document.getElementById('intValue');
export const moneyValueDisplay = document.getElementById('moneyValue');
export const killsValueDisplay = document.getElementById('killsValue');
export const levelValueDisplay = document.getElementById('levelValue');
export const increaseStrButton = document.getElementById('increaseStr');
export const increaseDexButton = document.getElementById('increaseDex');
export const increaseIntButton = document.getElementById('increaseInt');
export const strCostDisplay = document.getElementById('strCost');
export const dexCostDisplay = document.getElementById('dexCost');
export const intCostDisplay = document.getElementById('intCost');

let strCost = 50;
let dexCost = 50;
let intCost = 50;

export function updateStatDisplay() {
    if (!strValueDisplay || !dexValueDisplay || !intValueDisplay || !moneyValueDisplay || !killsValueDisplay || !levelValueDisplay ||
        !strCostDisplay || !dexCostDisplay || !intCostDisplay) {
        if (DEBUG_MODE) console.error("One or more stat display elements are missing from the HTML.");
        return;
    }
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

if (increaseStrButton) {
    increaseStrButton.addEventListener('click', () => {
        if (player.money >= strCost) {
            player.money -= strCost;
            player.STR += 5;
            strCost *= 1.20;
            updateStatDisplay();
        }
    });
}

if (increaseDexButton) {
    increaseDexButton.addEventListener('click', () => {
        if (player.money >= dexCost) {
            player.money -= dexCost;
            player.DEX += 5;
            dexCost *= 1.20;
            updateStatDisplay();
        }
    });
}

if (increaseIntButton) {
    increaseIntButton.addEventListener('click', () => {
        if (player.money >= intCost) {
            player.money -= intCost;
            player.INT += 5;
            intCost *= 1.20;
            updateStatDisplay();
        }
    });
}