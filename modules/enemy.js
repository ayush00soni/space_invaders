export class Enemy {
    constructor(id, relX, relY, speed, width, height, color, spacing, dir, column) {
        this.id = id;
        this.relX = relX;
        this.relY = relY;
        this.relYi = relY; // Initial y position (relative)
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.color = color;
        this.spacing = spacing;
        this.dir = dir;
        this.column = column;
        this.active = true;
    }

    update(deltatime, gctx) {
        this.relX = this.relX + (this.dir * this.speed * deltatime / gctx.canvas.width);
    }

    shiftDown(gctx) {
        this.relY += this.height / gctx.canvas.height + this.spacing;
        this.dir *= -1;
    }

    isOnEdge(deltatime, gctx) {
        // Minimum distance from edge is made to be same as space between two enemies
        const edgeSpace = this.spacing + this.width / gctx.canvas.width / 2;
        return (this.relX + this.dir * this.speed * deltatime / gctx.canvas.width < edgeSpace || this.relX + this.dir * this.speed * deltatime / gctx.canvas.width > 1 - edgeSpace);
    }

    draw(gctx) {
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.width, this.height);

        const mS = 5;
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

}