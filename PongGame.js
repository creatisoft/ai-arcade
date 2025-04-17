import * as THREE from 'three';

export function createPong() {
    const miniGameScene = new THREE.Scene();
    const miniGameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    miniGameCamera.position.z = 5;

    // Black background
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    bg.position.z = -1;
    miniGameScene.add(bg);

    // Paddle (BoxGeometry is 3D, so it’s visible from all sides)
    const paddleGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.1);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.set(0, -0.9, 0);
    miniGameScene.add(paddle);

    // Ball
    const ballGeometry = new THREE.CircleGeometry(0.05, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, 0);
    miniGameScene.add(ball);

    // Game state and logic (unchanged)
    let isActive = false;
    let ballVelocity = new THREE.Vector2(0.5, 0.5);
    const paddleSpeed = 2;
    let score = 0;

    function resetBall() {
        ball.position.set(0, 0, 0);
        ballVelocity.set(0.5 * (Math.random() > 0.5 ? 1 : -1), 0.5);
        score = 0;
    }

    function update(delta, keyStates) {
        if (!isActive) return;

        if (keyStates['a'] && paddle.position.x > -0.8) {
            paddle.position.x -= paddleSpeed * delta;
        }
        if (keyStates['d'] && paddle.position.x < 0.8) {
            paddle.position.x += paddleSpeed * delta;
        }

        ball.position.x += ballVelocity.x * delta;
        ball.position.y += ballVelocity.y * delta;

        if (ball.position.x > 0.95 || ball.position.x < -0.95) {
            ballVelocity.x *= -1;
        }
        if (ball.position.y > 0.95) {
            ballVelocity.y *= -1;
        }

        if (
            ball.position.y < -0.75 &&
            ball.position.y > -1.05 &&
            ball.position.x > paddle.position.x - 0.2 &&
            ball.position.x < paddle.position.x + 0.2
        ) {
            ballVelocity.y *= -1;
            score++;
        }

        if (ball.position.y < -1.05) {
            resetBall();
        }
    }

    function activate() {
        isActive = true;
        resetBall();
    }

    function deactivate() {
        isActive = false;
        resetBall();
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