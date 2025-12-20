import { Bullet } from "./bullet.js";

export class Player {
    /**
     * @param {number} relX
     * @param {number} relY
     * @param {number} maxSpeed
     * @param {number} acceleration
     * @param {number} width
     * @param {number} height
     * @param {string} color
     */
    constructor(relX, relY, maxSpeed, acceleration, width, height, color) {
        this.relX = relX;
        this.relY = relY;
        this.x = 0;
        this.y = 0;
        this.maxSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.vx = 0;
        this.vy = 0;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    /**
    * @param {CanvasRenderingContext2D} gctx
    */
    draw(gctx) {
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw midpoint marker (for bullet origin)
        const mS = 4;
        gctx.fillStyle = "red";
        gctx.fillRect(this.x + this.width / 2 - mS / 2, this.y, mS, mS);
    }
    /**
    * @param {number} deltatime
    * @param {CanvasRenderingContext2D} gctx
    */
    move(deltatime, gctx) {

        const relDispX = this.vx * deltatime / gctx.canvas.width;
        const relDispY = this.vy * deltatime / gctx.canvas.height;

        this.relX += relDispX;
        this.relY += relDispY;

        // Keep player within screen bounds
        this.relX = Math.max(this.width / (2 * gctx.canvas.width),
            Math.min(1 - this.width / (2 * gctx.canvas.width), this.relX));
        this.relY = Math.max(this.height / (2 * gctx.canvas.height),
            Math.min(1 - this.height / (2 * gctx.canvas.height), this.relY));

    }

    accelerate(deltatime, input) {
        let accX = false;
        let accY = false;
        const decFactor = 8;
        const decX = () => { this.vx = Math.max(0, Math.abs(this.vx) - decFactor * this.acceleration * deltatime) * Math.sign(this.vx); };
        const decY = () => { this.vy = Math.max(0, Math.abs(this.vy) - decFactor * this.acceleration * deltatime) * Math.sign(this.vy); };

        if (input["ArrowUp"] || input["KeyW"]) {
            if (this.vy > 0) decY();
            else this.vy -= this.acceleration * deltatime;
            accY = true;
        }
        if (input["ArrowDown"] || input["KeyS"]) {
            if (this.vy < 0) decY();
            else this.vy += this.acceleration * deltatime;
            accY = true;
        }
        if (input["ArrowLeft"] || input["KeyA"]) {
            if (this.vx > 0) decX();
            else this.vx -= this.acceleration * deltatime;
            accX = true;
        }
        if (input["ArrowRight"] || input["KeyD"]) {
            if (this.vx < 0) decX();
            else this.vx += this.acceleration * deltatime;
            accX = true;
        }

        if (!(accX)) decX();
        if (!(accY)) decY();


        // Clamp speed to maxSpeed
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > this.maxSpeed) {
            const scale = this.maxSpeed / speed;
            this.vx *= scale;
            this.vy *= scale;
        }

        console.log(speed);
    }

    shoot() {
        const bullet = new Bullet(this.relX, this.relY, 0.5, 5, "yellow");
        return bullet;
    }

    /**
     * @param {number} deltatime
     * @param {object} input
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime, input, gctx) {
        // TODO: implement player-specific update logic (e.g. movement, shooting)

        // Handle input for acceleration
        this.accelerate(deltatime, input);

        // Handle input for movement
        this.move(deltatime, gctx);
    }

}