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
    const playerRelX = 0.5;
    const playerRelY = 0.9;
    const player1 = new Player(
        playerRelX, playerRelY,
        0.5, 0.5,
        0.05, 0.05,
        "green");

    // Bullets Array
    const bullets = [];

    // Enemies Array
    const enemies = [];
    const enemyCount = 5,
        enemyRelWidth = 0.05,
        enemyRelHeight = 0.05;
    const enemyRelSpacing = 0.01;
    let dir = 1;
    for (let i = 0; i < enemyCount; i++) {
        // Minimum distance from edge is made to be same as space between two enemies
        enemies.push(new Enemy(
            i,
            (i + 1) * enemyRelSpacing + (i + 0.5) * enemyRelWidth + 0.001, // Slight offset from left edge
            0.1, // RelY
            0.3, // RelSpeed
            enemyRelWidth,
            enemyRelHeight,
            "red",
            enemyRelSpacing,
            dir,
            0
        ));
    }

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
        requestAnimationFrame(gameloop);
    }
    requestAnimationFrame(gameloop);

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

    // Update function
    function update(deltatime) {
        // Skip updates if game over
        if (gameOver) return;

        player1.update(deltatime, input, gctx);

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

        if (player1.respawnTimer <= 0 && !player1.isAlive) {

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

        // Enemy reaches bottom (game over)
        for (const enemy of enemies) {
            if (enemy.y + enemy.height >= gctx.canvas.height) {
                gameOver = true;
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
            gctx.fillStyle = "white";
            gctx.font = "40px monospace";
            gctx.textAlign = "center";
            gctx.fillText("GAME OVER", gamecanvas.width / 2, gamecanvas.height / 2);
            return;
        }
    }
}

window.addEventListener("DOMContentLoaded", game);
