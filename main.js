import { Player } from "./modules/player.js";
import { collisionDetected } from "./modules/collision.js";
import { generateEnemyWave } from "./modules/enemyWaveGenerator.js";
import { StarField } from "./modules/background.js";
import { Particle } from "./modules/particle.js";
import { SoundManager } from "./modules/soundManager.js";

// UI Setup
const hud = document.getElementById("hud");
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const pauseButton = document.getElementById("pause-button");

// Start Screen Setup
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

// Game Over/Win Screen Setup
const gameOverWinScreen = document.getElementById("game-over-win-screen");
const gameOverTitle = document.getElementById("game-over-title");
const winTitle = document.getElementById("win-title");
const finalScoreDisplay = document.getElementById("final-score-display");
const restartButton = document.getElementById("restart-button");

// Pause Screen Setup
const resumeButton = document.getElementById("resume-button");
const pauseScoreDisplay = document.getElementById("pause-score-display");
const pauseLivesDisplay = document.getElementById("pause-lives-display");

// Background
const starfield = new StarField(5); // 5 stars per 100x100 pixels

// Sound Manager
const soundManager = new SoundManager();

// Game Canvas Setup
/** @type {HTMLCanvasElement} */
const gamecanvas = document.getElementById("gamecanvas");

/** @type {CanvasRenderingContext2D} */
const gctx = gamecanvas.getContext("2d");

let isGameRunning = false;
let paused = false;

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
    starfield.resize(gamecanvas.width, gamecanvas.height);
    if (!isGameRunning) {
        renderInitialScreen();
    }
}
const maxLives = 3; // Maximum player lives
let lives = maxLives; // Player lives
let score = 0; // Player score

// Main Player
const playerRelX = 0.5;
const playerRelY = 0.9;
const player1 = new Player(
    playerRelX, playerRelY,
    0.7, 0.6,
    0.05,
    "green", gctx);

player1.image.onload = () => {
    renderInitialScreen();
};

// Render initial screen with starfield and player
function renderInitialScreen() {
    gctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
    starfield.draw(gctx);
    player1.draw(gctx);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);


function game() {
    isGameRunning = true;
    soundManager.playSound("startGame");

    let gameOver = false; // For game over state
    let playerWon = false; // For win state


    // Bullets Array
    const bullets = [];

    // Enemies Array
    const enemies = [];
    const enemyDeadLineY = playerRelY - player1.relHeight / 2 - 0.05; // Deadline above player
    let wavenumber = 0;
    const enemyWaveDelay = 2; // Seconds between waves
    let enemyWaveTimer = 0;

    // Particle effects array
    const particles = [];

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

    // Flag for game over and player won sound
    let finalSoundPlayed = false;
    // Update function
    function update(deltatime) {
        // Skip updates if game over
        if (!isGameRunning) return;

        // Pause functionality
        if (paused) return;

        player1.update(deltatime, input, soundManager, gctx);

        if (enemies.length === 0) {
            enemyWaveTimer += deltatime;
            // Disable shooting properly during wave transition
            player1.shootingEnabled = false;

            if (isMaxWave) {
                playerWon = true;
                console.log("Player Won: All waves cleared!");
            } else if (enemyWaveTimer >= enemyWaveDelay || wavenumber === 0) {
                // Delete all existing bullets
                bullets.length = 0;

                enemyWaveTimer = 0;
                wavenumber++;
                console.log("enemy wave:", wavenumber);

                if (wavenumber > 1) soundManager.playSound("newWave");
                [newEnemies, isMaxWave] = generateEnemyWave(wavenumber, gctx);
                enemies.push(...newEnemies);
                // Re-enable shooting after new wave spawns
                player1.shootingEnabled = true;
            }
        }

        if (player1.isAlive) {
            // Handle shooting
            if (input["Space"]) {
                const bullet = player1.shoot(soundManager);
                if (bullet) {
                    bullets.push(bullet);
                }
            }

            // Check for player-enemy collisions
            for (const enemy of enemies) {
                // Ignore inactive enemies
                if (!enemy.active) continue;
                if (collisionDetected(player1, enemy, gctx)) {
                    lives--;
                    soundManager.playSound("hit");
                    player1.hit();
                    console.log("Player hit by enemy");
                    // Create particle effect
                    const particleCount = 50;
                    const particleSpeed = 100;
                    for (let i = 0; i < particleCount; i++) {
                        const particle = new Particle(
                            player1.relX,
                            player1.relY,
                            player1.color,
                            0.5,
                            particleSpeed * (1 + Math.random())
                        );
                        particles.push(particle);
                    }
                    break;
                }
            }
        } else if (lives > 0) { // Player is dead
            // Handle Player Respawn logic
            if (player1.respawnTimer > 0) {
                player1.respawnTimer -= deltatime;
            } else {
                if (lives < maxLives) soundManager.playSound("respawn");
                player1.respawn();
                console.log("Player respawned");
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
                    soundManager.playSound("explosion");
                    // Create particle effect
                    const particleCount = 50;
                    const particleSpeed = 100;
                    for (let i = 0; i < particleCount; i++) {
                        const particle = new Particle(
                            enemy.relX,
                            enemy.relY,
                            enemy.color,
                            0.5,
                            particleSpeed * (1 + Math.random())
                        );
                        particles.push(particle);
                    }
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

        // Update particles
        particles.forEach((particle) => {
            particle.update(deltatime, gctx);
        });

        // Remove dead particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // Draw function
    function draw() {
        // Clear canvas
        gctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);

        // Draw starfield background
        starfield.draw(gctx);

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

        // Draw particles
        particles.forEach((particle) => {
            particle.draw(gctx);
        });

        // Score and Lives HUD

        scoreDisplay.textContent = `Score: ${score}`;
        livesDisplay.textContent = `Lives: ${lives}`;

        // Game Over / Win Screen
        if ((gameOver || playerWon) && !finalSoundPlayed) {
            finalSoundPlayed = true;
            const soundDelay = (lives === 0) ? soundManager.getDuration("hit") : 0;
            if (soundDelay > 0) {
                console.log(`Delaying final sound by ${soundDelay} seconds to allow hit sound to finish.`);
            }
            setTimeout(() => {
                if (gameOver) {
                    soundManager.playSound("gameOver");
                } else if (playerWon) {
                    soundManager.playSound("playerWin");
                }
            }, soundDelay * 1000);
            // Delay showing game over screen to allow last frame to render
            setTimeout(() => {
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
            }, 1000 + (soundDelay * 1000));

        }
    }
}

startButton.addEventListener("click", () => {
    // Reset game state
    score = 0;
    lives = 3;
    startScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    // Clear input states
    for (const key in input) {
        input[key] = false;
    }
    game();
});

restartButton.addEventListener("click", () => {
    // Reset game state
    score = 0;
    lives = 3;
    gameOverWinScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    // Clear input states
    for (const key in input) {
        input[key] = false;
    }
    game();
});

pauseButton.addEventListener("click", () => {
    paused = true;
    pauseScoreDisplay.textContent = `Score: ${score}`;
    pauseLivesDisplay.textContent = `Lives: ${lives}`;
    document.getElementById("pause-screen").classList.remove("hidden");
    hud.classList.add("hidden");
});

resumeButton.addEventListener("click", () => {
    paused = false;
    document.getElementById("pause-screen").classList.add("hidden");
    hud.classList.remove("hidden");
});