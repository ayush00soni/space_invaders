import { Player } from "./modules/player.js";

function game() {
    /** @type {HTMLCanvasElement} */
    const gamecanvas = document.getElementById("gamecanvas");

    /** @type {CanvasRenderingContext2D} */
    const gctx = gamecanvas.getContext("2d");

    const player1 = new Player(0.5, 0.9, 400, 300, 50, 50, "white");

    function resizeCanvas() {
        gamecanvas.height = window.innerHeight;
        gamecanvas.width = window.innerWidth;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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

    console.log(player1);

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
    }

    function draw() {
        // TODO: draw players, enemies, bullets etc...
        gctx.clearRect(0, 0, gamecanvas.width, gamecanvas.height);
        player1.draw(gctx);
    }

    // Bullets Array
    const bullets = [];
    

}

window.addEventListener("DOMContentLoaded", game);
