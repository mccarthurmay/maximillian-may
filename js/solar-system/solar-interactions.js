// ===================================
// SOLAR SYSTEM INTERACTIONS
// Mouse hover, click, drag handling
// ===================================

import * as THREE from 'three';
import { camera, scene, planetMeshes, state, planetData } from './solar-scene.js';
import { showPlanetPreview } from './planet-preview.js';

// Raycaster for mouse picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Planet labels
let planetLabels = [];

// Drag state
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = 0;

// Initialize interactions
export function initInteractions() {
    const canvas = document.querySelector('#solar-canvas canvas');

    // Mouse events
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);

    // Touch events for mobile
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // Scroll for zoom
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Create planet labels
    createPlanetLabels();
}

// Create HTML labels for planets
function createPlanetLabels() {
    planetMeshes.forEach(planet => {
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = planet.userData.name;
        label.id = `label-${planet.userData.id}`;
        document.getElementById('solar-canvas').appendChild(label);
        planetLabels.push({ planet, element: label });
    });
}

// Update planet label positions
export function updatePlanetLabels() {
    planetLabels.forEach(({ planet, element }) => {
        // Project 3D position to 2D screen space
        const vector = planet.position.clone();
        vector.project(camera);

        // Convert to screen coordinates
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

        // Position label
        element.style.left = x + 'px';
        element.style.top = (y - 40) + 'px';

        // Show label if planet is hovered
        if (state.hoveredPlanet === planet.userData.id && state.mode === 'overview') {
            element.classList.add('visible');
        } else {
            element.classList.remove('visible');
        }
    });
}

// Mouse move handler
function onMouseMove(event) {
    // Update mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Handle drag rotation - account for tilted perspective
    if (isDragging && state.mode === 'overview') {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        cameraAngle -= deltaX * 0.005;

        // Get current camera distance (maintains zoom level)
        const currentDist = Math.sqrt(
            state.cameraTarget.x ** 2 +
            state.cameraTarget.z ** 2
        );
        const currentHeight = state.cameraTarget.y;

        // Rotate around center while maintaining tilt
        state.cameraTarget.x = Math.sin(cameraAngle) * currentDist;
        state.cameraTarget.z = Math.cos(cameraAngle) * currentDist;
        state.cameraTarget.y = currentHeight;  // Keep same height
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };

    // Check for planet hover (only in overview mode)
    if (state.mode === 'overview') {
        checkPlanetHover();
    }
}

// Mouse click handler
function onMouseClick(event) {
    if (isDragging) return; // Don't trigger click if we were dragging

    if (state.mode === 'overview') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const planet = intersects[0].object;
            onPlanetClick(planet);
        }
    }
}

// Mouse down
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

// Mouse up
function onMouseUp(event) {
    isDragging = false;
}

// Touch handlers
function onTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };

        // Update mouse for raycasting
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

function onTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        const touch = event.touches[0];

        if (isDragging && state.mode === 'overview') {
            const deltaX = touch.clientX - previousMousePosition.x;

            cameraAngle -= deltaX * 0.005;

            // Get current camera distance (maintains zoom level)
            const currentDist = Math.sqrt(
                state.cameraTarget.x ** 2 +
                state.cameraTarget.z ** 2
            );
            const currentHeight = state.cameraTarget.y;

            // Rotate around center while maintaining tilt
            state.cameraTarget.x = Math.sin(cameraAngle) * currentDist;
            state.cameraTarget.z = Math.cos(cameraAngle) * currentDist;
            state.cameraTarget.y = currentHeight;
        }

        previousMousePosition = {
            x: touch.clientX,
            y: touch.clientY
        };

        // Update mouse for raycasting
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

function onTouchEnd(event) {
    event.preventDefault();
    isDragging = false;

    // Check for planet click
    if (state.mode === 'overview') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const planet = intersects[0].object;
            onPlanetClick(planet);
        }
    }
}

// Scroll/wheel handler for zoom
function onWheel(event) {
    event.preventDefault();

    if (state.mode === 'overview') {
        const delta = event.deltaY;
        const zoomSpeed = 0.05;

        // Adjust camera height for tilted zoom
        let newHeight = state.cameraTarget.y + delta * zoomSpeed;
        newHeight = Math.max(15, Math.min(40, newHeight)); // Clamp between 15 and 40

        state.cameraTarget.y = newHeight;
    }
}

// Check which planet is being hovered
function checkPlanetHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const planet = intersects[0].object;
        const planetId = planet.userData.id;

        if (state.hoveredPlanet !== planetId) {
            // Clear previous hover
            if (state.hoveredPlanet) {
                const prevPlanet = planetMeshes.find(p => p.userData.id === state.hoveredPlanet);
                if (prevPlanet) {
                    prevPlanet.scale.setScalar(1.0);
                }
            }

            // Set new hover
            state.hoveredPlanet = planetId;
            planet.scale.setScalar(1.15);

            // Change cursor
            document.querySelector('#solar-canvas canvas').style.cursor = 'pointer';
        }
    } else {
        // No hover
        if (state.hoveredPlanet) {
            const prevPlanet = planetMeshes.find(p => p.userData.id === state.hoveredPlanet);
            if (prevPlanet) {
                prevPlanet.scale.setScalar(1.0);
            }
            state.hoveredPlanet = null;

            // Reset cursor
            document.querySelector('#solar-canvas canvas').style.cursor = 'grab';
        }
    }
}

// Handle planet click
function onPlanetClick(planet) {
    console.log('Clicked planet:', planet.userData.name);

    state.selectedPlanet = planet.userData;
    state.mode = 'transitioning';

    // Zoom camera to planet
    const planetPos = planet.position.clone();
    const offset = new THREE.Vector3(0, 3, 8);
    state.cameraTarget.copy(planetPos).add(offset);

    // Fade other planets
    planetMeshes.forEach(p => {
        if (p !== planet) {
            p.material.opacity = 0.2;
            p.material.transparent = true;
        }
    });

    // After camera movement, show preview
    setTimeout(() => {
        state.mode = 'preview';
        showPlanetPreview(planet.userData);
    }, 1000);
}

// Reset to overview mode
export function resetToOverview() {
    state.mode = 'overview';
    state.selectedPlanet = null;
    state.hoveredPlanet = null;

    // Reset camera to tilted 2.5D view
    state.cameraTarget.set(0, 28, 15);
    cameraAngle = 0;

    // Reset all planet materials
    planetMeshes.forEach(p => {
        p.material.opacity = 1.0;
        p.material.transparent = false;
        p.scale.setScalar(1.0);
    });
}
