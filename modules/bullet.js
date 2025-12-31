export class Bullet {
    constructor(relX, relY, speed, width, height, color) {
        this.relX = relX;
        this.relY = relY;
        this.speed = speed;
        this.width = width;
        this.height = height;
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
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.width, this.height);

        const mS = this.width / 2;
        this.x = gctx.canvas.width * this.relX - mS / 2;
        this.y = gctx.canvas.height * this.relY - mS / 2;
        gctx.fillStyle = "blue";
        gctx.fillRect(this.x, this.y, mS, mS);
    }

    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - this.width / 2,
            y: gctx.canvas.height * this.relY - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen() {
        return this.relY < 0;
    }
}