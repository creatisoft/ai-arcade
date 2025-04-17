// spaceInvaders.js
import * as THREE from 'three';

export function createSpaceInvaders() {
    const miniGameScene = new THREE.Scene();
    const miniGameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    miniGameCamera.position.z = 5;

    // Black background
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    bg.position.z = -1;
    miniGameScene.add(bg);

    // Player
    const playerGeometry = new THREE.PlaneGeometry(0.1, 0.1);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, -0.9, 0);
    miniGameScene.add(player);

    // Invaders
    const invaderGeometry = new THREE.PlaneGeometry(0.08, 0.08);
    const invaderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const invaders = [];
    const invaderRows = 3;
    const invaderCols = 5;
    const invaderSpacing = 0.2;
    for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
            const invader = new THREE.Mesh(invaderGeometry, invaderMaterial);
            invader.position.set(
                -0.4 + col * invaderSpacing,
                0.7 - row * invaderSpacing,
                0
            );
            miniGameScene.add(invader);
            invaders.push(invader);
        }
    }

    // Bullets
    const bulletGeometry = new THREE.PlaneGeometry(0.02, 0.06);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const bullets = [];

    // Game state
    let isActive = false;
    const playerSpeed = 1.5;
    let invaderSpeed = 0.5;
    let invaderDirection = 1;
    let lastShotTime = 0;
    const shotCooldown = 0.5;
    let totalTime = 0; // Internal time tracker

    function resetGame() {
        invaders.forEach(invader => miniGameScene.remove(invader));
        invaders.length = 0;
        for (let row = 0; row < invaderRows; row++) {
            for (let col = 0; col < invaderCols; col++) {
                const invader = new THREE.Mesh(invaderGeometry, invaderMaterial);
                invader.position.set(
                    -0.4 + col * invaderSpacing,
                    0.7 - row * invaderSpacing,
                    0
                );
                miniGameScene.add(invader);
                invaders.push(invader);
            }
        }
        bullets.forEach(bullet => miniGameScene.remove(bullet));
        bullets.length = 0;
        player.position.x = 0;
        invaderSpeed = 0.5;
        invaderDirection = 1;
        totalTime = 0;
    }

    function update(delta, keyStates) {
        if (!isActive) return;

        totalTime += delta; // Accumulate time

        // Player movement
        if (keyStates['a'] && player.position.x > -0.95) {
            player.position.x -= playerSpeed * delta;
        }
        if (keyStates['d'] && player.position.x < 0.95) {
            player.position.x += playerSpeed * delta;
        }

        // Shooting
        if (keyStates[' '] && totalTime - lastShotTime > shotCooldown) {
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bullet.position.set(player.position.x, player.position.y + 0.1, 0);
            miniGameScene.add(bullet);
            bullets.push(bullet);
            lastShotTime = totalTime;
        }

        // Bullet movement and collision
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.position.y += 1.5 * delta;
            if (bullet.position.y > 1) {
                miniGameScene.remove(bullet);
                bullets.splice(i, 1);
                continue;
            }
            for (let j = invaders.length - 1; j >= 0; j--) {
                const invader = invaders[j];
                if (
                    bullet.position.distanceTo(invader.position) < 0.1 &&
                    invader.visible
                ) {
                    invader.visible = false;
                    miniGameScene.remove(invader);
                    invaders.splice(j, 1);
                    miniGameScene.remove(bullet);
                    bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Invader movement
        let moveDown = false;
        invaders.forEach(invader => {
            invader.position.x += invaderSpeed * invaderDirection * delta;
            if (invader.position.x > 0.9 || invader.position.x < -0.9) {
                moveDown = true;
            }
        });
        if (moveDown) {
            invaderDirection *= -1;
            invaders.forEach(invader => {
                invader.position.y -= 0.1;
            });
            invaderSpeed += 0.1; // Increase speed as they descend
        }

        // Game over check
        if (invaders.length === 0 || invaders.some(invader => invader.position.y < -0.8)) {
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