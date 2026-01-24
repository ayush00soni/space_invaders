export const BULLET_DIRECTION = {
    UP: 1,
    DOWN: -1
};

/**
 * Represents a projectile fired by either the player or an enemy.
 * Handles trajectory updates and boundary checks.
 */
export class Bullet {
    /**
     * @param {number} relX - Relative X position (0.0 to 1.0)
     * @param {number} relY - Relative Y position (0.0 to 1.0)
     * @param {number} relSpeed - Vertical movement speed
     * @param {number} relWidth - Width relative to canvas width
     * @param {string} color - Fallback color for the bullet
     * @param {string} imageSrc - Path to the bullet image asset
     * @param {number} [dir=1] - Direction multiplier (1 for Up, -1 for Down)
     */
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
        // resize bullet to its image aspect ratio
        this.aspectRatio = this.image.naturalHeight / this.image.naturalWidth;
        this.width = gctx.canvas.width * this.relWidth;
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

    /**
     * Returns the bounding box of the bullet for collision detection.
     * @param {CanvasRenderingContext2D} gctx
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - gctx.canvas.width * this.relWidth / 2,
            y: gctx.canvas.height * this.relY - gctx.canvas.height * this.relHeight / 2,
            width: gctx.canvas.width * this.relWidth,
            height: gctx.canvas.height * this.relHeight
        };
    }

    /**
     * Checks if the bullet has flown off the top or bottom of the screen.
     * Used to clean up the bullet array.
     * @returns {boolean} True if off-screen
     */
    isOffScreen() {
        return this.relY + (this.relHeight / 2) < 0 || this.relY - (this.relHeight / 2) > 1;
    }
}