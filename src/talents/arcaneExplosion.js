import { DEBUG_MODE } from '../core/main.js';
import { player } from '../core/player.js';
import { enemies } from '../core/enemy.js';

let mouseX;
let mouseY;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX; // Get mouse X directly from the event
    mouseY = event.clientY; // Get mouse Y directly from the event
});

const numOrbs = 5; // Number of orbs to launch
const orbSpeed = 3;
export const initialExplosionRadius = 50; // Decreased radius for initial
const numCascades = 2;
const cascadeExplosionRadius = 150; // Increased radius for cascade
const orbDamage = 20; // Increased damage
const cascadeDamage = 12; // Increased damage
const explosionDuration = 50; // Shortened duration in frames for initial
const shardLifespan = 30;

export function performArcaneExplosion(startX, startY, startZ) { // Added startZ parameter
    if (DEBUG_MODE) console.log("Performing Arcane Explosion towards:", mouseX, mouseY);

    for (let i = 0; i < numOrbs; i++) {
        const orb = {
            x: startX,
            y: startY,
            z: startZ, // Use the player's z position
            targetX: mouseX, // Target cursor position
            targetY: mouseY,
            speed: orbSpeed,
            radius: 12, // Increased radius
            trail: [], // For visual effect
            hasExploded: false,
            cascadeCount: 0,
            isShard: false, //Added isShard property
            explosionTime: 0, // Add explosion time counter
        };
        player.arcaneExplosionOrbs.push(orb);
    }
}

export function updateArcaneExplosions(orbsArray) { // Added orbsArray as parameter
    if (!orbsArray) return;
    for (let i = orbsArray.length - 1; i >= 0; i--) {
        const orb = orbsArray[i];
        if (!orb) continue;

        if (!orb.hasExploded) {
            const dx = orb.targetX - orb.x;
            const dy = orb.targetY - orb.y;
            const angle = Math.atan2(dy, dx);

            orb.x += Math.cos(angle) * orb.speed;
            orb.y += Math.sin(angle) * orb.speed;

            // Simple "reached target" check
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
            if (distanceToTarget < 10) { // Adjust this threshold
                explodeOrb(orb, orbsArray);
            }

            // Add trail for visual effect
            orb.trail.push({ x: orb.x, y: orb.y, z: orb.z }); // Include z in trail
            if (orb.trail.length > 10) {
                orb.trail.shift();
            }
        } else if (orb.hasExploded && orb.cascadeCount < numCascades) {
            cascadeExplosion(orb, orbsArray, orb); // Pass the orb
            orb.cascadeCount++;
        } else if (orb.hasExploded && orb.explosionTime < explosionDuration) { // Use explosionTime
            orb.explosionTime++;
        }
        else if (orb.hasExploded && orb.cascadeCount >= numCascades) {
            orbsArray.splice(i, 1); // Remove orb after cascades
        }
        else if (orb.isShard) {
            orb.lifespan--;
            orb.x += orb.vx;
            orb.y += orb.vy;
            if (orb.lifespan <= 0) {
                orbsArray.splice(i, 1);
            }
        }
    }
}

function explodeOrb(orb, orbsArray) {
    if (DEBUG_MODE) console.log("Orb exploded at:", orb.x, orb.y, orb.z);
    orb.hasExploded = true;
    orb.cascades = []; // Initialize the cascades array.  IMPORTANT
    orb.explosionTime = 0; // Initialize explosion time
    // Apply initial damage
    applyExplosionDamage(orb.x, orb.y, orb.z, initialExplosionRadius, orbDamage); // Include z
    // Further cascading explosions will be handled in updateArcaneExplosions
}

function cascadeExplosion(parentOrb, orbsArray, sourceOrb) { // Added sourceOrb
    if (DEBUG_MODE) console.log("Cascading explosion from:", parentOrb.x, parentOrb.y, parentOrb.z, "Cascade:", parentOrb.cascadeCount);
    const numSmallExplosions = 3; // Number of smaller explosions per cascade
    for (let i = 0; i < numSmallExplosions; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * initialExplosionRadius / 2; // Spread them out a bit
        const explosionX = parentOrb.x + Math.cos(angle) * distance;
        const explosionY = parentOrb.y + Math.sin(angle) * distance;
        const explosionZ = parentOrb.z; // Keep the same z for now
        applyExplosionDamage(explosionX, explosionY, explosionZ, cascadeExplosionRadius, cascadeDamage); // Include z

        // Optionally create visual "shards"
        const shard = {
            x: explosionX,
            y: explosionY,
            z: explosionZ,
            radius: 12, // Increased radius
            lifespan: shardLifespan, // Frames
            vx: Math.cos(angle) * 3, // Increased speed
            vy: Math.sin(angle) * 3,  // Increased speed
            isShard: true,
            trail: [], // give each shard its own trail.
        };
        shard.trail.push({ x: explosionX, y: explosionY, z: explosionZ }); // Include z
        orbsArray.push(shard);
    }
}

function applyExplosionDamage(x, y, z, radius, damage) { // Include z
    if (DEBUG_MODE) console.log(`Applying explosion damage (${damage}) at:`, x, y, z, "Radius:", radius);
    for (const enemy of enemies) {
        const dx = x - (enemy.x + enemy.width / 2);
        const dy = y - (enemy.y + enemy.height / 2);
        const dz = z - (enemy.z || 0); // Assuming enemies might have a z position
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < radius) {
            if (DEBUG_MODE) console.log("Enemy hit by explosion:", enemy);
            enemy.health -= damage;
            if (enemy.health <= 0) {
                const index = enemies.indexOf(enemy);
                if (index > -1) {
                    enemies.splice(index, 1);
                    player.killCount++;
                    player.money += enemy.moneyWorth;
                    if (DEBUG_MODE) console.log("Enemy killed by explosion.");
                }
            }
        }
    }
}
