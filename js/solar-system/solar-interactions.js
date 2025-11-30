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
        // Check if label already exists
        if (!planetLabels.find(l => l.planet === planet)) {
            const label = document.createElement('div');
            label.className = 'planet-label';
            label.textContent = planet.userData.name;
            label.id = `label-${planet.userData.id}`;
            document.getElementById('solar-canvas').appendChild(label);
            planetLabels.push({ planet, element: label });
        }
    });
}

// Add a single planet label (for async loaded planets)
export function addPlanetLabel(planet) {
    if (!planetLabels.find(l => l.planet === planet)) {
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = planet.userData.name;
        label.id = `label-${planet.userData.id}`;
        document.getElementById('solar-canvas').appendChild(label);
        planetLabels.push({ planet, element: label });
        console.log('Added label for', planet.userData.name);
    }
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

        // Build objects list (same as hover detection)
        const allObjects = [];
        planetMeshes.forEach(planet => {
            if (planet.userData.id === 'portfolio') {
                planet.traverse(child => {
                    if (child.isMesh) {
                        allObjects.push(child);
                    }
                });
            } else {
                allObjects.push(planet);
            }
        });

        const intersects = raycaster.intersectObjects(allObjects, true);

        if (intersects.length > 0) {
            // Find the parent planet mesh
            let planet = intersects[0].object;
            while (planet.parent && !planet.userData.id) {
                planet = planet.parent;
            }
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

        // Build objects list (same as click detection)
        const allObjects = [];
        planetMeshes.forEach(planet => {
            if (planet.userData.id === 'portfolio') {
                planet.traverse(child => {
                    if (child.isMesh) {
                        allObjects.push(child);
                    }
                });
            } else {
                allObjects.push(planet);
            }
        });

        const intersects = raycaster.intersectObjects(allObjects, true);

        if (intersects.length > 0) {
            // Find the parent planet mesh
            let planet = intersects[0].object;
            while (planet.parent && !planet.userData.id) {
                planet = planet.parent;
            }
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

    // For portfolio planet, we need to raycast against all children meshes
    const allObjects = [];
    planetMeshes.forEach(planet => {
        if (planet.userData.id === 'portfolio') {
            // Add all children meshes of the 3D model
            planet.traverse(child => {
                if (child.isMesh) {
                    allObjects.push(child);
                }
            });
        } else {
            allObjects.push(planet);
        }
    });

    const intersects = raycaster.intersectObjects(allObjects, true);

    if (intersects.length > 0) {
        // Find the parent planet mesh
        let planet = intersects[0].object;
        while (planet.parent && !planet.userData.id) {
            planet = planet.parent;
        }

        const planetId = planet.userData.id;

        if (state.hoveredPlanet !== planetId) {
            // Clear previous hover
            if (state.hoveredPlanet) {
                clearPlanetHover(state.hoveredPlanet);
            }

            // Set new hover
            state.hoveredPlanet = planetId;
            applyPlanetHover(planet, planetId);

            // Change cursor
            document.querySelector('#solar-canvas canvas').style.cursor = 'pointer';
        }
    } else {
        // No hover
        if (state.hoveredPlanet) {
            clearPlanetHover(state.hoveredPlanet);
            state.hoveredPlanet = null;

            // Reset cursor
            document.querySelector('#solar-canvas canvas').style.cursor = 'grab';
        }
    }
}

// Apply hover effect to planet
function applyPlanetHover(planet, planetId) {
    const planetConfig = planetData.find(p => p.config.id === planetId);

    if (planetId === 'portfolio') {
        // For portfolio planet, scale based on original scale
        if (planetConfig) {
            planet.scale.setScalar(planetConfig.originalScale * 1.15);
        }
    } else {
        // Standard sphere planets
        planet.scale.setScalar(1.15);
    }
}

// Clear hover effect from planet
function clearPlanetHover(planetId) {
    const planet = planetMeshes.find(p => p.userData.id === planetId);
    const planetConfig = planetData.find(p => p.config.id === planetId);

    if (planet) {
        if (planetId === 'portfolio' && planetConfig) {
            // Restore original scale for portfolio planet
            planet.scale.setScalar(planetConfig.originalScale);
        } else {
            // Standard sphere planets
            planet.scale.setScalar(1.0);
        }
    }
}

// Handle planet click
function onPlanetClick(planet) {
    console.log('Clicked planet:', planet.userData.name);

    state.selectedPlanet = planet.userData;
    state.mode = 'preview';

    // Immediately show preview - camera will follow planet
    showPlanetPreview(planet.userData, planet);

    // Dim other planets
    planetMeshes.forEach(p => {
        if (p !== planet) {
            if (p.userData.id === 'portfolio') {
                p.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.opacity = 0.2;
                        child.material.transparent = true;
                    }
                });
            } else {
                p.material.opacity = 0.2;
                p.material.transparent = true;
            }
        }
    });
}

// Reset to overview mode
export function resetToOverview() {
    state.mode = 'overview';
    state.selectedPlanet = null;
    state.hoveredPlanet = null;

    // Reset camera to tilted 2.5D view
    state.cameraTarget.set(0, 28, 15);
    cameraAngle = 0;

    // Reset all planet materials and scales
    planetMeshes.forEach(p => {
        // Reset material
        if (p.userData.id === 'portfolio') {
            // Portfolio planet uses GLB materials, just reset opacity
            p.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 1.0;
                    child.material.transparent = false;
                }
            });

            // Reset to original scale
            const planetConfig = planetData.find(pd => pd.config.id === 'portfolio');
            if (planetConfig) {
                p.scale.setScalar(planetConfig.originalScale);
            }
        } else {
            // Standard sphere planets
            p.material.opacity = 1.0;
            p.material.transparent = false;
            p.scale.setScalar(1.0);
        }
    });
}
