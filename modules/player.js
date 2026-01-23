import { Bullet } from "./bullet.js";
import { Particle } from "./particle.js";

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
    constructor(relX, relY, relMaxSpeed, relAcceleration, relWidth, color, respawnDelay) {
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
        this.respawnDelay = respawnDelay;
        this.respawnTimer = 0;
        this.decFactor = 6; // Deceleration factor
        this.shootingEnabled = true;
        this.image = new Image();
        this.image.src = "assets/img/player.png";
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;

        this.invincibilityDuration = 3; // seconds
        this.invincibilityTimer = 0;
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

        // draw invincibility overlay
        if (this.invincibilityTimer > 0) {
            gctx.save();
            gctx.beginPath();
            gctx.arc(this.x + this.width / 2, this.y + this.height / 2, Math.max(this.width, this.height), 0, 2 * Math.PI);
            gctx.strokeStyle = `rgba(0, 255, 0, ${(this.invincibilityTimer / this.invincibilityDuration)})`;
            gctx.lineWidth = 3;
            gctx.shadowBlur = 20;
            gctx.shadowColor = 'green';
            gctx.stroke();
            gctx.restore();
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
    move(deltatime) {

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
        this.shootCooldown = 0.4;
        const bullet = new Bullet(
            this.relX, this.relY,
            0.8,
            0.005,
            "green",
            "assets/img/green_laser.png"
        );
        return bullet;
    }

    /**
     * @param {number} deltatime
     * @param {object} input
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime, input) { // Player is alive
        if (this.isAlive) {
            this.shootCooldown = Math.max(this.shootCooldown - deltatime, 0);
            this.invincibilityTimer = Math.max(this.invincibilityTimer - deltatime, 0);

            // Handle input for acceleration
            this.accelerate(deltatime, input);

            // Handle input for movement
            this.move(deltatime);
        }
    }

    hit(soundManager, playerHitSound, explosionParticleCount, explosionParticleSpeed, explosionParticleDecay, gctx) {
        soundManager.playSound(playerHitSound);
        this.isAlive = false;
        this.vx = 0;
        this.vy = 0;
        this.respawnTimer = this.respawnDelay;
        const particles = [];
        // Create particle effect
        for (let i = 0; i < explosionParticleCount; i++) {
            const particle = new Particle(
                this.relX,
                this.relY,
                this.color,
                explosionParticleDecay,
                explosionParticleSpeed * (1 + Math.random()), 1, gctx
            );
            particles.push(particle);
        }
        return particles;
    }

    respawn() {
        this.relX = this.relXi;
        this.relY = this.relYi;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
        this.invincibilityTimer = this.invincibilityDuration;
    }

    reset() {
        this.relX = this.relXi;
        this.relY = this.relYi;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
    }

}