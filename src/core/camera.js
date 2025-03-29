import { player } from './player.js';
import { canvas, gameWorldWidth, gameWorldHeight, DEBUG_MODE } from './main.js';

export const camera = {
  x: 0,
  y: 0,
  width: 1200,
  height: 700
};

export function updateCamera() {
  camera.x = player.x - camera.width / 2;
  camera.y = player.y - camera.height / 2;

  if (camera.x < 0) camera.x = 0;
  if (camera.y < 0) camera.y = 0;
  if (camera.x > gameWorldWidth - camera.width) camera.x = gameWorldWidth - camera.width;
  if (camera.y > gameWorldHeight - camera.height) camera.y = gameWorldHeight - camera.height;
}