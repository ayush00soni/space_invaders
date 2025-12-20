export class Enemy {
    constructor(relX, relY, speed, width, height, color) {
        this.relX = relX;
        this.relY = relY;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    update(deltatime, gctx) { }

    draw(gctx) {
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.width, this.height);
    }
}