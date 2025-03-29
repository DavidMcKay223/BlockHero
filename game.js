import { handlePlayerInput, initiateAttack, player, keys, mouseClick, e } from './player.js';
import { updateCamera, camera } from './camera.js';
import * as hammer from './AttackStyle/hammer.js';
import * as punch from './AttackStyle/punch.js';
import * as enemy from './enemy.js';

export function update() {
  handlePlayerInput();
  punch.handlePunchAttack();
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

  ctx.restore();
}