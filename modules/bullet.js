export class Bullet {
    constructor(relX, relY, relSpeed, relWidth, relHeight, color) {
        this.relX = relX;
        this.relY = relY;
        this.relSpeed = relSpeed;
        this.relWidth = relWidth;
        this.relHeight = relHeight;
        this.color = color;
        this.active = true;
    }

    /**
     * @param {number} deltatime
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime) {
        this.relY -= this.relSpeed * deltatime;
    }

    /**
    * @param {CanvasRenderingContext2D} gctx
    */
    draw(gctx) {
        this.width = gctx.canvas.width * this.relWidth;
        this.height = gctx.canvas.height * this.relHeight;
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
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