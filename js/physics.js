// ===================================
// PHYSICS (Collision detection, gravity, movement)
// ===================================

import * as THREE from 'three';
import { characterGroup, planetGroup } from './scene.js';
import { GRAVITY, CHARACTER_RADIUS, CHARACTER_HEIGHT, FIXED_TIMESTEP } from './config.js';

// Physics state
export const physics = {
    velocity: new THREE.Vector3(0, 0, 0),
    gravity: GRAVITY,
    isGrounded: false,
    jumpForce: 5.0,
    characterRadius: CHARACTER_RADIUS,
    jumpCharging: false,
    jumpChargeTime: 0
};

// Raycaster for collision detection
const raycaster = new THREE.Raycaster();
const downVector = new THREE.Vector3(0, -1, 0);

// Collision meshes cache
export let collisionMeshes = [];

// Build collision meshes array once
export function buildCollisionMeshes() {
    collisionMeshes = [];
    planetGroup.traverse((child) => {
        if (child.isMesh) {
            const name = child.name.toLowerCase();
            if (!name.includes('grass') && !name.includes('pebble')) {
                collisionMeshes.push(child);
            }
        }
    });
    console.log(`Built collision meshes array: ${collisionMeshes.length} meshes`);
}

// Physics update with swept collision detection
export function updatePhysics(dt, introActive) {
    if (introActive) return;

    // Apply gravity
    physics.velocity.y -= physics.gravity * dt;

    // Calculate movement delta
    const movementDelta = physics.velocity.y * dt;
    const currentY = characterGroup.position.y;
    const newY = currentY + movementDelta;

    // Swept collision detection: raycast along movement path
    const rayOrigin = new THREE.Vector3(
        characterGroup.position.x,
        currentY,
        characterGroup.position.z
    );

    // If moving down, cast ray along movement path
    if (movementDelta < 0) {
        const movementDistance = Math.abs(movementDelta);
        raycaster.set(rayOrigin, downVector);
        raycaster.far = movementDistance + 1.0; // Look ahead of movement

        const intersects = raycaster.intersectObjects(collisionMeshes, false);

        if (intersects.length > 0) {
            const groundY = intersects[0].point.y;
            const groundOffset = 0.03;
            const targetY = groundY + groundOffset;
            const distanceToGround = currentY - groundY;

            // Dynamic tolerance based on velocity (prevents tunneling)
            // Reduced tolerance for smoother landings
            const velocityFactor = Math.abs(physics.velocity.y);
            const groundTolerance = 0.05 + (velocityFactor * 0.02);

            if (distanceToGround <= groundTolerance && physics.velocity.y <= 0) {
                // Snap to ground
                characterGroup.position.y = targetY;
                physics.velocity.y = 0;
                physics.isGrounded = true;
            } else if (newY <= groundY + groundOffset) {
                // About to clip through - snap to ground instead
                characterGroup.position.y = targetY;
                physics.velocity.y = 0;
                physics.isGrounded = true;
            } else {
                // Free fall
                characterGroup.position.y = newY;
                physics.isGrounded = false;
            }
        } else {
            // No ground detected
            characterGroup.position.y = newY;
            physics.isGrounded = false;
        }
    } else {
        // Moving up (jumping) - no collision check needed
        characterGroup.position.y = newY;
        physics.isGrounded = false;
    }

    // Safety check: if somehow below ground, teleport above
    raycaster.set(rayOrigin, downVector);
    raycaster.far = 50;
    const safetyCheck = raycaster.intersectObjects(collisionMeshes, false);
    if (safetyCheck.length > 0) {
        const groundY = safetyCheck[0].point.y;
        if (characterGroup.position.y < groundY) {
            console.warn('Character clipped through ground - correcting position');
            characterGroup.position.y = groundY + 0.5;
            physics.velocity.y = 0;
            physics.isGrounded = true;
        }
    }
}

// Check for forward collision (for movement blocking)
export function checkForwardCollision(characterRotation, direction) {
    const forwardRayOrigin = new THREE.Vector3(0, characterGroup.position.y, 0);
    const forwardDirection = new THREE.Vector3(
        -Math.sin(characterRotation) * direction,
        0,
        -Math.cos(characterRotation) * direction
    );

    const forwardRaycaster = new THREE.Raycaster(forwardRayOrigin, forwardDirection, 0, 0.2);
    const forwardIntersects = forwardRaycaster.intersectObjects(collisionMeshes, false);

    if (forwardIntersects.length > 0) {
        const obstacleHeight = forwardIntersects[0].point.y;
        const obstacleDistance = forwardIntersects[0].distance;
        const stepHeight = obstacleHeight - (characterGroup.position.y - CHARACTER_HEIGHT);

        if (stepHeight > 0.05 || obstacleDistance < 0.15) {
            return true; // Collision detected
        }
    }

    return false; // No collision
}
