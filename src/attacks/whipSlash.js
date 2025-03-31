import * as THREE from '../../node_modules/three/build/three.module.js';
import { player } from '../core/player.js';
import { enemies, spawnEnemy } from '../core/enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../core/main.js';
import { checkCollision3D } from '../utils/helpers.js';
import { dpsMeter } from '../core/game.js';

const whipSlashAttack = {
    baseDamage: 80, // Using baseDamage for clarity
    range: 140,
    whipColor: 'purple',
    thickness: 8,
    duration: 10 // We might still use this for the visual effect duration
};

let isWhipSlashActive = false;
let whipSlashTimer = 0;

export function performWhipSlash() {
    if (DEBUG_MODE) console.log('Performing Whip Slash');
    isWhipSlashActive = true;
    whipSlashTimer = whipSlashAttack.duration; // Start the visual timer

    const whipHitbox = getWhipHitbox();
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (checkCollision3D(whipHitbox, enemy)) {
            const damage = whipSlashAttack.baseDamage + player.STR + player.DEX; // Damage scales with STR and DEX
            enemy.health -= damage;
            dpsMeter.recordDamage(damage);
            if (enemy.health <= 0) {
                const originalMaxHealth = enemy.maxHealth || 100;
                const splitHealth = originalMaxHealth / 4;

                const originalSizeRatio = enemy.sizeRatio || 1;
                const splitSizeRatio = originalSizeRatio * 1.20; // Increase size by 20%

                const originalMoneyWorth = enemy.moneyWorth || 25;
                const splitMoneyWorth = originalMoneyWorth / 4;

                enemies.splice(i, 1);

                // Spawn four new enemies at random locations
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });
                spawnEnemy({ health: splitHealth, sizeRatio: splitSizeRatio, moneyWorth: splitMoneyWorth });

                player.killCount++; // Increment kill count
                player.money += originalMoneyWorth; // Award the full money worth for defeating the original enemy
            }
        }
    }
}

// We still need to manage the visual effect
export function handleWhipSlashAttack() {
    if (isWhipSlashActive) {
        whipSlashTimer--;
        if (whipSlashTimer <= 0) {
            isWhipSlashActive = false;
        }
    }
}

function getWhipHitbox() {
    return {
        x: player.x + player.width,
        y: player.y + player.height / 4,
        width: whipSlashAttack.range,
        height: player.height / 2
    };
}

export function drawWhipSlash(ctx) {
    if (isWhipSlashActive) {
        ctx.strokeStyle = whipSlashAttack.whipColor;
        ctx.lineWidth = whipSlashAttack.thickness;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width, player.y + player.height / 2);
        ctx.lineTo(player.x + player.width + whipSlashAttack.range, player.y + player.height / 2);
        ctx.stroke();
    }
}

export function updateWhipSlashInScene(scene) {
    const whipName = 'whipSlash';
    let whipObject = scene.getObjectByName(whipName);

    if (isWhipSlashActive) {
        const startPoint = new THREE.Vector3(player.x + player.width, player.y + player.height / 2, 0);
        const endPoint = new THREE.Vector3(player.x + player.width + whipSlashAttack.range, player.y + player.height / 2, 0);
        const points = [startPoint, endPoint];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x800080, linewidth: 10 }); // Purple color

        if (!whipObject) {
            whipObject = new THREE.Line(geometry, material);
            whipObject.name = whipName;
            scene.add(whipObject);
        } else {
            whipObject.geometry.setFromPoints(points);
            whipObject.geometry.needsUpdate = true;
        }
    } else if (whipObject) {
        scene.remove(whipObject);
    }
}
