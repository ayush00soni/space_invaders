import { Player } from "./modules/player.js";
import { Enemy } from "./modules/enemy.js";
import { collisionDetected } from "./modules/collision.js";

function game() {
    /** @type {HTMLCanvasElement} */
    const gamecanvas = document.getElementById("gamecanvas");

    /** @type {CanvasRenderingContext2D} */
    const gctx = gamecanvas.getContext("2d");

    // Resize canvas to be square and fit within window
    function resizeCanvas() {
        gamecanvas.height = Math.min(window.innerHeight, window.innerWidth);
        gamecanvas.width = gamecanvas.height;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let gameOver = false; // For game over state
    let lives = 3; // Player lives
    let score = 0; // Player score

    // Main Player
    const player1 = new Player(0.5, 0.9, 400, 300, 50, 50, "green");

    // Bullets Array
    const bullets = [];

    // Enemies Array
    const enemies = [];
    const enemyCount = 5, enemyWidth = 50, enemyHeight = 50;
    const enemyRelSpacing = 0.03;
    let dir = 1;
    for (let i = 0; i < enemyCount; i++) {
        // Minimum distance from edge is made to be same as space between two enemies
        enemies.push(new Enemy(i, (i + 1) * enemyRelSpacing + (i + 0.5) * enemyWidth / gctx.canvas.width, 0.1, 100, enemyWidth, enemyHeight, "red", enemyRelSpacing, dir, 0));
    }

    let lasttime = performance.now(); // For delta time calculation
    // Game Loop
    /**
     * @param {number} timestamp
     */
    function gameloop(timestamp) {
        // console.log("Animation running");
        const deltatime = (timestamp - lasttime) / 1000;
        lasttime = timestamp;
        update(deltatime);
        draw();
        requestAnimationFrame(gameloop);
    }
    requestAnimationFrame(gameloop);

    // Input Handling
    const input = {};

    window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
            e.preventDefault();

            // Prevent opposite directions being active simultaneously
            if (e.code === "ArrowUp" || e.code === "KeyW") {
                input["ArrowDown"] = false;
                input["KeyS"] = false;
            }
            if (e.code === "ArrowLeft" || e.code === "KeyA") {
                input["ArrowRight"] = false;
                input["KeyD"] = false;
            }
            if (e.code === "ArrowDown" || e.code === "KeyS") {
                input["ArrowUp"] = false;
                input["KeyW"] = false;
            }
            if (e.code === "ArrowRight" || e.code === "KeyD") {
                input["ArrowLeft"] = false;
                input["KeyA"] = false;
            }

            input[e.code] = true;
        }
    });

    window.addEventListener("keyup", (e) => {
        input[e.code] = false;
    });

    // Update function
    function update(deltatime) {
        // Skip updates if game over
        if (gameOver) return;

        player1.update(deltatime, input, gctx);

        // Handle shooting
        if (input["Space"]) {
            const bullet = player1.shoot();
            if (bullet) {
                bullets.push(bullet);
            }
        }

        bullets.forEach((bullet, index) => {
            bullet.update(deltatime, gctx);
            if (bullet.isOffScreen()) {
                bullets.splice(index, 1);
            }
        });

        enemies.forEach((enemy) => {
            enemy.update(deltatime, gctx);
        });

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

        // Enemy reaches bottom (game over)
        for (const enemy of enemies) {
            if (enemy.y + enemy.height >= gctx.canvas.height) {
                lives--;
                console.log("Enemy reached bottom");
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

        // Draw bullets
        bullets.forEach((bullet) => {
            bullet.draw(gctx);
        });

        // Draw player
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
            gctx.fillStyle = "white";
            gctx.font = "40px monospace";
            gctx.textAlign = "center";
            gctx.fillText("GAME OVER", gamecanvas.width / 2, gamecanvas.height / 2);
            return;
        }
    }

}

window.addEventListener("DOMContentLoaded", game);
