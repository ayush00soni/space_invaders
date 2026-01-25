import { Player } from "./modules/player.js";
import { collisionDetected } from "./modules/collision.js";
import { generateEnemyWave } from "./modules/enemyWaveGenerator.js";
import { StarField } from "./modules/background.js";
import { Particle } from "./modules/particle.js";
import { SoundManager } from "./modules/soundManager.js";
import { PARTICLE_MODE } from "./modules/particle.js";

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
const pauseScreen = document.getElementById("pause-screen");
const resumeButton = document.getElementById("resume-button");
const pauseScoreDisplay = document.getElementById("pause-score-display");
const pauseLivesDisplay = document.getElementById("pause-lives-display");

// Background
const STAR_DENSITY = 5 / (100 * 100); // stars per pixel -> Here 5 stars out of 100x100 pixel area
const MIN_STAR_RADIUS = 0.5;
const MIN_START_OPACITY = 0.5;
const starfield = new StarField(
    STAR_DENSITY,
    MIN_STAR_RADIUS,
    MIN_START_OPACITY
);

// Sound Manager
const soundManager = new SoundManager();

// Game Canvas Setup
/** @type {HTMLCanvasElement} */
const gamecanvas = document.getElementById("gamecanvas");

/** @type {CanvasRenderingContext2D} */
const gctx = gamecanvas.getContext("2d");

// CONFIGURATIONS
// Player Configuration
const PLAYER_START_X = 0.5;
const PLAYER_START_Y = 0.9;
const PLAYER_HIT_SOUND = "explosion";
const PLAYER_MAX_SPEED = 0.7; // Relative to canvas size
const PLAYER_ACCELERATION = 0.6; // Relative to canvas size
const PLAYER_DEC_FACTOR = 6; // Deceleration factor
const PLAYER_REL_WIDTH = 0.05;
const PLAYER_COLOR = "green";
const PLAYER_RESPAWN_DELAY = (soundManager.getDuration(PLAYER_HIT_SOUND) + 2); // Seconds
const PLAYER_SHOOT_COOLDOWN = 0.4; // Seconds between shots
const PLAYER_INVINCIBILITY_DURATION = 3; // Seconds of invincibility after respawn
const MAX_LIVES = 3; // Maximum player lives

// Player Bullet Configuration
const PLAYER_BULLET_SPEED = 0.8;
const PLAYER_BULLET_WIDTH = 0.005;
const PLAYER_BULLET_COLOR = "green";

// Enemy Wave Configuration
const ENEMY_SHOOT_INTERVAL = 2; // Seconds between enemy shots
const ENEMY_DEADLINE_OFFSET = 0.05; // Distance from player to enemy deadline
const ENEMY_WAVE_DELAY = 2; // Seconds between waves
const ENEMY_HIT_SOUND = "explosion";

// Particle Effect Configuration for explosions
const EXPLOSION_PARTICLE_COUNT = 50;
const EXPLOSION_PARTICLE_SPEED = 50;
const EXPLOSION_PARTICLE_DECAY = 0.8;

// Game State Variables
let isGameRunning = false;
let paused = false;
let lives = MAX_LIVES; // Player lives
let score = 0; // Player score

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
    "KeyD": false,
    "Escape": false
};


