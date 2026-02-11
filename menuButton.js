class menuButton {
    constructor(x, y, width, height, label, enabled = true) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.enabled = enabled;
        this.font = "bold 20px Arial"; // equivalent of Java Font
    }

    draw(ctx) {
        ctx.font = this.font;

        // Color shows state
        if (this.enabled) {
            ctx.fillStyle = "rgb(60, 180, 75)"; // green
        } else {
            ctx.fillStyle = "rgb(200, 60, 60)"; // red
        }

        // Draw filled rectangle
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw border
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Draw text centered
        const textWidth = ctx.measureText(this.label).width;
        const textX = this.x + (this.width - textWidth) / 2;
        // Vertically center text using font metrics approximation
        const textY = this.y + (this.height + 16) / 2; // 16 is approximate ascent for 20px Arial

        ctx.fillStyle = "white";
        ctx.fillText(this.label, textX, textY);
    }

    contains(mx, my) {
        return mx >= this.x &&
               mx <= this.x + this.width &&
               my >= this.y &&
               my <= this.y + this.height;
    }

    toggle() {
        this.enabled = !this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

