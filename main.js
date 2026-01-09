import { Player } from "./modules/player.js";
import { collisionDetected } from "./modules/collision.js";
import { generateEnemyWave } from "./modules/enemyWaveGenerator.js";

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
    /** @type {HTMLCanvasElement} */
    const gamecanvas = document.getElementById("gamecanvas");

    /** @type {CanvasRenderingContext2D} */
    const gctx = gamecanvas.getContext("2d");


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
        if (gameOver || playerWon) return;
        requestAnimationFrame(gameloop);
    }
    requestAnimationFrame(gameloop);


    let newEnemies = [];
    let isMaxWave = false;

    // Update function
    function update(deltatime) {
        // Skip updates if game over
        if (gameOver || playerWon) return;

        player1.update(deltatime, input, gctx);

        if (enemies.length === 0) {
            enemyWaveTimer += deltatime;
            if (isMaxWave) { playerWon = true; console.log("Player Won: All waves cleared!"); }
            else if (enemyWaveTimer >= enemyWaveDelay || wavenumber === 0) {
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
        gctx.fillStyle = "white";
        gctx.font = "20px monospace";
        gctx.textAlign = "left";

        gctx.fillText(`Score: ${score}`, 20, 30);
        gctx.fillText(`Lives: ${lives}`, 20, 60);

        // Game Over Screen
        if (gameOver) {
            const gap = 30;
            gctx.fillStyle = "white";
            gctx.font = "40px monospace";
            gctx.textAlign = "center";
            gctx.fillText("GAME OVER", gamecanvas.width / 2, gamecanvas.height / 2 - gap / 2);
            gctx.fillStyle = "white";
            gctx.font = "20px monospace";
            gctx.textAlign = "center";
            gctx.fillText("Press Enter to Restart", gamecanvas.width / 2, gamecanvas.height / 2 + gap / 2);
            isGameRunning = false;
        }

        // Win Screen
        if (playerWon) {
            const gap = 30;
            gctx.fillStyle = "white";
            gctx.font = "40px monospace";
            gctx.textAlign = "center";
            gctx.fillText("YOU WIN!", gamecanvas.width / 2, gamecanvas.height / 2 - gap / 2);
            gctx.fillStyle = "white";
            gctx.font = "20px monospace";
            gctx.textAlign = "center";
            gctx.fillText("Press Enter to Restart", gamecanvas.width / 2, gamecanvas.height / 2 + gap / 2);
            isGameRunning = false;
        }
    }
}

window.addEventListener("DOMContentLoaded", game);

// Reset game
['keydown', 'click'].forEach(eventType => {
    window.addEventListener(eventType, (e) => {
        if ((e.type === "click" || e.code === "Enter") && !isGameRunning) {
            game();
        }
    });
});
