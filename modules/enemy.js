export class Enemy {
    constructor(id, relX, relY, speed, relWidth, relHeight, color, spacing, dir, column) {
        this.id = id;
        this.relX = relX;
        this.relY = relY;
        this.speed = speed;
        this.relWidth = relWidth;
        this.relHeight = relHeight;
        this.color = color;
        this.spacing = spacing;
        this.dir = dir;
        this.column = column;
        this.active = true;
    }

    update(deltatime, gctx) {
        this.relX = this.relX + (this.dir * this.speed * deltatime / gctx.canvas.width);
    }

    shiftDown() {
        this.relY += this.relHeight + this.spacing;
        this.dir *= -1;
    }

    isOnEdge(deltatime, gctx) {
        // Minimum distance from edge is made to be same as space between two enemies
        const edgeSpace = this.spacing + this.relWidth / 2;
        return (this.relX + this.dir * this.speed * deltatime / gctx.canvas.width < edgeSpace || this.relX + this.dir * this.speed * deltatime / gctx.canvas.width > 1 - edgeSpace);
    }

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
            x: gctx.canvas.width * this.relX - this.relWidth * gctx.canvas.width / 2,
            y: gctx.canvas.height * this.relY - this.relHeight * gctx.canvas.height / 2,
            width: this.relWidth * gctx.canvas.width,
            height: this.relHeight * gctx.canvas.height
        };
    }

}