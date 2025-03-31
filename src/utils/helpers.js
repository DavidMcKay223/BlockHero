import * as THREE from 'three';

// 2D Collision Check (for enemy spawning)
export function checkCollision2D(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Updated 3D Collision Check to use Three.js bounding boxes
export function checkCollision3D(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}

export function getClosestEnemy3D(player, enemyArray) {
    let closestEnemy = null;
    let minDistance = Infinity;

    for (const enemy of enemyArray) {
        // Get enemy position from the mesh
        const enemyX = enemy.position.x;
        const enemyY = enemy.position.y;
        const enemyZ = enemy.position.z;

        const dx = player.position.x - enemyX;
        const dy = player.position.y - enemyY;
        const dz = player.position.z - enemyZ;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = enemy; // Store the enemy mesh
        }
    }

    return closestEnemy;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function distance3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
}