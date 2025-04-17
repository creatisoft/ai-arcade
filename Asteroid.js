// asteroids.js
import * as THREE from 'three';

export function createAsteroids() {
    const miniGameScene = new THREE.Scene();
    const miniGameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    miniGameCamera.position.z = 5;

    // Black background
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    bg.position.z = -1;
    miniGameScene.add(bg);

    // Ship (triangle)
    const shipGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0.1, 0,    // Top
        -0.05, -0.05, 0, // Bottom left
        0.05, -0.05, 0   // Bottom right
    ]);
    shipGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const ship = new THREE.Mesh(shipGeometry, shipMaterial);
    ship.position.set(0, 0, 0);
    miniGameScene.add(ship);

    // Asteroids
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const asteroids = [];

    // Bullets
    const bulletGeometry = new THREE.PlaneGeometry(0.02, 0.06);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const bullets = [];

    // Game state
    let isActive = false;
    const shipSpeed = 1.5;
    const rotationSpeed = 3;
    let velocity = new THREE.Vector2(0, 0);
    let lastShotTime = 0;
    const shotCooldown = 0.3;
    let totalTime = 0;

    function spawnAsteroid(size = 0.1) {
        const asteroid = new THREE.Mesh(
            new THREE.CircleGeometry(size, 16),
            asteroidMaterial
        );
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        switch (edge) {
            case 0: // Top
                x = Math.random() * 2 - 1;
                y = 1;
                break;
            case 1: // Right
                x = 1;
                y = Math.random() * 2 - 1;
                break;
            case 2: // Bottom
                x = Math.random() * 2 - 1;
                y = -1;
                break;
            case 3: // Left
                x = -1;
                y = Math.random() * 2 - 1;
                break;
        }
        asteroid.position.set(x, y, 0);
        asteroid.velocity = new THREE.Vector2(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        asteroid.size = size;
        miniGameScene.add(asteroid);
        asteroids.push(asteroid);
    }

    function resetGame() {
        asteroids.forEach(asteroid => miniGameScene.remove(asteroid));
        asteroids.length = 0;
        bullets.forEach(bullet => miniGameScene.remove(bullet));
        bullets.length = 0;
        ship.position.set(0, 0, 0);
        ship.rotation.z = 0;
        velocity.set(0, 0);
        totalTime = 0;
        lastShotTime = 0;
        // Spawn initial asteroids
        for (let i = 0; i < 4; i++) {
            spawnAsteroid(0.1); // Large asteroids
        }
    }

    function update(delta, keyStates) {
        if (!isActive) return;

        totalTime += delta;

        // Ship rotation and thrust
        if (keyStates['arrowleft']) {
            ship.rotation.z += rotationSpeed * delta;
        }
        if (keyStates['arrowright']) {
            ship.rotation.z -= rotationSpeed * delta;
        }
        if (keyStates['arrowup']) {
            const angle = ship.rotation.z;
            velocity.x += Math.sin(-angle) * shipSpeed * delta;
            velocity.y += Math.cos(angle) * shipSpeed * delta;
        }

        // Ship movement with friction
        ship.position.x += velocity.x * delta;
        ship.position.y += velocity.y * delta;
        velocity.multiplyScalar(0.98); // Friction

        // Wrap ship around screen
        if (ship.position.x > 1) ship.position.x = -1;
        if (ship.position.x < -1) ship.position.x = 1;
        if (ship.position.y > 1) ship.position.y = -1;
        if (ship.position.y < -1) ship.position.y = 1;

        // Shooting
        if (keyStates[' '] && totalTime - lastShotTime > shotCooldown) {
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            const angle = ship.rotation.z;
            bullet.position.set(
                ship.position.x + Math.sin(-angle) * 0.1,
                ship.position.y + Math.cos(angle) * 0.1,
                0
            );
            bullet.velocity = new THREE.Vector2(
                Math.sin(-angle) * 2,
                Math.cos(angle) * 2
            );
            miniGameScene.add(bullet);
            bullets.push(bullet);
            lastShotTime = totalTime;
        }

        // Bullet movement
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.position.x += bullet.velocity.x * delta;
            bullet.position.y += bullet.velocity.y * delta;
            if (
                bullet.position.x > 1 || bullet.position.x < -1 ||
                bullet.position.y > 1 || bullet.position.y < -1
            ) {
                miniGameScene.remove(bullet);
                bullets.splice(i, 1);
            }
        }

        // Asteroid movement and wrapping
        asteroids.forEach(asteroid => {
            asteroid.position.x += asteroid.velocity.x * delta;
            asteroid.position.y += asteroid.velocity.y * delta;
            if (asteroid.position.x > 1) asteroid.position.x = -1;
            if (asteroid.position.x < -1) asteroid.position.x = 1;
            if (asteroid.position.y > 1) asteroid.position.y = -1;
            if (asteroid.position.y < -1) asteroid.position.y = 1;
        });

        // Collision detection
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const asteroid = asteroids[j];
                if (bullet.position.distanceTo(asteroid.position) < asteroid.size + 0.03) {
                    miniGameScene.remove(bullet);
                    bullets.splice(i, 1);
                    miniGameScene.remove(asteroid);
                    asteroids.splice(j, 1);
                    if (asteroid.size > 0.05) {
                        // Split into two smaller asteroids
                        for (let k = 0; k < 2; k++) {
                            spawnAsteroid(asteroid.size * 0.5);
                            asteroids[asteroids.length - 1].position.copy(asteroid.position);
                            asteroids[asteroids.length - 1].velocity.set(
                                (Math.random() - 0.5) * 0.5,
                                (Math.random() - 0.5) * 0.5
                            );
                        }
                    }
                    break;
                }
            }
        }

        // Ship-asteroid collision
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            if (ship.position.distanceTo(asteroid.position) < asteroid.size + 0.05) {
                resetGame();
                return;
            }
        }

        // Win condition
        if (asteroids.length === 0) {
            resetGame();
        }
    }

    function activate() {
        isActive = true;
        resetGame();
    }

    function deactivate() {
        isActive = false;
        resetGame();
    }

    return {
        scene: miniGameScene,
        camera: miniGameCamera,
        update,
        activate,
        deactivate,
        isActive: () => isActive
    };
}