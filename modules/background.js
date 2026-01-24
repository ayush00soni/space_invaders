export class StarField {
    constructor(density) {
        this.stars = [];
        this.density = density; // star per pixel
        this.lastwidth = 0;
        this.lastheight = 0;

        this.minRadius = 0.5;
        this.minOpacity = 0.5;
    }

    resize(width, height) {
        // Cropping: Delete stars that are out of bounds
        this.stars = this.stars.filter(star => star.x <= width && star.y <= height);

        // Filling: Add new stars if needed
        if (width > this.lastwidth) {
            // New stars on the right side
            this.spawnStars(this.lastwidth, 0, width - this.lastwidth, height);
        }
        if (height > this.lastheight) {
            // New stars on the bottom side
            this.spawnStars(0, this.lastheight, Math.min(width, this.lastwidth), height - this.lastheight);
        }

        this.lastwidth = width;
        this.lastheight = height;
    }

    spawnStars(offsetX, offsetY, width, height) {
        const area = width * height;
        const totalStars = Math.floor(this.density * area);

        for (let i = 0; i < totalStars; i++) {
            this.stars.push({
                x: offsetX + Math.random() * width,
                y: offsetY + Math.random() * height,
                radius: Math.random() + this.minRadius,
                opacity: (Math.random() + 1) * this.minOpacity
            });
        }
    }

    draw(gctx) {
        gctx.fillStyle = "white";
        this.stars.forEach(star => {
            gctx.globalAlpha = star.opacity;
            gctx.beginPath();
            gctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            gctx.fill();
        });
        gctx.globalAlpha = 1.0; // Reset alpha
    }
}