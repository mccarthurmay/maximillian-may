// ===================================
// SOLAR SYSTEM MAIN ENTRY POINT
// Max's Solar System Portfolio
// ===================================

import {
    initScene,
    updatePlanetPositions,
    updateCamera,
    renderer,
    scene,
    camera
} from './solar-scene.js';

import {
    initInteractions,
    updatePlanetLabels
} from './solar-interactions.js';

import {
    initPreviewSystem
} from './planet-preview.js';

// Animation state
let lastTime = 0;

// Initialize everything
function init() {
    // Initialize scene
    initScene();

    // Initialize interactions (mouse, touch, click)
    initInteractions();

    // Initialize preview system
    initPreviewSystem();

    // Start animation loop
    animate(0);

    // Log ready
    console.log('Max\'s Solar System initialized');
}

// Main animation loop
function animate(currentTime) {
    requestAnimationFrame(animate);

    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update planet positions (orbits)
    updatePlanetPositions(deltaTime);

    // Update camera (smooth movement)
    updateCamera(deltaTime);

    // Update planet labels
    updatePlanetLabels();

    // Render scene
    renderer.render(scene, camera);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
