// ===================================
// SOLAR SYSTEM SCENE SETUP
// ===================================

import * as THREE from 'three';
import { planets, sun, stars } from './planets-config.js';

// Scene, camera, renderer
export let scene, camera, renderer;

// Sun and planet objects
export let sunMesh;
export let planetMeshes = [];
export let planetData = [];
export let orbitLines = [];
export let starField;

// State
export const state = {
    mode: 'overview', // 'overview', 'preview', 'transitioning'
    selectedPlanet: null,
    hoveredPlanet: null,
    cameraTarget: new THREE.Vector3(0, 28, 15),  // Tilted 2.5D view with more depth
    cameraPosition: new THREE.Vector3(0, 28, 15)
};

// Initialize the scene
export function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 100);

    // Create camera - 2.5D top-down view
    camera = new THREE.PerspectiveCamera(
        50,  // Narrower FOV for less distortion
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.copy(state.cameraPosition);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('solar-canvas').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Point light at sun position
    const sunLight = new THREE.PointLight(0xfdb813, 2, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Create stars
    createStars();

    // Create sun
    createSun();

    // Create planets
    createPlanets();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create starfield background - fills entire view
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];

    // Create stars in a sphere around the scene
    for (let i = 0; i < stars.count * 10; i++) {  // 10x more stars (20000 total)
        // Use spherical coordinates for even distribution
        const radius = 200 + Math.random() * 300;  // Distance from center (200-500 units)
        const theta = Math.random() * Math.PI * 2;  // Horizontal angle
        const phi = Math.acos((Math.random() * 2) - 1);  // Vertical angle (even sphere distribution)

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        starPositions.push(x, y, z);
    }

    starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.0,    // Fixed size stars
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: false,    // Don't scale with distance
        fog: false                 // Don't apply fog to stars
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Create the sun
function createSun() {
    const geometry = new THREE.SphereGeometry(sun.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: sun.color,
        emissive: sun.emissive,
        emissiveIntensity: sun.emissiveIntensity,
        roughness: 0.5
    });

    sunMesh = new THREE.Mesh(geometry, material);
    sunMesh.name = 'sun';
    scene.add(sunMesh);

    // Add glow effect (larger transparent sphere)
    const glowGeometry = new THREE.SphereGeometry(sun.size * 1.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: sun.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunMesh.add(glow);
}

// Create all planets
function createPlanets() {
    planets.forEach((planetConfig, index) => {
        // Create planet mesh
        const geometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: planetConfig.color,
            roughness: 0.7,
            metalness: 0.3
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.name = planetConfig.id;
        planet.userData = planetConfig;

        // Initial position on orbit
        const angle = (index / planets.length) * Math.PI * 2;
        planet.position.x = Math.cos(angle) * planetConfig.orbitRadius;
        planet.position.z = Math.sin(angle) * planetConfig.orbitRadius;
        planet.position.y = 0;

        scene.add(planet);
        planetMeshes.push(planet);

        // Store planet data for animation
        planetData.push({
            mesh: planet,
            config: planetConfig,
            angle: angle,
            originalScale: planetConfig.size
        });

        // Create orbit ring
        createOrbitRing(planetConfig.orbitRadius);
    });
}

// Create orbit ring for a planet
function createOrbitRing(radius) {
    const curve = new THREE.EllipseCurve(
        0, 0,                    // center x, y
        radius, radius,          // x radius, y radius
        0, 2 * Math.PI,         // start angle, end angle
        false,                   // clockwise
        0                        // rotation
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15
    });

    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2; // Rotate to horizontal
    scene.add(orbit);
    orbitLines.push(orbit);
}

// Update planet positions (orbital movement)
export function updatePlanetPositions(deltaTime) {
    planetData.forEach(data => {
        // Update angle based on orbit speed
        data.angle += data.config.orbitSpeed * deltaTime * 0.1;

        // Update position
        data.mesh.position.x = Math.cos(data.angle) * data.config.orbitRadius;
        data.mesh.position.z = Math.sin(data.angle) * data.config.orbitRadius;

        // Slow rotation
        data.mesh.rotation.y += 0.005;
    });

    // Rotate sun
    if (sunMesh) {
        sunMesh.rotation.y += sun.rotationSpeed;
    }
}

// Smooth camera movement
export function updateCamera(deltaTime) {
    // Smooth lerp to target position
    camera.position.lerp(state.cameraTarget, 0.05);
    camera.lookAt(0, 0, 0);

    // Make starfield follow camera so it appears fixed
    if (starField) {
        starField.position.copy(camera.position);
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Get planet mesh by ID
export function getPlanetById(id) {
    return planetMeshes.find(p => p.userData.id === id);
}

// Cleanup
export function dispose() {
    window.removeEventListener('resize', onWindowResize);
    if (renderer) {
        renderer.dispose();
    }
}
