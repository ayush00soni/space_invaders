import { Bullet } from "./bullet.js";
import { BULLET_DIRECTION } from "./bullet.js";
import { Particle } from "./particle.js";
import { PARTICLE_MODE } from "./particle.js";

/**
 * Represents the player's spaceship.
 * Handles movement, rendering, shooting, and state management (health/respawn).
 */
export class Player {
    /**
     * @param {number} relX - Initial relative X position (0.0 to 1.0)
     * @param {number} relY - Initial relative Y position (0.0 to 1.0)
     * @param {number} relMaxSpeed - Maximum speed relative to canvas size
     * @param {number} relAcceleration - Acceleration rate relative to canvas size
     * @param {number} decFactor - Deceleration friction factor
     * @param {number} relWidth - Width relative to canvas width
     * @param {string} color - Fallback color for the player
     * @param {number} respawnDelay - Time in seconds before respawning
     * @param {number} shootCooldownTime - Minimum time between shots
     * @param {number} invincibilityDuration - Time in seconds to remain invincible after spawn
     * @param {number} bulletRelSpeed - Bullet speed relative to canvas height
     * @param {number} bulletRelWidth - Bullet width relative to canvas width
     * @param {string} bulletColor - Color of the projectile
     */
    constructor(relX, relY, relMaxSpeed, relAcceleration, decFactor, relWidth, color, respawnDelay, shootCooldownTime,
        invincibilityDuration,
        bulletRelSpeed, bulletRelWidth, bulletColor
    ) {
        // Position
        this.relX = relX;
        this.relY = relY;
        this.relXi = relX; // Initial positions for respawn
        this.relYi = relY; // Initial positions for respawn

        this.color = color;

        // Dimensions
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;

        // Movement properties
        this.vx = 0;
        this.vy = 0;
        this.relMaxSpeed = relMaxSpeed;
        this.relAcceleration = relAcceleration;
        this.decFactor = decFactor;

        // Shooting properties
        this.shootCooldown = 0;
        this.shootingEnabled = true;
        this.shootCooldownTime = shootCooldownTime;
        this.shootSound = "shoot";

        // Respawn properties
        this.respawnTimer = 0;
        this.respawnDelay = respawnDelay;

        // Load player image
        this.image = new Image();
        this.image.src = "assets/img/player.png";

        // Invincibility properties
        this.invincibilityDuration = invincibilityDuration; // seconds
        this.invincibilityTimer = 0;

        // Bullet properties
        this.bulletRelSpeed = bulletRelSpeed;
        this.bulletRelWidth = bulletRelWidth;
        this.bulletColor = bulletColor;
        this.bulletImageSrc = "assets/img/green_laser.png";

        // Player state
        this.isAlive = true;
    }
    /**
     * @param {CanvasRenderingContext2D} gctx
    */
    draw(gctx) {
        // Resize player to the image aspect ratio
        this.aspectRatio = this.image.naturalHeight / this.image.naturalWidth;
        this.width = gctx.canvas.width * this.relWidth;
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
            const alpha = this.invincibilityTimer / this.invincibilityDuration;
            gctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`;
            gctx.lineWidth = 3;
            gctx.shadowBlur = 20;
            gctx.shadowColor = 'green';
            gctx.stroke();
            gctx.restore();
        }

    }

    /**
     * Returns the bounding box of the player for collision detection.
     * @param {CanvasRenderingContext2D} gctx
     * @returns {{x: number, y: number, width: number, height: number}}
     */
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
    */
    move(deltatime) {
        // Update position
        this.relX += this.vx * deltatime;
        this.relY += this.vy * deltatime;

        // Keep player within screen bounds
        this.relX = Math.max(this.relWidth / 2,
            Math.min(1 - this.relWidth / 2, this.relX));
        this.relY = Math.max(this.relHeight / 2,
            Math.min(1 - this.relHeight / 2, this.relY));

    }

    /**
    * @param {number} deltatime
    * @param {object} input
    */
    accelerate(deltatime, input) {
        // Movement Directions
        const dirX = (Number(input["ArrowRight"] || input["KeyD"]) -
            Number(input["ArrowLeft"] || input["KeyA"]));

        const dirY = (Number(input["ArrowDown"] || input["KeyS"]) -
            Number(input["ArrowUp"] || input["KeyW"]));

        // X velocity
        if (!dirX || this.vx * dirX < 0) { // Deceleration
            this.vx = Math.max(0, Math.abs(this.vx) - this.decFactor * this.relAcceleration * deltatime) * Math.sign(this.vx);
        } else {
            this.vx += dirX * this.relAcceleration * deltatime;
        }

        // Y velocity
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

    /**
     * Attempts to fire a bullet.
     * Checks cooldown and shooting enabled state before firing.
     * @param {SoundManager} soundManager - Reference to the audio system
     * @returns {Bullet|null} The created bullet or null if cooldown is active
     */
    shoot(soundManager) {
        if (this.shootCooldown > 0 || !this.shootingEnabled) return null;
        soundManager.playSound(this.shootSound);
        this.shootCooldown = this.shootCooldownTime;
        const bullet = new Bullet(
            this.relX, this.relY,
            this.bulletRelSpeed,
            this.bulletRelWidth,
            this.bulletColor,
            this.bulletImageSrc,
            BULLET_DIRECTION.UP
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

    /**
     * Handles the player getting hit by an enemy projectile or collision.
     * Triggers the explosion effect and disables the player.
     * @param {SoundManager} soundManager
     * @param {string} playerHitSound - ID of the sound to play
     * @param {number} explosionParticleCount - Number of particles to spawn
     * @param {number} explosionParticleSpeed - Base speed of particles
     * @param {number} explosionParticleDecay - How fast particles fade
     * @param {CanvasRenderingContext2D} gctx
     * @returns {Particle[]} An array of explosion particles to add to the game loop
     */
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
                explosionParticleSpeed * (1 + Math.random()),
                PARTICLE_MODE.EXPLOSION,
                gctx
            );
            particles.push(particle);
        }
        return particles;
    }

    /**
     * Resets the player to the initial position and activates invincibility.
     * Called after the respawn timer expires.
     */
    respawn() {
        this.relX = this.relXi;
        this.relY = this.relYi;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
        this.invincibilityTimer = this.invincibilityDuration;
    }

    /**
     * Completely resets the player state for a new game.
     * Restores lives (handled externally), position, and clears timers.
     */
    reset() {
        this.relX = this.relXi;
        this.relY = this.relYi;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.respawnTimer = 0;
    }

}