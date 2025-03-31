import * as THREE from '../../node_modules/three/build/three.module.js';
import { player } from '../core/player.js';
import { enemies, spawnEnemy } from '../core/enemy.js';
import { gameWorldWidth, gameWorldHeight, DEBUG_MODE } from '../core/main.js';
import { checkCollision3D } from '../utils/helpers.js';
import { dpsMeter } from '../core/game.js';

const hammerSize = 10;
const hammerColor = 'brown';
const hammerSpeed = 10;
const baseHammerDamage = 15;

const hammers = [];

export function throwHammers(playerMesh) {
    const numberOfHammers = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numberOfHammers; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const velocityX = Math.cos(angle) * hammerSpeed;
        const velocityY = Math.sin(angle) * hammerSpeed;

        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const hammerMesh = new THREE.Mesh(geometry, material);

        hammerMesh.position.copy(playerMesh.position);
        hammerMesh.userData = { velocityX, velocityY, lifetime: 100 };
        scene.add(hammerMesh);
        hammers.push(hammerMesh);
    }
}

export function updateHammers(scene) {
    for (let i = hammers.length - 1; i >= 0; i--) {
        const hammer = hammers[i];
        hammer.position.x += hammer.userData.velocityX;
        hammer.position.y += hammer.userData.velocityY;
        hammer.userData.lifetime--;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision3D(hammer, enemy.mesh)) {
                const damage = baseHammerDamage + player.STR;
                enemy.health -= damage;
                dpsMeter.recordDamage(damage);

                if (enemy.health <= 0) {
                    scene.remove(enemy.mesh);
                    enemies.splice(j, 1);
                    player.killCount++;
                    player.money += enemy.moneyWorth || 25;
                }

                scene.remove(hammer);
                hammers.splice(i, 1);
                break;
            }
        }

        if (hammer.userData.lifetime <= 0) {
            scene.remove(hammer);
            hammers.splice(i, 1);
        }
    }
}

export { hammers };