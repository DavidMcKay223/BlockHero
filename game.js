import { handlePlayerInput, player, updatePlayerCooldowns } from './player.js'; // Import the new function
import { updateCamera, camera } from './camera.js';
import * as hammer from './AttackStyle/hammer.js';
import * as punch from './AttackStyle/punch.js';
import * as chainLightning from './AttackStyle/chainLightning.js';
import * as whipSlash from './AttackStyle/whipSlash.js';
import * as enemy from './enemy.js';

export function update() {
  handlePlayerInput();
  updatePlayerCooldowns(); // Call the cooldown update function
  punch.handlePunchAttack();
  chainLightning.handleChainLightningAttack();
  whipSlash.handleWhipSlashAttack(); // Still call this for visual effect timing
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

  enemy.drawEnemies(ctx);
  hammer.drawHammers(ctx);
  chainLightning.drawChainLightning(ctx);
  whipSlash.drawWhipSlash(ctx);

  ctx.restore();
}