window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft",
        "ArrowRight", "Space", "KeyW",
        "KeyA", "KeyS", "KeyD", "Escape"].includes(e.code)) {
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


// Main Player
const player1 = new Player(
    PLAYER_START_X,
    PLAYER_START_Y,
    PLAYER_MAX_SPEED,
    PLAYER_ACCELERATION,
    PLAYER_DEC_FACTOR,
    PLAYER_REL_WIDTH,
    PLAYER_COLOR,
    PLAYER_RESPAWN_DELAY,
    PLAYER_SHOOT_COOLDOWN,
    PLAYER_INVINCIBILITY_DURATION,
    PLAYER_BULLET_SPEED,
    PLAYER_BULLET_WIDTH,
    PLAYER_BULLET_COLOR
);

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

// Delta time cap to avoid big jumps
const DELTA_TIME_CAP = 0.1;

// Delay for Game Over Screen
const GAME_OVER_DELAY = 1000;

// Main Game Function
function game() {
    isGameRunning = true;
    soundManager.playSound("startGame");
    // Enable player shooting
    player1.shootingEnabled = true;

    let gameOver = false; // For game over state
    let playerWon = false; // For win state


    // Player Bullets Array
    const playerBullets = [];

    // Enemy Bullet Array
    const enemyBullets = [];
    let enemyShootTimer = 0;

    // Enemies Array
    const enemies = [];
    const enemyDeadLineY = PLAYER_START_Y - player1.relHeight / 2 - ENEMY_DEADLINE_OFFSET; // Deadline above player
    let wavenumber = 0;
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

        const deltatime = Math.min((timestamp - lasttime) / 1000, DELTA_TIME_CAP); // Cap delta time to avoid big jumps
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

        // Pause when escape is pressed
        if (input["Escape"]) {
            pauseButton.click();
            input["Escape"] = false; // Prevent multiple toggles
        }

        // Pause functionality
        if (paused) return;

        // Increase enemy shoot timer
        enemyShootTimer += deltatime;

        if (!(gameOver || playerWon))
            player1.update(deltatime, input);

        if (enemies.length === 0) {
            enemyWaveTimer += deltatime;
            // Disable shooting properly during wave transition
            player1.shootingEnabled = false;

            if (isMaxWave) {
                playerWon = true;
            } else if (enemyWaveTimer >= ENEMY_WAVE_DELAY || wavenumber === 0) {
                // Delete all existing bullets
                playerBullets.length = 0;

                enemyWaveTimer = 0;
                wavenumber++;

                if (wavenumber > 1) soundManager.playSound("newWave");
                [newEnemies, isMaxWave] = generateEnemyWave(wavenumber);
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
                    playerBullets.push(bullet);
                }
            }

            // Check for player-enemy collisions
            for (const enemy of enemies) {
                // Ignore inactive enemies
                if (!enemy.active) continue;
                if (collisionDetected(player1, enemy, gctx) && player1.invincibilityTimer <= 0) {
                    lives--;
                    const newParticles = player1.hit(
                        soundManager,
                        PLAYER_HIT_SOUND,
                        EXPLOSION_PARTICLE_COUNT,
                        EXPLOSION_PARTICLE_SPEED,
                        EXPLOSION_PARTICLE_DECAY,
                        gctx);
                    particles.push(...newParticles);
                    break;
                }
            }
        } else if (lives > 0) { // Player is dead
            // Handle Player Respawn logic
            if (player1.respawnTimer > 0) {

                if (player1.respawnTimer < player1.respawnDelay - soundManager.getDuration(PLAYER_HIT_SOUND)) { // Start implosion when hit sound ends
                    // Generate implosion particles during respawn delay
                    const implosionRadius = Math.max(player1.relWidth, player1.relHeight);
                    const particleDecay = 1 / player1.respawnTimer;
                    const particleSpeed = implosionRadius * particleDecay * Math.hypot(gctx.canvas.width, gctx.canvas.height);
                    particles.push(new Particle(
                        player1.relXi,
                        player1.relYi,
                        player1.color,
                        particleDecay,
                        particleSpeed,
                        PARTICLE_MODE.IMPLOSION,
                        gctx
                    ));
                }
                player1.respawnTimer -= deltatime;
            } else {
                soundManager.playSound("respawn");
                player1.respawn();
            }
        }

        playerBullets.forEach((bullet, index) => {
            bullet.update(deltatime);
            if (bullet.isOffScreen()) {
                playerBullets.splice(index, 1);
            }
        });

        enemyBullets.forEach((bullet, index) => {
            bullet.update(deltatime);
            if (bullet.isOffScreen()) {
                enemyBullets.splice(index, 1);
            }
        });

        let hitEdge = false;
        enemies.forEach((enemy) => {
            if (!(gameOver || playerWon))
                enemy.update(deltatime);
        });
        enemies.forEach((enemy) => {
            if (enemy.isOnEdge(deltatime)) {
                hitEdge = true;
            }
        });
        if (hitEdge) {
            enemies.forEach((enemy) => {
                enemy.shiftDown();
            });
        }

        // Enemy Shooting
        if (enemyShootTimer >= ENEMY_SHOOT_INTERVAL && !(gameOver || playerWon)) {
            enemyShootTimer = 0;
            // Select a random active enemy to shoot
            const activeEnemies = enemies.filter(enemy => enemy.active);
            if (activeEnemies.length > 0) {
                const shootingEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                const enemyBullet = shootingEnemy.shoot(soundManager);
                enemyBullets.push(enemyBullet);
            }
        }

        // Check for playerBullet-enemy collisions
        for (const enemy of enemies) {
            for (const bullet of playerBullets) {
                if (bullet.active && enemy.active && collisionDetected(bullet, enemy, gctx)) {
                    bullet.active = false;
                    enemy.active = false;
                    score += 10;
                    soundManager.playSound(ENEMY_HIT_SOUND);
                    // Create particle effect
                    for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
                        const particle = new Particle(
                            enemy.relX,
                            enemy.relY,
                            enemy.color,
                            EXPLOSION_PARTICLE_DECAY,
                            EXPLOSION_PARTICLE_SPEED * (1 + Math.random()),
                            PARTICLE_MODE.EXPLOSION,
                            gctx
                        );
                        particles.push(particle);
                    }
                    break;
                }
            }
        }

        // Check for enemyBullet-player collisions
        if (player1.isAlive) {
            for (const bullet of enemyBullets) {
                if (bullet.active && collisionDetected(bullet, player1, gctx) && player1.invincibilityTimer <= 0) {
                    bullet.active = false;
                    lives--;
                    soundManager.playSound(PLAYER_HIT_SOUND);
                    const newParticles = player1.hit(soundManager, PLAYER_HIT_SOUND, EXPLOSION_PARTICLE_COUNT, EXPLOSION_PARTICLE_SPEED, EXPLOSION_PARTICLE_DECAY, gctx);
                    particles.push(...newParticles);
                }
            }
        }

        // Remove inactive bullets
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            if (!playerBullets[i].active) {
                playerBullets.splice(i, 1);
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
                break;
            }
        }

        if (lives <= 0) {
            gameOver = true;
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
        playerBullets.forEach((bullet) => {
            bullet.draw(gctx);
        });
        enemyBullets.forEach((bullet) => {
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
            // Clear bullets
            playerBullets.length = 0;
            enemyBullets.length = 0;

            // Disable shooting
            player1.shootingEnabled = false;

            finalSoundPlayed = true;
            const soundDelay = (lives === 0) ? soundManager.getDuration(PLAYER_HIT_SOUND) : 0;

            setTimeout(() => {
                if (gameOver) {
                    soundManager.playSound("gameOver");
                } else if (playerWon) {
                    soundManager.playSound("playerWon");
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
            }, GAME_OVER_DELAY + (soundDelay * 1000));

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
    player1.reset();
    gameOverWinScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    // Clear input states
    for (const key in input) {
        input[key] = false;
    }
    game();
});

pauseButton.addEventListener("click", () => {
    if (!paused) {
        soundManager.playSound("pause");
        paused = true;
        pauseScoreDisplay.textContent = `Score: ${score}`;
        pauseLivesDisplay.textContent = `Lives: ${lives}`;
        pauseScreen.classList.remove("hidden");
        hud.classList.add("hidden");
    }
});

resumeButton.addEventListener("click", () => {
    if (paused) {
        soundManager.playSound("pause");
        paused = false;
        pauseScreen.classList.add("hidden");
        hud.classList.remove("hidden");
    }
});

// Service Worker Invoked
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then((registration) => {
                console.log("ServiceWorker registered:", registration);
            })
            .catch((error) => {
                console.log("ServiceWorker registration failed:", error);
            });
    });
}