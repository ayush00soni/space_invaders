import { Bullet } from "./bullet.js";

export class Player {
    /**
     * @param {number} relX
     * @param {number} relY
     * @param {number} relMaxSpeed
     * @param {number} relAcceleration
     * @param {number} width
     * @param {number} height
     * @param {string} color
     */
    constructor(relX, relY, relMaxSpeed, relAcceleration, relWidth, color, lives, gctx) {
        this.relX = relX;
        this.relY = relY;
        this.relXi = relX; // Initial positions for respawn
        this.relYi = relY; // Initial positions for respawn
        this.relMaxSpeed = relMaxSpeed;
        this.relAcceleration = relAcceleration;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.shootCooldown = 0;
        this.isAlive = true;
        this.respawnDelay = 1;
        this.respawnTimer = 0;
        this.decFactor = 6; // Deceleration factor
        this.shootingEnabled = true;
        this.image = new Image();
        this.image.src = "assets/player.png";
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;
        this.gctx = gctx;
        this.lives = lives;
        this.maxLives = lives;
    }
    /**
     * @param {CanvasRenderingContext2D} gctx
    */
    draw(gctx) {
        this.width = gctx.canvas.width * this.relWidth;
        this.aspectRatio = this.image.naturalHeight / this.image.naturalWidth;
        this.height = this.width * this.aspectRatio;
        this.relHeight = this.height / gctx.canvas.height;
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        if (this.image.complete) {
            gctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            gctx.fillStyle = this.color;
            gctx.fillRect(this.x, this.y, this.width, this.height);
        }

    }

    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - this.relWidth * gctx.canvas.width / 2,
            y: gctx.canvas.height * this.relY - this.relHeight * gctx.canvas.height / 2,
            width: this.relWidth * gctx.canvas.width,
            height: this.relHeight * gctx.canvas.height
        };
    }

    /**
    * @param {number} deltatime
    * @param {CanvasRenderingContext2D} gctx
    */
    move(deltatime, gctx) {

        this.relX += this.vx * deltatime;
        this.relY += this.vy * deltatime;

        // Keep player within screen bounds
        this.relX = Math.max(this.relWidth / 2,
            Math.min(1 - this.relWidth / 2, this.relX));
        this.relY = Math.max(this.relHeight / 2,
            Math.min(1 - this.relHeight / 2, this.relY));

    }

    accelerate(deltatime, input) {

        const dirX = (Number(input["ArrowRight"] || input["KeyD"]) -
            Number(input["ArrowLeft"] || input["KeyA"]));

        const dirY = (Number(input["ArrowDown"] || input["KeyS"]) -
            Number(input["ArrowUp"] || input["KeyW"]));

        // X direction
        if (!dirX || this.vx * dirX < 0) { // Deceleration
            this.vx = Math.max(0, Math.abs(this.vx) - this.decFactor * this.relAcceleration * deltatime) * Math.sign(this.vx);
        } else {
            this.vx += dirX * this.relAcceleration * deltatime;
        }

        // Y direction
        if (!dirY || this.vy * dirY < 0) { // Deceleration
            this.vy = Math.max(0, Math.abs(this.vy) - this.decFactor * this.relAcceleration * deltatime) * Math.sign(this.vy);
        } else {
            this.vy += dirY * this.relAcceleration * deltatime;
        }

        // Clamp speed to maxSpeed
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > this.relMaxSpeed) {
            const scale = this.relMaxSpeed / speed;
            this.vx *= scale;
            this.vy *= scale;
        }

    }

    shoot(soundManager) {
        if (this.shootCooldown > 0 || !this.shootingEnabled) return null;
        soundManager.playSound("shoot");
        this.shootCooldown = 0.5;
        const bullet = new Bullet(
            this.relX, this.relY,
            0.8,
            0.005,
            "blue", this.gctx
        );
        return bullet;
    }

    /**
     * @param {number} deltatime
     * @param {object} input
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime, input, soundManager, gctx) { // Player is alive
        if (this.isAlive) {
            this.shootCooldown = Math.max(this.shootCooldown - deltatime, 0);
            // Handle input for acceleration
            this.accelerate(deltatime, input);

            // Handle input for movement
            this.move(deltatime, gctx);
        } else { // Player is dead#
            // Respawn logic
            if (this.respawnTimer > 0) {
                this.respawnTimer -= deltatime;
            } else {
                this.lives--;

                if (this.lives < this.maxLives) soundManager.playSound("respawn");
                this.respawn();
                console.log("Player respawned");
            }
        }
    }

    hit() {
        this.isAlive = false;
        this.vx = 0;
        this.vy = 0;
        this.respawnTimer = this.respawnDelay;
    }

    respawn() {
        this.relX = this.relXi;
        this.relY = this.relYi;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
    }

}