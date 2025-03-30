import * as THREE from '../../node_modules/three/build/three.module.js';

const scene = new THREE.Scene();

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Function to add a cube (you can expand this)
export function addCube(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
    return cube; // Return the cube if you need to reference it later
}

// Function to initialize the scene (if needed)
export function initializeScene() {
    // Add initial objects here
}

export { scene };