import { Player } from "./modules/player.js";
import { collisionDetected } from "./modules/collision.js";
import { generateEnemyWave } from "./modules/enemyWaveGenerator.js";

// UI Setup
const hud = document.getElementById("hud");
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");

// Start Screen Setup
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

// Game Over/Win Screen Setup
const gameOverWinScreen = document.getElementById("game-over-win-screen");
const gameOverTitle = document.getElementById("game-over-title");
const winTitle = document.getElementById("win-title");
const finalScoreDisplay = document.getElementById("final-score-display");
const restartButton = document.getElementById("restart-button");


// Game Canvas Setup
/** @type {HTMLCanvasElement} */
const gamecanvas = document.getElementById("gamecanvas");

/** @type {CanvasRenderingContext2D} */
const gctx = gamecanvas.getContext("2d");

let isGameRunning = false;

// Input Handling
const input = {
    "ArrowUp": false,
    "ArrowDown": false,
    "ArrowLeft": false,
    "ArrowRight": false,
    "Space": false,
    "KeyW": false,
    "KeyA": false,
    "KeyS": false,
    "KeyD": false
};

window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft",
        "ArrowRight", "Space", "KeyW",
        "KeyA", "KeyS", "KeyD"].includes(e.code)) {
        e.preventDefault();

        input[e.code] = true;
    }
});

window.addEventListener("keyup", (e) => {
    input[e.code] = false;
});

// Resize canvas to be square and fit within window
function resizeCanvas() {
    gamecanvas.height = Math.min(window.innerHeight, window.innerWidth);
    gamecanvas.width = gamecanvas.height;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function game() {
    isGameRunning = true;

    let gameOver = false; // For game over state
    let playerWon = false; // For win state
    let lives = 3; // Player lives
    let score = 0; // Player score

    // Main Player
    const playerRelX = 0.5;
    const playerRelY = 0.9;
    const player1 = new Player(
        playerRelX, playerRelY,
        0.7, 0.6,
        0.05, 0.05,
        "green");

    // Bullets Array
    const bullets = [];

    // Enemies Array
    const enemies = [];
    const enemyDeadLineY = playerRelY - player1.relHeight / 2 - 0.05; // Deadline above player
    let wavenumber = 0;
    const maxGridSize = {
        rows: 8,
        columns: 10
    };
    const enemyWaveDelay = 2; // Seconds between waves
    let enemyWaveTimer = 0;

    let lasttime = 0; // For delta time calculation
    // Game Loop
    /**
     * @param {number} timestamp
     */
    function gameloop(timestamp) {
        // Skip the very first frame
        if (!lasttime) {
            lasttime = timestamp;
            requestAnimationFrame(gameloop);
            return;
        }

        const deltatime = Math.min((timestamp - lasttime) / 1000, 0.1); // Cap delta time to avoid big jumps
        lasttime = timestamp;
        update(deltatime);
        draw();
        if (!isGameRunning) return;
        requestAnimationFrame(gameloop);
    }
    requestAnimationFrame(gameloop);


    let newEnemies = [];
    let isMaxWave = false;

    // Update function
    function update(deltatime) {
        // Skip updates if game over
        if (!isGameRunning) return;

        player1.update(deltatime, input, gctx);

        if (enemies.length === 0) {
            enemyWaveTimer += deltatime;
            // Delete all existing bullets
            bullets.length = 0;
            // TODO: Disable shooting properly during wave transition
            if (isMaxWave) { playerWon = true; console.log("Player Won: All waves cleared!"); }
            else if (enemyWaveTimer >= enemyWaveDelay || wavenumber === 0) {
                enemyWaveTimer = 0;
                wavenumber++;
                console.log("enemy wave:", wavenumber);

                [newEnemies, isMaxWave] = generateEnemyWave(wavenumber, gctx, maxGridSize);
                enemies.push(...newEnemies);

            }
        }

        if (player1.isAlive) {

            // Handle shooting
            if (input["Space"]) {
                const bullet = player1.shoot();
                if (bullet) {
                    bullets.push(bullet);
                }
            }

            // Check for player-enemy collisions
            if (player1.isAlive) {
                for (const enemy of enemies) {
                    // Ignore inactive enemies
                    if (!enemy.active) continue;
                    if (collisionDetected(player1, enemy, gctx)) {
                        lives--;
                        player1.hit();
                        console.log("Player hit by enemy");
                        break;
                    }
                }
            }
        }

        bullets.forEach((bullet, index) => {
            bullet.update(deltatime);
            if (bullet.isOffScreen()) {
                bullets.splice(index, 1);
            }
        });

        let hitEdge = false;
        enemies.forEach((enemy) => {
            enemy.update(deltatime);
        });
        enemies.forEach((enemy) => {
            if (enemy.isOnEdge(deltatime, gctx)) {
                hitEdge = true;
            }
        });
        if (hitEdge) {
            enemies.forEach((enemy) => {
                enemy.shiftDown();
            });
        }


        // Check for bullet-enemy collisions
        for (const enemy of enemies) {
            for (const bullet of bullets) {
                if (collisionDetected(bullet, enemy, gctx)) {
                    bullet.active = false;
                    enemy.active = false;
                    score += 10;
                    break;
                }
            }
        }

        // Remove inactive bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (!bullets[i].active) {
                bullets.splice(i, 1);
            }
        }

        // Remove inactive enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (!enemies[i].active) {
                enemies.splice(i, 1);
            }
        }

        // Enemy reaches deadline (game over)
        for (const enemy of enemies) {
            if (enemy.relY + enemy.relHeight / 2 >= enemyDeadLineY) {
                gameOver = true;
                console.log("Game Over: Enemy reached deadline.");
                break;
            }
        }

        if (lives <= 0) {
            gameOver = true;
            console.log("Game Over: No lives remaining");
        }
    }

    // Draw function
    function draw() {
        // Clear canvas
        gctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);

        // Draw Deadline
        gctx.strokeStyle = "red";
        gctx.lineWidth = 2;
        gctx.beginPath();
        gctx.moveTo(0, enemyDeadLineY * gctx.canvas.height);
        gctx.lineTo(gctx.canvas.width, enemyDeadLineY * gctx.canvas.height);
        gctx.stroke();

        // Draw bullets
        bullets.forEach((bullet) => {
            bullet.draw(gctx);
        });

        // Draw player
        if (player1.isAlive)
            player1.draw(gctx);
        // Draw enemies
        enemies.forEach((enemy) => {
            enemy.draw(gctx);
        });

        // Score and Lives HUD

        scoreDisplay.textContent = `Score: ${score}`;
        livesDisplay.textContent = `Lives: ${lives}`;

        // Game Over / Win Screen
        if (gameOver || playerWon) {
            gctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
            finalScoreDisplay.textContent = `Final Score: ${score}`;
            gameOverWinScreen.classList.remove("hidden");
            hud.classList.add("hidden");
            isGameRunning = false;
            if (gameOver) {
                gameOverTitle.classList.remove("hidden");
                winTitle.classList.add("hidden");
            } else if (playerWon) {
                gameOverTitle.classList.add("hidden");
                winTitle.classList.remove("hidden");
            }
        }
    }
}

startButton.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    game();
});

restartButton.addEventListener("click", () => {
    gameOverWinScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    game();
});
