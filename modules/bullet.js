export const BULLET_DIRECTION = {
    UP: 1,
    DOWN: -1
};

export class Bullet {
    constructor(relX, relY, relSpeed, relWidth, color, imageSrc, dir = 1) {
        this.relX = relX;
        this.relY = relY;
        this.relSpeed = relSpeed;
        this.color = color;
        this.active = true;
        this.image = new Image();
        this.image.src = imageSrc;
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;
        this.dir = dir; // 1 for player bullet (up), -1 for enemy bullet (down)
    }

    /**
     * @param {number} deltatime
     * @param {CanvasRenderingContext2D} gctx
     */
    update(deltatime) {
        this.relY -= this.dir * this.relSpeed * deltatime;
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
            gctx.save();
            gctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            gctx.rotate(this.dir === 1 ? 0 : Math.PI);
            gctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            gctx.restore();
        } else {
            gctx.fillStyle = this.color;
            gctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - gctx.canvas.width * this.relWidth / 2,
            y: gctx.canvas.height * this.relY - gctx.canvas.height * this.relHeight / 2,
            width: gctx.canvas.width * this.relWidth,
            height: gctx.canvas.height * this.relHeight
        };
    }

    isOffScreen() {
        return this.relY + (this.relHeight / 2) < 0 || this.relY - (this.relHeight / 2) > 1;
    }
}