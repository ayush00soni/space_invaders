export class Particle {
    constructor(relX, relY, color, decay, speed) {
        this.relX = relX;
        this.relY = relY;
        this.color = color;
        this.decay = decay;
        this.life = 1.0;
        this.speed = speed;
        this.maxSize = 3;
        this.size = this.maxSize * Math.random();
        this.angle = Math.random() * 2 * Math.PI;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
    }

    update(deltatime, gctx) {
        this.relX += this.vx * deltatime * 0.1 / gctx.canvas.width;
        this.relY += this.vy * deltatime * 0.1 / gctx.canvas.height;
        this.life = Math.max(this.life - this.decay * deltatime, 0);
    }

    draw(gctx) {
        gctx.save();
        this.x = gctx.canvas.width * this.relX;
        this.y = gctx.canvas.height * this.relY;
        this.currSize = this.size * this.life;
        gctx.globalAlpha = this.life;
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.currSize, this.currSize);
        gctx.restore();
    }
}