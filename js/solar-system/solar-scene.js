// ===================================
// SOLAR SYSTEM SCENE SETUP
// ===================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { planets, sun, stars } from './planets-config.js';

// Scene, camera, renderer
export let scene, camera, renderer;

// Sun and planet objects
export let sunMesh;
export let planetMeshes = [];
export let planetData = [];
export let orbitLines = [];
export let starField;
export let portfolioMoon = null;

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('solar-canvas').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Point light at sun position - main light source
    // Use very high intensity with no decay for consistent illumination
    const sunLight = new THREE.PointLight(0xfdb813, 15, 0); // Very high intensity, infinite range
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;  // Low quality for performance
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200; // Extended to cover all planets
    sunLight.decay = 0; // No decay - constant brightness
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
    // Use MeshBasicMaterial so sun is always bright (unaffected by lighting)
    const material = new THREE.MeshBasicMaterial({
        color: sun.color
    });

    sunMesh = new THREE.Mesh(geometry, material);
    sunMesh.name = 'sun';
    scene.add(sunMesh);

    // Add subtle glow effect
    const glowGeometry = new THREE.SphereGeometry(sun.size * 1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: sun.color,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunMesh.add(glow);
}

// Create all planets
function createPlanets() {
    planets.forEach((planetConfig, index) => {
        // Initial position on orbit
        const angle = (index / planets.length) * Math.PI * 2;

        // Special handling for portfolio planet - load 3D model
        if (planetConfig.id === 'portfolio') {
            createPortfolioPlanet(planetConfig, angle, index);
        } else {
            // Create standard sphere planet
            createStandardPlanet(planetConfig, angle, index);
        }

        // Create orbit ring
        createOrbitRing(planetConfig.orbitRadius);
    });
}

// Create standard sphere planet
function createStandardPlanet(planetConfig, angle, index) {
    const geometry = new THREE.SphereGeometry(planetConfig.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: planetConfig.color,
        roughness: 0.7,
        metalness: 0.3
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.name = planetConfig.id;
    planet.userData = planetConfig;

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
}

// Create portfolio planet from 3D model
function createPortfolioPlanet(planetConfig, angle, index) {
    const loader = new GLTFLoader();
    loader.load(
        'assets/models/portfolio-lq.glb',
        function(gltf) {
            const planet = gltf.scene;
            planet.name = planetConfig.id;
            planet.userData = planetConfig;

            // Scale to match planet size
            const box = new THREE.Box3().setFromObject(planet);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = (planetConfig.size * 2) / maxDim;
            planet.scale.setScalar(scale);

            // Center the model
            const center = box.getCenter(new THREE.Vector3());
            const centerOffset = {
                x: -center.x * scale,
                y: -center.y * scale,
                z: -center.z * scale
            };

            planet.position.set(
                Math.cos(angle) * planetConfig.orbitRadius + centerOffset.x,
                centerOffset.y,
                Math.sin(angle) * planetConfig.orbitRadius + centerOffset.z
            );

            // Enable shadows
            planet.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(planet);
            planetMeshes.push(planet);

            // Add label for portfolio planet (async loaded)
            import('./solar-interactions.js').then(module => {
                module.addPlanetLabel(planet);
            });

            // Create mini moon for portfolio planet
            const moonGeometry = new THREE.SphereGeometry(planetConfig.size * 0.3, 16, 16);
            const moonMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.9,
                metalness: 0.1
            });
            portfolioMoon = new THREE.Mesh(moonGeometry, moonMaterial);
            portfolioMoon.castShadow = true;
            portfolioMoon.receiveShadow = true;
            scene.add(portfolioMoon);

            // Store planet data for animation (with center offset)
            planetData.push({
                mesh: planet,
                config: planetConfig,
                angle: angle,
                originalScale: scale,
                centerOffset: centerOffset,
                hasMoon: true,
                moonAngle: 0
            });

            console.log('Portfolio planet loaded successfully with moon');
        },
        function(progress) {
            console.log('Loading portfolio planet:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        },
        function(error) {
            console.error('Error loading portfolio planet:', error);
            // Fallback to standard sphere
            createStandardPlanet(planetConfig, angle, index);
        }
    );
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

        // Update position based on orbit
        const orbitX = Math.cos(data.angle) * data.config.orbitRadius;
        const orbitZ = Math.sin(data.angle) * data.config.orbitRadius;

        // For portfolio planet (3D model), maintain the center offset
        if (data.config.id === 'portfolio' && data.centerOffset) {
            data.mesh.position.x = orbitX + data.centerOffset.x;
            data.mesh.position.y = data.centerOffset.y;
            data.mesh.position.z = orbitZ + data.centerOffset.z;

            // Update moon orbit around portfolio planet (realistic circular orbit)
            if (data.hasMoon && portfolioMoon) {
                data.moonAngle += 0.015; // Slightly slower, more realistic
                const moonDistance = data.config.size * 1.5; // Reduced orbit - closer to planet
                const orbitTilt = 0.15; // Realistic orbital tilt (about 5 degrees)

                // Tilted circular orbit around planet
                const moonX = Math.cos(data.moonAngle) * moonDistance;
                const moonZ = Math.sin(data.moonAngle) * moonDistance * Math.cos(orbitTilt);
                const moonY = Math.sin(data.moonAngle) * moonDistance * Math.sin(orbitTilt);

                portfolioMoon.position.x = data.mesh.position.x + moonX;
                portfolioMoon.position.z = data.mesh.position.z + moonZ;
                portfolioMoon.position.y = data.mesh.position.y + moonY;

                // Moon rotation (tidally locked - same face toward planet)
                portfolioMoon.rotation.y = data.moonAngle + Math.PI;
            }
        } else {
            // Standard sphere planets
            data.mesh.position.x = orbitX;
            data.mesh.position.z = orbitZ;
            data.mesh.position.y = 0;
        }

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
    // Only update camera if not in preview mode (preview handles its own camera)
    if (state.mode !== 'preview') {
        // Smooth lerp to target position
        camera.position.lerp(state.cameraTarget, 0.05);
        camera.lookAt(0, 0, 0);
    }

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
