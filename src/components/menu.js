import { player } from '../core/player.js';
import { DEBUG_MODE } from '../core/main.js';

export const attackMenu = document.getElementById('attackMenu');
export const leftClickAttackSelect = document.getElementById('leftClickAttack');
export const rightClickAttackSelect = document.getElementById('rightClickAttack');
export const closeMenuButton = document.getElementById('closeMenuButton');
let menuOpen = false;

export function toggleMenu() {
    menuOpen = !menuOpen;
    if (attackMenu) {
        attackMenu.style.display = menuOpen ? 'flex' : 'none';
    }
    if (menuOpen) {
        if (leftClickAttackSelect) {
            leftClickAttackSelect.value = player.selectedLeftClickAttack;
        }
        if (rightClickAttackSelect) {
            rightClickAttackSelect.value = player.selectedRightClickAttack;
        }
    }
}

if (leftClickAttackSelect) {
    leftClickAttackSelect.addEventListener('change', (event) => {
        player.selectedLeftClickAttack = event.target.value;
        if (DEBUG_MODE) console.log('Left click attack selected:', player.selectedLeftClickAttack);
    });
}

if (rightClickAttackSelect) {
    rightClickAttackSelect.addEventListener('change', (event) => {
        player.selectedRightClickAttack = event.target.value;
        if (DEBUG_MODE) console.log('Right click attack selected:', player.selectedRightClickAttack);
    });
}

if (closeMenuButton) {
    closeMenuButton.addEventListener('click', () => {
        toggleMenu();
    });
}