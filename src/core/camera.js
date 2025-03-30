import * as THREE from '../../node_modules/three/build/three.module.js';
import { player } from './player.js';

// Create a 3D Perspective Camera
const fov = 75; // Field of view
const aspect = window.innerWidth / window.innerHeight; // Aspect ratio
const near = 0.1; // Near clipping plane
const far = 1000; // Far clipping plane
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

// Initial camera position (adjust as needed)
camera.position.set(0, 5, 10); // Example: Slightly above and behind the origin
camera.lookAt(0, 0, 0); // Initially look at the origin

export function updateCamera() {
    // Example: Follow the player with a fixed offset
    const offsetX = 0;
    const offsetY = 5;
    const offsetZ = 10;

    camera.position.x = player.x + offsetX;
    camera.position.y = player.y + offsetY;
    camera.position.z = player.z + offsetZ; // Assuming your player has a z position now

    // Make the camera look at the player (you might adjust the target offset)
    camera.lookAt(player.x, player.y + 1, player.z); // Look slightly above the player
}

// You'll likely need to call this function when the window resizes in your renderer
export function updateCameraAspect() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}