import * as THREE from '../../node_modules/three/build/three.module.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { player } from './player.js';
import { renderer } from './renderer.js'; // Import the renderer

// Camera setup
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
export const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

// Initial camera position (angled view)
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// OrbitControls setup
let controls;
export function initControls() { // Removed renderer argument
    controls = new OrbitControls(camera, renderer.domElement); // Use the imported renderer

    // Customize controls behavior
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Keep panning aligned with world Y-axis
    controls.minDistance = 5; // Minimum zoom distance
    controls.maxDistance = 50; // Maximum zoom distance
    controls.maxPolarAngle = Math.PI * 0.9; // Prevent camera from going directly overhead

    // Set initial target to player position
    controls.target.set(player.x, player.y, player.z);
}

export function updateCamera() {
    if (controls) { // Check if controls is initialized
        // Update controls target to follow player
        controls.target.set(player.x, player.y, player.z);

        // Required if controls.enableDamping is true
        controls.update();
    }
}

export function updateCameraAspect() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// Cleanup function for when you dispose your scene
export function disposeControls() {
    if (controls) {
        controls.dispose();
    }
}
