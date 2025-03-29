import { DEBUG_MODE } from '../core/main.js';
import { enemies } from '../core/enemy.js';
import { player } from '../core/player.js';

class RighteousFire {
    constructor(player) {
        this.player = player;
        this.isActive = false;
        this.damageInterval = 500;
        this.burnDuration = 5000;
        this.baseDamageAmount = 5;
        this.burnDamageAmount = 5;
        this.damageRadius = 100;
        this.damageScaleFactor = 1.7;
        this.damageMultiplier = 10;
        this.intBonus = 200; // The amount to increase INT by
    }

    getDamageAmount() {
        const level = this.player.playerLevel;
        if (DEBUG_MODE) console.log("RighteousFire: Player Level in getDamageAmount:", level);
        const scaledDamage = Math.floor(this.baseDamageAmount * Math.pow(level, this.damageScaleFactor));
        return Math.max(1, scaledDamage * this.damageMultiplier);
    }

    activate() {
        if (!this.isActive) {
            this.isActive = true;
            if (DEBUG_MODE) console.log("Righteous Fire activated!");
            if (this.player && this.player.INT !== undefined) {
                this.player.INT += this.intBonus;
                if (DEBUG_MODE) console.log(`Righteous Fire: Increased player INT by ${this.intBonus}. Current INT: ${this.player.INT}`);
            } else if (DEBUG_MODE) {
                console.warn("Righteous Fire: Player object or INT stat not found.");
            }
            this.startContinuousDamage();
        } else {
            if (DEBUG_MODE) console.log("Righteous Fire is already active.");
        }
    }

    deactivate() {
        if (this.isActive) {
            this.isActive = false;
            if (DEBUG_MODE) console.log("Righteous Fire deactivated.");
            if (this.player && this.player.INT !== undefined) {
                this.player.INT -= this.intBonus;
                if (DEBUG_MODE) console.log(`Righteous Fire: Decreased player INT by ${this.intBonus}. Current INT: ${this.player.INT}`);
            } else if (DEBUG_MODE) {
                console.warn("Righteous Fire: Player object or INT stat not found.");
            }
            clearInterval(this.damageIntervalId);
        } else {
            if (DEBUG_MODE) console.log("Righteous Fire is not active.");
        }
    }

    startContinuousDamage() {
        this.damageIntervalId = setInterval(() => {
            if (this.isActive) {
                this.applyDamageToEnemiesInRadius();
            }
        }, this.damageInterval);
    }

    applyDamageToEnemiesInRadius() {
        if (DEBUG_MODE) console.log("RighteousFire: applyDamageToEnemiesInRadius called");
        const currentDamage = this.getDamageAmount();

        for (const enemy of enemies) {
            const distance = Math.sqrt(
                Math.pow(this.player.x - (enemy.x + enemy.width / 2), 2) +
                Math.pow(this.player.y - (enemy.y + enemy.height / 2), 2)
            );

            if (distance < this.damageRadius) {
                if (DEBUG_MODE) console.log("RighteousFire: Enemy in range for continuous damage:", enemy, "Current Damage:", currentDamage);
                this.applyBurningEffectToBlock(enemy);
                this.applyDamageToEnemy(enemy, currentDamage);
            }
        }
    }

    applyDamageToEnemy(enemy, damage) {
        if (DEBUG_MODE) console.log(`RighteousFire: Applying ${damage} damage to enemy:`, enemy);
        if (enemy.health > 0) {
            enemy.health -= damage;
            if (DEBUG_MODE) console.log(`RighteousFire: Enemy health after damage: ${enemy.health}`);
            if (enemy.health <= 0) {
                this.killBlock(enemy);
            }
        } else if (DEBUG_MODE) {
            console.log("RighteousFire: Enemy already dead, skipping damage:", enemy);
        }
    }

    applyBurningEffectToBlock(enemy) {
        if (!enemy.isBurning) {
            enemy.isBurning = true;
            enemy.burnStartTime = Date.now();
            if (DEBUG_MODE) console.log("RighteousFire: Enemy started burning:", enemy);

            const burnInterval = setInterval(() => {
                if (enemy.isBurning && enemy.health > 0) {
                    const elapsedTime = Date.now() - enemy.burnStartTime;
                    if (elapsedTime >= this.burnDuration) {
                        enemy.isBurning = false;
                        clearInterval(burnInterval);
                        if (DEBUG_MODE) console.log("RighteousFire: Enemy finished burning:", enemy);
                    } else {
                        if (DEBUG_MODE) console.log(`RighteousFire: Applying ${this.burnDamageAmount} burn damage to enemy:`, enemy);
                        enemy.health -= this.burnDamageAmount;
                        if (DEBUG_MODE) console.log(`RighteousFire: Enemy health after burn damage: ${enemy.health}`);
                        if (enemy.health <= 0) {
                            this.killBlock(enemy);
                            enemy.isBurning = false;
                            clearInterval(burnInterval);
                        }
                    }
                } else {
                    enemy.isBurning = false;
                    clearInterval(burnInterval);
                    if (DEBUG_MODE && !enemy.health > 0) console.log("RighteousFire: Burn interval stopped - enemy not alive:", enemy);
                    if (DEBUG_MODE && !enemy.isBurning) console.log("RighteousFire: Burn interval stopped - enemy not burning:", enemy);
                }
            }, 500);
        } else if (DEBUG_MODE) {
            console.log("RighteousFire: Enemy is already burning:", enemy);
        }
    }

    killBlock(enemyToRemove) {
        if (DEBUG_MODE) console.log("RighteousFire: Killing enemy:", enemyToRemove);
        const index = enemies.findIndex(enemy => enemy === enemyToRemove);
        if (index > -1) {
            enemies.splice(index, 1);
            if (DEBUG_MODE) console.log("RighteousFire: Enemy removed from enemies array.");
            if (this.player) {
                this.player.killCount++;
                this.player.money += enemyToRemove.moneyWorth;
                if (DEBUG_MODE) console.log(`RighteousFire: Player kill count: ${this.player.killCount}, money: ${this.player.money}`);
            }
        } else {
            console.warn("RighteousFire: Enemy not found in the enemies array:", enemyToRemove);
        }
    }
}

export default RighteousFire;