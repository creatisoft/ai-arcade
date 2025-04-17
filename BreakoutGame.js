// breakout.js
import * as THREE from 'three';

export function createBreakout() {
    const miniGameScene = new THREE.Scene();
    const miniGameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    miniGameCamera.position.z = 5;

    // Black background
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    bg.position.z = -1;
    miniGameScene.add(bg);

    // Paddle
    const paddleGeometry = new THREE.PlaneGeometry(0.3, 0.1);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.set(0, -0.9, 0);
    miniGameScene.add(paddle);

    // Ball
    const ballGeometry = new THREE.CircleGeometry(0.03, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, -0.8, 0);
    miniGameScene.add(ball);

    // Bricks
    const brickGeometry = new THREE.PlaneGeometry(0.18, 0.08);
    const brickMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const bricks = [];
    const brickRows = 3;
    const brickCols = 5;
    const brickSpacingX = 0.2;
    const brickSpacingY = 0.1;
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            brick.position.set(
                -0.45 + col * brickSpacingX,
                0.7 - row * brickSpacingY,
                0
            );
            miniGameScene.add(brick);
            bricks.push(brick);
        }
    }

    // Game state
    let isActive = false;
    const paddleSpeed = 1.5;
    let ballVelocity = new THREE.Vector2(0.8, 0.8);

    function resetGame() {
        paddle.position.x = 0;
        ball.position.set(0, -0.8, 0);
        ballVelocity.set(0.8, 0.8);
        bricks.forEach(brick => miniGameScene.remove(brick));
        bricks.length = 0;
        for (let row = 0; row < brickRows; row++) {
            for (let col = 0; col < brickCols; col++) {
                const brick = new THREE.Mesh(brickGeometry, brickMaterial);
                brick.position.set(
                    -0.45 + col * brickSpacingX,
                    0.7 - row * brickSpacingY,
                    0
                );
                miniGameScene.add(brick);
                bricks.push(brick);
            }
        }
    }

    function update(delta, keyStates) {
        if (!isActive) return;

        // Paddle movement
        if (keyStates['a'] && paddle.position.x > -0.85) {
            paddle.position.x -= paddleSpeed * delta;
        }
        if (keyStates['d'] && paddle.position.x < 0.85) {
            paddle.position.x += paddleSpeed * delta;
        }

        // Ball movement
        ball.position.x += ballVelocity.x * delta;
        ball.position.y += ballVelocity.y * delta;

        // Wall collisions
        if (ball.position.x > 0.97 || ball.position.x < -0.97) {
            ballVelocity.x *= -1;
        }
        if (ball.position.y > 0.97) {
            ballVelocity.y *= -1;
        }

        // Paddle collision
        if (
            ball.position.y < -0.85 &&
            ball.position.y > -0.95 &&
            ball.position.x > paddle.position.x - 0.15 &&
            ball.position.x < paddle.position.x + 0.15
        ) {
            ballVelocity.y *= -1;
            // Adjust ball direction based on hit position
            const hitPos = (ball.position.x - paddle.position.x) / 0.15;
            ballVelocity.x = hitPos * 1.5;
        }

        // Brick collisions
        bricks.forEach((brick, index) => {
            if (
                ball.position.distanceTo(brick.position) < 0.1 &&
                brick.visible
            ) {
                brick.visible = false;
                miniGameScene.remove(brick);
                bricks.splice(index, 1);
                ballVelocity.y *= -1;
            }
        });

        // Ball out of bounds or win condition
        if (ball.position.y < -1 || bricks.length === 0) {
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