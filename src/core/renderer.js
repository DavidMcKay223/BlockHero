import * as THREE from '../../node_modules/three/build/three.module.js';
import { scene } from './scene.js';
import { camera } from './camera.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const gameContainer = document.getElementById('gameContainer');
gameContainer.appendChild(renderer.domElement);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function handleResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

window.addEventListener('resize', handleResize);

// Call this function to start the rendering loop
export function startRendering() {
    render();
}

export { renderer };