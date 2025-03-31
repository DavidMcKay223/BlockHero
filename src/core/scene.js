import * as THREE from 'three';

const scene = new THREE.Scene();

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Create a manual grid helper on the X-Z plane (ground)
const size = 50; // Total size of the grid
const divisions = 50; // Number of grid lines
const step = size / divisions;
const halfSize = size / 2;
const gridColor = new THREE.Color(0x444444); // Dark gray color for the grid

const gridGeometryXZ = new THREE.BufferGeometry();
const gridVerticesXZ = [];

for (let i = 0; i <= divisions; i++) {
    const line = i * step - halfSize;

    // Vertical lines (along X axis)
    gridVerticesXZ.push(-halfSize, 0, line);
    gridVerticesXZ.push(halfSize, 0, line);

    // Horizontal lines (along Z axis)
    gridVerticesXZ.push(line, 0, -halfSize);
    gridVerticesXZ.push(line, 0, halfSize);
}

gridGeometryXZ.setAttribute('position', new THREE.Float32BufferAttribute(gridVerticesXZ, 3));
const gridMaterialXZ = new THREE.LineBasicMaterial({ color: gridColor });
const lineSegmentsXZ = new THREE.LineSegments(gridGeometryXZ, gridMaterialXZ);
scene.add(lineSegmentsXZ);

// Create a manual grid helper on the Y-Z plane (for depth)
const gridGeometryYZ = new THREE.BufferGeometry();
const gridVerticesYZ = [];

for (let i = 0; i <= divisions; i++) {
    const line = i * step - halfSize;

    // Vertical lines (along Y axis)
    gridVerticesYZ.push(0, -halfSize, line);
    gridVerticesYZ.push(0, halfSize, line);

    // Horizontal lines (along Z axis)
    gridVerticesYZ.push(0, line, -halfSize);
    gridVerticesYZ.push(0, line, halfSize);
}

gridGeometryYZ.setAttribute('position', new THREE.Float32BufferAttribute(gridVerticesYZ, 3));
const gridMaterialYZ = new THREE.LineBasicMaterial({ color: new THREE.Color(0x666666) }); // Slightly lighter color
const lineSegmentsYZ = new THREE.LineSegments(gridGeometryYZ, gridMaterialYZ);
scene.add(lineSegmentsYZ);

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
