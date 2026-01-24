export const PARTICLE_MODE = {
    EXPLOSION: 1,
    IMPLOSION: 0
};

/**
 * Represents a visual particle effect (Explosion or Implosion).
 * Handles physics updates and canvas drawing with fading/glowing effects.
 */
export class Particle {
    /**
     * @param {number} relX - Center X position of the effect
     * @param {number} relY - Center Y position of the effect
     * @param {string} color - CSS color string for the particle
     * @param {number} decay - Rate at which the particle fades out per second
     * @param {number} speed - Movement speed of the particle
     * @param {number} mode - 1 for EXPLOSION (moves out), 0 for IMPLOSION (moves in)
     * @param {CanvasRenderingContext2D} gctx - Context used to calculate relative radius for implosion
     */
    constructor(relX, relY, color, decay, speed, mode, gctx) {
        // Particle Mode -> 1: particle for explosion, 0:particle for implosion
        this.mode = mode;

        // Speed and direction
        this.speed = speed;
        this.dir = (this.mode) ? 1 : -1; // 1 for explosion and -1 for implosion
        this.angle = Math.random() * 2 * Math.PI;
        this.vx = this.dir * Math.cos(this.angle) * this.speed;
        this.vy = this.dir * Math.sin(this.angle) * this.speed;

        // Position
        if (mode) {
            this.relX = relX;
            this.relY = relY;
        } else {
            // Radius for implosion effect only
            this.radius = (speed / decay) / Math.hypot(gctx.canvas.width, gctx.canvas.height);
            this.relX = relX + this.radius * Math.cos(this.angle);
            this.relY = relY + this.radius * Math.sin(this.angle);
        }

        // Size Configuration
        this.maxSize = 3;
        this.size = this.maxSize * Math.random();

        // Other attributes
        this.color = color;
        this.decay = decay;
        this.life = 1.0;
    }

    /**
     * Updates particle position, velocity, and life (opacity).
     * @param {number} deltatime
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime, gctx) {
        this.relX += this.vx * deltatime / gctx.canvas.width;
        this.relY += this.vy * deltatime / gctx.canvas.height;
        this.life = Math.min(Math.max(this.life - this.decay * deltatime, 0), 1);
    }

    /**
     * Renders the particle.
     * Handles fading opacity and special glowing effects for implosions.
     * @param {CanvasRenderingContext2D} gctx
     */
    draw(gctx) {
        this.x = gctx.canvas.width * this.relX;
        this.y = gctx.canvas.height * this.relY;
        this.currSize = this.size * this.life;
        gctx.save();
        if (!this.mode) {
            // Add glowing effect for implosion particles
            gctx.shadowColor = this.color;
            gctx.shadowBlur = 10;
            gctx.globalCompositeOperation = 'lighter';
        }
        gctx.globalAlpha = this.life;
        gctx.fillStyle = this.color;
        gctx.beginPath();
        gctx.arc(this.x, this.y, this.currSize, 0, 2 * Math.PI);
        gctx.fill();
        gctx.restore();
    }
}