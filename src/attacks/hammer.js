import * as THREE from '../../node_modules/three/build/three.module.js';
import { player } from '../core/player.js';
import { enemies, spawnEnemy } from '../core/enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../core/main.js';
import { checkCollision } from '../utils/helpers.js';
import { dpsMeter } from '../core/game.js';

const hammerSize = 10;
const hammerColor = 'brown';
const hammerSpeed = 10;
const baseHammerDamage = 15; // Using baseHammerDamage for clarity

const hammers = [];

export function throwHammers() {
    const numberOfHammers = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numberOfHammers; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const velocityX = Math.cos(angle) * hammerSpeed;
        const velocityY = Math.sin(angle) * hammerSpeed;

        hammers.push({
            x: player.x + player.width / 2 - hammerSize / 2,
            y: player.y + player.height / 2 - hammerSize / 2,
            width: hammerSize,
            height: hammerSize,
            color: hammerColor,
            velocityX: velocityX,
            velocityY: velocityY,
            lifetime: 100
        });
    }
}

export function updateHammers() {
    if (!player.canThrowHammer) {
        player.hammerThrowTimer--;
        if (player.hammerThrowTimer <= 0) {
            player.canThrowHammer = true;
        }
    }

    for (let i = hammers.length - 1; i >= 0; i--) {
        const hammer = hammers[i];
        hammer.x += hammer.velocityX;
        hammer.y += hammer.velocityY;
        hammer.lifetime--;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(hammer, enemy)) {
                const damage = baseHammerDamage + player.STR; // Damage scales with STR
                enemy.health -= damage;
                dpsMeter.recordDamage(damage);
                hammers.splice(i, 1);
                if (enemy.health <= 0) {
                    const moneyWorth = enemy.moneyWorth || 25; // Get the enemy's money worth
                    enemies.splice(j, 1);
                    // No spawning of a new enemy - the enemy is shattered!
                    player.killCount++; // Increment kill count
                    player.money += moneyWorth; // Add the money worth of the defeated enemy
                }
                break;
            }
        }

        if (hammer.lifetime <= 0 ||
            hammer.x < -hammerSize ||
            hammer.x > gameWorldWidth ||
            hammer.y < -hammerSize ||
            hammer.y > gameWorldHeight) {
            hammers.splice(i, 1);
        }
    }
}

export function drawHammers(ctx) {
    for (const hammer of hammers) {
        ctx.fillStyle = hammer.color;
        ctx.fillRect(hammer.x, hammer.y, hammer.width, hammer.height);
    }
}

// New function to update hammers in the 3D scene
export function updateHammersInScene(scene) {
    // Iterate through your active hammers
    hammers.forEach(hammerInstance => {
        let hammerObject = scene.getObjectByName(`hammer-${hammerInstance.lifetime}`); // Using lifetime as a temporary unique identifier

        if (hammerInstance.lifetime > 0 && !hammerObject) {
            // Create a 3D hammer object if it doesn't exist
            const geometry = new THREE.BoxGeometry(0.5, 1, 0.5); // Example size
            const material = new THREE.MeshBasicMaterial({ color: 0x808080 }); // Gray color
            hammerObject = new THREE.Mesh(geometry, material);
            hammerObject.name = `hammer-${hammerInstance.lifetime}`;
            hammerObject.position.set(hammerInstance.x, hammerInstance.y, 0); // Adjust z
            scene.add(hammerObject);
        } else if (hammerInstance.lifetime > 0 && hammerObject) {
            // Update the position of the existing 3D hammer
            hammerObject.position.set(hammerInstance.x, hammerInstance.y, 0); // Adjust z
            // You might also need to update rotation or other properties
        } else if (hammerInstance.lifetime <= 0 && hammerObject) {
            // Remove the 3D hammer from the scene if its lifetime has expired
            scene.remove(hammerObject);
        }
    });

    // Clean up any removed hammers from the scene
    const sceneHammers = scene.children.filter(obj => obj.name.startsWith('hammer-'));
    sceneHammers.forEach(sceneHammer => {
        const hammerId = parseInt(sceneHammer.name.split('-')[1]);
        if (!hammers.some(hammer => hammer.lifetime === hammerId)) {
            scene.remove(sceneHammer);
        }
    });
}

export { hammers };