export class Bullet {
    constructor(relX, relY, relSpeed, relWidth, color, imageSrc, rotation = 0) {
        this.relX = relX;
        this.relY = relY;
        this.relSpeed = relSpeed;
        this.color = color;
        this.active = true;
        this.image = new Image();
        this.image.src = imageSrc;
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;
        this.rotation = rotation;
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
        return this.relY + (this.relHeight / 2) < 0;
    }
}