import { DEBUG_MODE } from '../main.js';
import { player } from '../player.js';
import { enemies } from '../enemy.js';
import { canvas } from '../main.js'; // Import canvas

let mouseX;
let mouseY;

document.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
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

export function performArcaneExplosion(startX, startY, canvasElement) { // Add canvasElement parameter
    if (DEBUG_MODE) console.log("Performing Arcane Explosion towards:", mouseX, mouseY);

    for (let i = 0; i < numOrbs; i++) {
        const orb = {
            x: startX,
            y: startY,
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
            orb.trail.push({ x: orb.x, y: orb.y });
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
    if (DEBUG_MODE) console.log("Orb exploded at:", orb.x, orb.y);
    orb.hasExploded = true;
    orb.cascades = []; // Initialize the cascades array.  IMPORTANT
    orb.explosionTime = 0; // Initialize explosion time
    // Apply initial damage
    applyExplosionDamage(orb.x, orb.y, initialExplosionRadius, orbDamage);
    // Further cascading explosions will be handled in updateArcaneExplosions
}

function cascadeExplosion(parentOrb, orbsArray, sourceOrb) { // Added sourceOrb
    if (DEBUG_MODE) console.log("Cascading explosion from:", parentOrb.x, parentOrb.y, "Cascade:", parentOrb.cascadeCount);
    const numSmallExplosions = 3; // Number of smaller explosions per cascade
    for (let i = 0; i < numSmallExplosions; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * initialExplosionRadius / 2; // Spread them out a bit
        const explosionX = parentOrb.x + Math.cos(angle) * distance;
        const explosionY = parentOrb.y + Math.sin(angle) * distance;
        applyExplosionDamage(explosionX, explosionY, cascadeExplosionRadius, cascadeDamage);

        // Optionally create visual "shards"
        const shard = {
            x: explosionX,
            y: explosionY,
            radius: 12, // Increased radius
            lifespan: shardLifespan, // Frames
            vx: Math.cos(angle) * 3, // Increased speed
            vy: Math.sin(angle) * 3,  // Increased speed
            isShard: true,
            trail: [], // give each shard its own trail.
        };
        shard.trail.push({ x: explosionX, y: explosionY });
        orbsArray.push(shard);
    }
}

function applyExplosionDamage(x, y, radius, damage) {
    if (DEBUG_MODE) console.log(`Applying explosion damage (${damage}) at:`, x, y, "Radius:", radius);
    for (const enemy of enemies) {
        const dx = x - (enemy.x + enemy.width / 2);
        const dy = y - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
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

export function drawArcaneExplosions(ctx, initialExplosionRadius) {
    if (!ctx) return;
    for (let i = 0; i < player.arcaneExplosionOrbs.length; i++) {
        const orb = player.arcaneExplosionOrbs[i];
        if (!orb) continue; // added null check
        // Draw orb
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'lightblue';
        ctx.fill();
        ctx.closePath();

        // Draw trail
        ctx.beginPath();
        ctx.strokeStyle = 'skyblue';
        ctx.lineWidth = 2;
        if (orb.trail && orb.trail.length > 0) {
            ctx.moveTo(orb.trail[0]?.x, orb.trail[0]?.y);
            for (let i = 1; i < orb.trail.length; i++) {
                ctx.lineTo(orb.trail[i].x, orb.trail[i].y);
            }
            ctx.stroke();
        }
        ctx.closePath();

        // Optionally draw explosion visuals
        if (orb.hasExploded) {
            // Draw a larger, expanding circle
            const explosionRadius = initialExplosionRadius * (1 + orb.explosionTime / 10); // Expand over time
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, explosionRadius, 0, Math.PI * 2);
            const alpha = Math.max(0, 1 - orb.explosionTime / explosionDuration); // Fade out
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha / 2})`; // fill with half the alpha
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
        if (orb.isShard) {
            // Draw orb
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'lightyellow';
            ctx.fill();
            ctx.closePath();

            // Draw trail
            ctx.beginPath();
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2.5; // Increased line width
            if (orb.trail && orb.trail.length > 0) {
                ctx.moveTo(orb.trail[0]?.x, orb.trail[0]?.y);
                for (let i = 1; i < orb.trail.length; i++) {
                    ctx.lineTo(orb.trail[i].x, orb.trail[i].y);
                }
                ctx.stroke();
            }
            ctx.closePath();
        }
    }
}
