// ===================================
// PLANET PREVIEW SYSTEM
// Zooms camera to follow planet through orbit
// ===================================

import * as THREE from 'three';
import { resetToOverview } from './solar-interactions.js';

// Preview state
let isPreviewActive = false;
let followingPlanet = null;

// Initialize preview system
export function initPreviewSystem() {
    const overlay = document.getElementById('preview-overlay');
    const backBtn = document.getElementById('back-btn');
    const enterBtn = document.getElementById('enter-btn');

    // Back button handler
    backBtn.addEventListener('click', hidePlanetPreview);

    // Enter button handler
    enterBtn.addEventListener('click', onEnterWorld);
}

// Show planet preview overlay
export function showPlanetPreview(planetData, planetMesh) {
    isPreviewActive = true;
    followingPlanet = planetMesh;

    const overlay = document.getElementById('preview-overlay');
    const planetName = document.getElementById('preview-planet-name');
    const statusElement = document.getElementById('preview-status');
    const enterBtn = document.getElementById('enter-btn');
    const solarTitle = document.querySelector('.solar-title-overlay');
    const instructions = document.querySelector('.instructions');

    // Hide solar system title and instructions
    if (solarTitle) {
        solarTitle.style.opacity = '0';
        solarTitle.style.pointerEvents = 'none';
    }
    if (instructions) {
        instructions.style.opacity = '0';
    }

    // Set planet name
    planetName.textContent = planetData.name;
    planetName.style.color = `#${planetData.color.toString(16).padStart(6, '0')}`;

    // Set status
    if (planetData.status === 'wip') {
        statusElement.textContent = 'WORK IN PROGRESS';
        statusElement.style.display = 'block';
    } else {
        statusElement.style.display = 'none';
    }

    // Store planet data for enter button
    enterBtn.dataset.route = planetData.route;

    // Show overlay with animation (without 3D canvas)
    overlay.classList.add('active');
}

// Hide planet preview
export function hidePlanetPreview() {
    isPreviewActive = false;
    followingPlanet = null;

    const overlay = document.getElementById('preview-overlay');
    const solarTitle = document.querySelector('.solar-title-overlay');
    const instructions = document.querySelector('.instructions');

    overlay.classList.remove('active');

    // Show solar system title and instructions again
    if (solarTitle) {
        solarTitle.style.opacity = '1';
        solarTitle.style.pointerEvents = 'auto';
    }
    if (instructions) {
        instructions.style.opacity = '1';
    }

    // Reset to overview
    resetToOverview();
}

// Update camera to follow planet (called from main animation loop)
export function updatePreviewCamera(camera, state) {
    if (!isPreviewActive || !followingPlanet) return;

    // Get planet position
    const planetPos = followingPlanet.position.clone();

    // Calculate offset behind and above the planet for following view
    const offset = new THREE.Vector3(0, 3, 8);

    // Target position: planet position + offset
    state.cameraTarget.copy(planetPos).add(offset);

    // Smooth camera movement (lerp)
    camera.position.lerp(state.cameraTarget, 0.05);

    // Make camera look at the planet
    camera.lookAt(planetPos);
}

// Export preview state
export function isInPreview() {
    return isPreviewActive;
}

// Handle "ENTER" button click
function onEnterWorld() {
    const enterBtn = document.getElementById('enter-btn');
    const route = enterBtn.dataset.route;

    if (route) {
        // Navigate to the world
        window.location.href = route;
    }
}
