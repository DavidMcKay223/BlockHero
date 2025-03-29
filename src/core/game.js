import { handlePlayerInput, player, updatePlayerCooldowns } from './player.js';
import { updateCamera, camera } from './camera.js';
import * as hammer from '../attacks/hammer.js';
import * as punch from '../attacks/punch.js';
import * as chainLightning from '../attacks/chainLightning.js';
import * as whipSlash from '../attacks/whipSlash.js';
import * as enemy from './enemy.js';
import * as novaAttack from '../attacks/nova.js';
import { righteousFireInstance, DEBUG_MODE } from './main.js';
import { drawArcaneExplosions } from '../talents/arcaneExplosion.js';

export function update() {
  handlePlayerInput();
  updatePlayerCooldowns();
  punch.handlePunchAttack();
  chainLightning.handleChainLightningAttack();
  whipSlash.handleWhipSlashAttack();
  novaAttack.handleNovaAttack(); // Update nova attack projectiles
  updateCamera();
  hammer.updateHammers();
}

export function draw(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  ctx.fillStyle = 'lightgray';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

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
  drawArcaneExplosions(ctx); // Call drawArcaneExplosions
  ctx.restore(); // Restore the camera translation
}
