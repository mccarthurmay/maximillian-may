// ===================================
// MAIN - Entry point and animation loop
// ===================================

import * as THREE from 'three';
import { scene, camera, renderer, labelRenderer, characterGroup, setupWindowResize } from './scene.js';
import { addLightingToScene, updateDayNightCycle, getSunDirection, dayNightAngle } from './lighting.js';
import { addEnvironmentToScene, updateClouds, updateStarsOpacity, atmosphereMaterial } from './environment.js';
import { loadCharacter, updateCharacterAnimations } from './character.js';
import { updatePhysics, physics } from './physics.js';
import { PerformanceManager } from './performance.js';
import { setupSpotifyPlayer, setupTimeControls, setupEscapeMenu, updateCoordinatesDisplay, introActive } from './ui.js';
import { loadWorld, updateSignLabels } from './world.js';
import { setupControls, handleMovement, updateCamera, detachedCamera } from './controls.js';
import { FIXED_TIMESTEP, CAMERA_HEIGHT, CAMERA_DISTANCE_IDLE, SPAWN_HEIGHT } from './config.js';

// Initialize performance manager
const performanceManager = new PerformanceManager();

// Clock for timing
const clock = new THREE.Clock();

// Fixed timestep physics accumulator
let physicsAccumulator = 0;

// Initialize the application
async function init() {
    console.log('Initializing Max\'s World...');

    // Setup initial camera position
    camera.position.set(0, SPAWN_HEIGHT + CAMERA_HEIGHT, -CAMERA_DISTANCE_IDLE);
    camera.lookAt(0, SPAWN_HEIGHT, 0);

    // Setup scene components
    addLightingToScene(scene);
    addEnvironmentToScene(scene);

    // Setup UI
    setupSpotifyPlayer();
    setupTimeControls();
    setupEscapeMenu(performanceManager);
    setupControls(performanceManager);
    setupWindowResize();

    // Load assets
    try {
        await loadWorld();
        await loadCharacter();
        console.log('All assets loaded successfully!');
    } catch (error) {
        console.error('Error loading assets:', error);
        return;
    }

    // Start animation loop
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Clamp deltaTime to prevent huge physics jumps during lag
    let deltaTime = clock.getDelta();
    deltaTime = Math.min(deltaTime, 0.1); // Cap at 100ms (10 FPS minimum)
    const time = clock.getElapsedTime();

    // Update performance manager
    performanceManager.update(deltaTime);

    // Update character animations
    updateCharacterAnimations(deltaTime, physics);

    // Day/night cycle
    const sunY = updateDayNightCycle(deltaTime);

    // Update atmosphere shader with sun direction
    const sunDir = getSunDirection();
    atmosphereMaterial.uniforms.sunDirection.value.copy(sunDir);

    // Fade stars based on sun position
    updateStarsOpacity(sunY);

    // Animate clouds
    updateClouds(time, sunDir, performanceManager);

    // Gameplay
    if (!introActive) {
        // Handle jump charge-up delay
        if (physics.jumpCharging) {
            physics.jumpChargeTime += deltaTime;
            const jumpChargeDelay = 0.3; // 300ms charge-up delay

            if (physics.jumpChargeTime >= jumpChargeDelay) {
                // Execute the jump after charge-up
                physics.velocity.y = physics.jumpForce;
                physics.isGrounded = false;
                physics.jumpCharging = false;
            }
        }

        // Fixed timestep physics accumulator
        physicsAccumulator += deltaTime;
        while (physicsAccumulator >= FIXED_TIMESTEP) {
            updatePhysics(FIXED_TIMESTEP, introActive);
            physicsAccumulator -= FIXED_TIMESTEP;
        }

        // Update coordinates display
        updateCoordinatesDisplay(characterGroup.position);

        // Handle movement
        handleMovement(deltaTime);

        // Update camera
        updateCamera(time);

        // Update sign labels
        updateSignLabels(detachedCamera);
    }

    // Render
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Start the application
init();
