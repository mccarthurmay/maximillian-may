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
    camera,
    state
} from './solar-scene.js';

import {
    initInteractions,
    updatePlanetLabels
} from './solar-interactions.js';

import {
    initPreviewSystem,
    updatePreviewCamera
} from './planet-preview.js';

// Animation state
let lastTime = 0;

// Loading screen management
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');

let loadingProgress = 0;

// Update loading progress
function updateLoadingProgress(progress, text) {
    loadingProgress = progress;
    loadingBar.style.width = `${progress}%`;
    if (text) {
        loadingText.textContent = text;
    }
}

// Hide loading screen
function hideLoadingScreen() {
    updateLoadingProgress(100, 'Complete!');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation
        setTimeout(() => {
            loadingScreen.remove();
        }, 800);
    }, 500);
}

// Initialize everything
async function init() {
    try {
        updateLoadingProgress(10, 'Initializing scene...');

        // Initialize scene
        initScene();
        updateLoadingProgress(40, 'Creating planets...');

        // Small delay to let scene render
        await new Promise(resolve => setTimeout(resolve, 300));
        updateLoadingProgress(60, 'Setting up interactions...');

        // Initialize interactions (mouse, touch, click)
        initInteractions();
        updateLoadingProgress(80, 'Finalizing...');

        // Initialize preview system
        initPreviewSystem();
        updateLoadingProgress(90, 'Ready!');

        // Small delay before hiding
        await new Promise(resolve => setTimeout(resolve, 200));

        // Hide loading screen
        hideLoadingScreen();

        // Start animation loop
        animate(0);

        // Log ready
        console.log('Max\'s Solar System initialized');
    } catch (error) {
        console.error('Error initializing solar system:', error);
        loadingText.textContent = 'Error loading. Please refresh.';
        loadingText.style.color = '#ff6b6b';
    }
}

// Main animation loop
function animate(currentTime) {
    requestAnimationFrame(animate);

    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update planet positions (orbits)
    updatePlanetPositions(deltaTime);

    // Update preview camera (follows planet if in preview mode)
    updatePreviewCamera(camera, state);

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
