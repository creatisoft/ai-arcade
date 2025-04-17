import * as THREE from 'three';

export function createSnake() {
    const miniGameScene = new THREE.Scene();
    const miniGameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    miniGameCamera.position.z = 5;

    // Black background
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    bg.position.z = -1;
    miniGameScene.add(bg);

    // Grid parameters
    const gridSize = 10;
    const cellSize = 2 / gridSize;

    // Snake
    let snakeGrid = [{ i: 5, j: 5 }];
    const snakeDirection = new THREE.Vector2(1, 0);
    const snakeSpeed = 5;
    const moveInterval = 1 / snakeSpeed;
    let lastMoveTime = 0;

    // Food
    let foodPosition = { i: 0, j: 0 };

    // Meshes
    const snakeGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const snakeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const snakeMeshes = [];

    const foodGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const foodMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const food = new THREE.Mesh(foodGeometry, foodMaterial);
    miniGameScene.add(food);

    function setMeshPosition(mesh, gridPos) {
        mesh.position.set(
            -1 + cellSize / 2 + gridPos.i * cellSize,
            -1 + cellSize / 2 + gridPos.j * cellSize,
            0
        );
    }

    function placeFood() {
        let i, j;
        do {
            i = Math.floor(Math.random() * gridSize);
            j = Math.floor(Math.random() * gridSize);
        } while (snakeGrid.some(pos => pos.i === i && pos.j === j));
        foodPosition = { i, j };
        setMeshPosition(food, foodPosition);
    }

    function resetGame() {
        snakeMeshes.forEach(mesh => miniGameScene.remove(mesh));
        snakeMeshes.length = 0;
        snakeGrid = [{ i: 5, j: 5 }];
        const newHeadMesh = new THREE.Mesh(snakeGeometry, snakeMaterial);
        setMeshPosition(newHeadMesh, snakeGrid[0]);
        miniGameScene.add(newHeadMesh);
        snakeMeshes.push(newHeadMesh);
        snakeDirection.set(1, 0);
        placeFood();
    }

    let isActive = false;

    function update(delta, keyStates) {
        if (!isActive) return;

        if (keyStates['arrowleft'] && snakeDirection.x !== 1) {
            snakeDirection.set(-1, 0);
        } else if (keyStates['arrowright'] && snakeDirection.x !== -1) {
            snakeDirection.set(1, 0);
        } else if (keyStates['arrowup'] && snakeDirection.y !== -1) {
            snakeDirection.set(0, 1);
        } else if (keyStates['arrowdown'] && snakeDirection.y !== 1) {
            snakeDirection.set(0, -1);
        }

        lastMoveTime += delta;
        if (lastMoveTime >= moveInterval) {
            lastMoveTime -= moveInterval;

            const head = snakeGrid[0];
            const newHead = {
                i: (head.i + snakeDirection.x + gridSize) % gridSize,
                j: (head.j + snakeDirection.y + gridSize) % gridSize
            };

            if (snakeGrid.some(pos => pos.i === newHead.i && pos.j === newHead.j)) {
                resetGame();
                return;
            }

            snakeGrid.unshift(newHead);
            const newHeadMesh = new THREE.Mesh(snakeGeometry, snakeMaterial);
            setMeshPosition(newHeadMesh, newHead);
            miniGameScene.add(newHeadMesh);
            snakeMeshes.unshift(newHeadMesh);

            if (newHead.i === foodPosition.i && newHead.j === foodPosition.j) {
                placeFood();
            } else {
                snakeGrid.pop();
                const tailMesh = snakeMeshes.pop();
                miniGameScene.remove(tailMesh);
            }
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

    resetGame();

    return {
        scene: miniGameScene,
        camera: miniGameCamera,
        update,
        activate,
        deactivate,
        isActive: () => isActive
    };
}