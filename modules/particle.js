export class Particle {
    constructor(relX, relY, color, decay, speed, mode, gctx) {
        this.color = color;
        this.decay = decay;
        this.life = 1.0;
        this.speed = speed;
        this.maxSize = 3;
        this.size = this.maxSize * Math.random();
        this.angle = Math.random() * 2 * Math.PI;
        if (mode) {
            this.relX = relX;
            this.relY = relY;
        } else {
            this.radius = (speed / decay) / Math.hypot(gctx.canvas.width, gctx.canvas.height);
            this.relX = relX + this.radius * Math.cos(this.angle);
            this.relY = relY + this.radius * Math.sin(this.angle);
        }
        this.mode = mode; // 1: particle for explosion, 0:particle for implosion
        this.dir = (this.mode) ? 1 : -1;
        this.vx = this.dir * Math.cos(this.angle) * this.speed;
        this.vy = this.dir * Math.sin(this.angle) * this.speed;
    }

    update(deltatime, gctx) {
        this.relX += this.vx * deltatime / gctx.canvas.width;
        this.relY += this.vy * deltatime / gctx.canvas.height;
        this.life = Math.min(Math.max(this.life - this.decay * deltatime, 0), 1);
    }

    draw(gctx) {
        this.x = gctx.canvas.width * this.relX;
        this.y = gctx.canvas.height * this.relY;
        this.currSize = this.size * this.life;
        gctx.save();
        if (!this.mode) { // Add glowing effect for implosion particles
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