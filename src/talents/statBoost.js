import { player } from '../core/player.js';

export const statBoostDuration = 10 * 60; // 10 seconds * 60 ticks per second
export const statBoostCooldownDuration = 3 * 60 * 60; // 3 minutes * 60 seconds * 60 ticks per second

let isStatBoostActive = false;
let statBoostTimer = 0;
let canUseStatBoost = true;
let statBoostCooldownTimer = 0;
const originalStats = { STR: 0, DEX: 0, INT: 0 };

export function activateStatBoost() {
    if (canUseStatBoost) {
        isStatBoostActive = true;
        statBoostTimer = statBoostDuration;
        canUseStatBoost = false;
        statBoostCooldownTimer = statBoostCooldownDuration;
        originalStats.STR = player.STR;
        originalStats.DEX = player.DEX;
        originalStats.INT = player.INT;
        // Multiply the boost amount by the player's level
        const boostAmount = 1000 * player.playerLevel;
        player.STR += boostAmount;
        player.DEX += boostAmount;
        player.INT += boostAmount;
        if (player.DEBUG_MODE) console.log(`Stat boost activated! Increased stats by ${boostAmount}`);
    } else if (player.DEBUG_MODE) {
        console.log("Stat boost is on cooldown.");
    }
}

export function updateStatBoost() {
    if (isStatBoostActive) {
        statBoostTimer--;
        if (statBoostTimer <= 0) {
            isStatBoostActive = false;
            player.STR = originalStats.STR;
            player.DEX = originalStats.DEX;
            player.INT = originalStats.INT;
            if (player.DEBUG_MODE) console.log("Stat boost expired.");
        }
    } else if (!canUseStatBoost) {
        statBoostCooldownTimer--;
        if (statBoostCooldownTimer <= 0) {
            canUseStatBoost = true;
            if (player.DEBUG_MODE) console.log("Stat boost cooldown finished.");
        }
    }
}

export { isStatBoostActive };
