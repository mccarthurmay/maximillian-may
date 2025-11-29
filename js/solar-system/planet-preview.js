// ===================================
// PLANET PREVIEW SYSTEM
// Shows preview when planet is clicked
// ===================================

import * as THREE from 'three';
import { resetToOverview } from './solar-interactions.js';

// Preview scene (separate from main solar system scene)
let previewScene, previewCamera, previewRenderer;
let previewMesh;
let isPreviewActive = false;

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
export function showPlanetPreview(planetData) {
    isPreviewActive = true;

    const overlay = document.getElementById('preview-overlay');
    const planetName = document.getElementById('preview-planet-name');
    const statusElement = document.getElementById('preview-status');
    const enterBtn = document.getElementById('enter-btn');

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

    // Show overlay with animation
    overlay.classList.add('active');

    // Create 3D preview
    createPreviewScene(planetData);
}

// Hide planet preview
export function hidePlanetPreview() {
    isPreviewActive = false;

    const overlay = document.getElementById('preview-overlay');
    overlay.classList.remove('active');

    // Cleanup preview scene
    if (previewRenderer) {
        const canvas = document.querySelector('#planet-preview-canvas canvas');
        if (canvas) {
            canvas.remove();
        }
    }

    // Reset to overview
    resetToOverview();
}

// Create 3D preview scene for planet
function createPreviewScene(planetData) {
    // Create preview scene
    previewScene = new THREE.Scene();
    previewScene.background = new THREE.Color(0x0a0a0a);

    // Create preview camera
    const container = document.getElementById('planet-preview-canvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    previewCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    previewCamera.position.z = 5;

    // Create preview renderer
    previewRenderer = new THREE.WebGLRenderer({ antialias: true });
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    previewRenderer.setSize(width, height);
    container.appendChild(previewRenderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    previewScene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    previewScene.add(pointLight);

    // Create preview based on planet type
    if (planetData.id === 'photography') {
        createPhotographyPreview(planetData);
    } else if (planetData.id === 'portfolio') {
        createPortfolioPreview(planetData);
    } else {
        createDefaultPreview(planetData);
    }

    // Start preview animation loop
    animatePreview();
}

// Create photography world preview (mini photo sphere)
function createPhotographyPreview(planetData) {
    // Create sphere
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.5,
        metalness: 0.3
    });

    previewMesh = new THREE.Mesh(geometry, material);
    previewScene.add(previewMesh);

    // Add small photo planes on the sphere surface
    // This is a simplified preview - actual photography world will have full gallery
    const photoCount = 12;
    const photoSize = 0.5;

    for (let i = 0; i < photoCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / photoCount);
        const theta = Math.sqrt(photoCount * Math.PI) * phi;

        const x = Math.cos(theta) * Math.sin(phi) * 2.2;
        const y = Math.sin(theta) * Math.sin(phi) * 2.2;
        const z = Math.cos(phi) * 2.2;

        const planeGeometry = new THREE.PlaneGeometry(photoSize, photoSize * 0.75);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x444444,
            side: THREE.DoubleSide
        });

        const photo = new THREE.Mesh(planeGeometry, planeMaterial);
        photo.position.set(x, y, z);
        photo.lookAt(0, 0, 0);

        previewMesh.add(photo);
    }
}

// Create portfolio world preview
function createPortfolioPreview(planetData) {
    // Create sphere with text
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.5,
        metalness: 0.3
    });

    previewMesh = new THREE.Mesh(geometry, material);
    previewScene.add(previewMesh);

    // Could add 3D text or icons here
}

// Create default preview for WIP worlds
function createDefaultPreview(planetData) {
    // Simple rotating sphere
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.7,
        metalness: 0.3
    });

    previewMesh = new THREE.Mesh(geometry, material);
    previewScene.add(previewMesh);
}

// Animation loop for preview
function animatePreview() {
    if (!isPreviewActive) return;

    requestAnimationFrame(animatePreview);

    // Rotate preview mesh
    if (previewMesh) {
        previewMesh.rotation.y += 0.005;
        previewMesh.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
    }

    previewRenderer.render(previewScene, previewCamera);
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
