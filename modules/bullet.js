export class Bullet {
    constructor(relX, relY, speed, relWidth, relHeight, color) {
        this.relX = relX;
        this.relY = relY;
        this.speed = speed;
        this.relWidth = relWidth;
        this.relHeight = relHeight;
        this.color = color;
        this.active = true;
    }

    /**
     * @param {number} deltatime
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime, gctx) {
        this.relY -= this.speed * deltatime / gctx.canvas.height;
    }

    /**
    * @param {CanvasRenderingContext2D} gctx
    */
    draw(gctx) {
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        this.width = gctx.canvas.width * this.relWidth;
        this.height = gctx.canvas.height * this.relHeight;
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.width, this.height);
    }

    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - this.width / 2,
            y: gctx.canvas.height * this.relY - this.height / 2,
            width: gctx.canvas.width * this.relWidth,
            height: gctx.canvas.height * this.relHeight
        };
    }

    isOffScreen() {
        return this.relY + (this.relHeight/2) < 0;
    }
}