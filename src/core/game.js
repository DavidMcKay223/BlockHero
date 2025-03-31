import * as THREE from 'three';
import { handlePlayerInput, player, updatePlayerCooldowns } from './player.js';
import { updateCamera, camera } from './camera.js';
import * as hammer from '../attacks/hammer.js';
import * as punch from '../attacks/punch.js';
import * as chainLightning from '../attacks/chainLightning.js';
import * as whipSlash from '../attacks/whipSlash.js';
import * as enemy from './enemy.js';
import * as novaAttack from '../attacks/nova.js';
import { righteousFireInstance, DEBUG_MODE, scene } from './main.js'; // Import scene
// import { drawArcaneExplosions } from '../talents/arcaneExplosion.js'; // Removed import
import { isStatBoostActive } from '../talents/statBoost.js';
import { player as playerData } from './player.js'; // Import player data

const dpsMeter = {
    damageLog: [], // Array to store { timestamp: number, damage: number }
    lastDisplayTime: 0,
    displayDuration: 3 * 60, // 3 seconds in game ticks (assuming 60 ticks per second)
    currentDPS: 0,

    recordDamage(damage) {
        const now = Date.now();
        this.damageLog.push({ timestamp: now, damage });
        this.lastDisplayTime = now;
    },

    calculateDPS() {
        const now = Date.now();
        const threeSecondsAgo = now - 8000; // 3000 milliseconds
        this.damageLog = this.damageLog.filter(entry => entry.timestamp >= threeSecondsAgo);

        let totalDamage = 0;
        for (const entry of this.damageLog) {
            totalDamage += entry.damage;
        }

        this.currentDPS = totalDamage / 3; // Damage over the last 3 seconds
    },

    draw(ctx) {
      const now = Date.now();
      if (now - this.lastDisplayTime < this.displayDuration) {
            this.calculateDPS();

            const playerCenterX = player.x + player.width / 2;
            const playerBottomY = player.y + player.height;
            const textOffset = 20; // Adjust this value to control the distance below the player

            const colors = ['red', 'blue', 'green', 'yellow'];
            const randomIndex = Math.floor(Math.random() * colors.length);
            ctx.fillStyle = colors[randomIndex];

            ctx.font = '16px Arial';
            const text = `DPS: ${Math.floor(this.currentDPS)}`;
            const textWidth = ctx.measureText(text).width;

            ctx.fillText(text, playerCenterX - textWidth / 2, playerBottomY + textOffset);
        }
    }
};

export function update() {
    handlePlayerInput();
    updatePlayerCooldowns();
    enemy.updateEnemies();

    // Update attacks
    hammer.updateHammers(scene);
    chainLightning.updateChainLightningInScene(scene);
    novaAttack.updateNovaAttackInScene(scene);
    updateArcaneExplosionsInScene(scene); // Ensure this is called
}

export function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    ctx.fillStyle = 'lightgray';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw the player
    if (isStatBoostActive) {
        // Draw the player with a glowing gold effect
        ctx.save(); // Save current context for the glow

        // Base player color (you can adjust this if you want a different base during boost)
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Add glowing gold outline
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 15;
        ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4); // Slightly larger to show glow

        ctx.restore(); // Restore context to remove glow for other elements
    } else {
        // Draw the player normally
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw the Righteous Fire radius
    if (righteousFireInstance.isActive) {
        ctx.save(); // Save the current context state

        const radius = 100;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, radius, 0, Math.PI * 2);

        // Fill the circle with a lighter color
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'; // Lighter, semi-transparent gold
        ctx.fill();

        // Style the circle outline
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)'; // Semi-transparent orange
        ctx.lineWidth = 4;
        ctx.stroke();

        // Add glowing effect (applied only to the circle now because of save/restore)
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 10;

        ctx.restore(); // Restore the context state, removing the global glow
    }

    enemy.drawEnemies(ctx);
    hammer.drawHammers(ctx);
    chainLightning.drawChainLightning(ctx);
    whipSlash.drawWhipSlash(ctx);
    novaAttack.drawNovaAttack(ctx);
    // drawArcaneExplosions(ctx); // Removed call to the 2D drawing function

    // Draw the DPS meter
    dpsMeter.draw(ctx);

    ctx.restore(); // Restore the camera translation
}

// Helper function to update Arcane Explosions in the 3D scene
function updateArcaneExplosionsInScene(scene) {
    if (playerData.arcaneExplosionOrbs && playerData.arcaneExplosionOrbs.length > 0) {
        playerData.arcaneExplosionOrbs.forEach(orb => {
            let explosionObject = scene.getObjectByName(`arcaneExplosion-${orb.id}`);

            if (!explosionObject) {
                // Create a 3D representation for the explosion
                const geometry = new THREE.SphereGeometry(orb.radius, 32, 32); // Example: Sphere
                const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 }); // Cyan, semi-transparent
                explosionObject = new THREE.Mesh(geometry, material);
                explosionObject.name = `arcaneExplosion-${orb.id}`;
                explosionObject.position.set(orb.x, orb.y, orb.z); // Adjust z
                scene.add(explosionObject);
            } else {
                // Update the existing explosion (e.g., size, opacity over time)
                // Assuming initialRadius is defined elsewhere or you can calculate it
                const initialRadius = 5; // Example initial radius
                explosionObject.scale.set(orb.radius / initialRadius, orb.radius / initialRadius, orb.radius / initialRadius); // Example scaling
                explosionObject.material.opacity = orb.opacity; // Example opacity change
            }

            // You might need to handle the removal of explosions when they are finished
            // if (orb.isFinished && explosionObject) {
            //     scene.remove(explosionObject);
            // }
        });
    }
}

export { handlePlayerInput, player, updatePlayerCooldowns, updateCamera, camera, dpsMeter };
