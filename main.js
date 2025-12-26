import { Player } from "./modules/player.js";
import { Enemy } from "./modules/enemy.js";
import { collisionDetected } from "./modules/collision.js";

function game() {
    /** @type {HTMLCanvasElement} */
    const gamecanvas = document.getElementById("gamecanvas");

    /** @type {CanvasRenderingContext2D} */
    const gctx = gamecanvas.getContext("2d");

    function resizeCanvas() {
        gamecanvas.height = Math.min(window.innerHeight, window.innerWidth);
        gamecanvas.width = gamecanvas.height;
    }


    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Main Player
    const player1 = new Player(0.5, 0.9, 400, 300, 50, 50, "green");

    // Bullets Array
    const bullets = [];

    // Enemies Array
    const enemies = [];
    const enemyCount = 4, enemyWidth = 50, enemyHeight = 50;
    const enemyRelSpacing = 0.03;
    let dir = 1;
    // Minimum distance from edge is made to be same as space between two enemies
    for (let i = 0; i < enemyCount; i++) {
        enemies.push(new Enemy(i, (i + 1) * enemyRelSpacing + (i + 0.5) * enemyWidth / gctx.canvas.width, 0.1, 100, enemyWidth, enemyHeight, "red", enemyRelSpacing, dir, 0));
    }

    let lasttime = performance.now();

    /**
     * @param {number} timestamp
     */
    function gameloop(timestamp) {
        const deltatime = (timestamp - lasttime) / 1000;
        lasttime = timestamp;
        update(deltatime);
        draw();
        requestAnimationFrame(gameloop);
    }
    requestAnimationFrame(gameloop);

    const input = {};

    window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
            e.preventDefault();
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

    function update(deltatime) {
        // TODO: move player, check input etc...
        player1.update(deltatime, input, gctx);
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
        enemies.forEach((enemy, index) => {
            enemy.update(deltatime, gctx);
        });

        // Check for collisions
        for (const enemy of enemies) {
            for (const bullet of bullets) {
                if (collisionDetected(bullet, enemy)) {
                    bullet.active = false;
                    enemy.active = false;
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
    }

    function draw() {
        // TODO: draw players, enemies, bullets etc...
        gctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
        bullets.forEach((bullet) => {
            bullet.draw(gctx);
        });
        player1.draw(gctx);
        enemies.forEach((enemy) => {
            enemy.draw(gctx);
        });
    }

}

window.addEventListener("DOMContentLoaded", game);
