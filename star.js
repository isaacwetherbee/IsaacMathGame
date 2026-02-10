class Star {
    constructor(panelWidth, panelHeight) {
        this.x = Math.floor(Math.random() * panelWidth);
        this.y = Math.floor(Math.random() * panelHeight);
        this.size = Math.floor(Math.random() * 3) + 1;   // 1–3 pixels
        this.speed = Math.floor(Math.random() * 2) + 1;  // 1–2 pixels per frame
    }

    update(panelWidth, panelHeight) {
        this.y += this.speed;

        if (this.y > panelHeight) {
            this.y = 0;
            this.x = Math.floor(Math.random() * panelWidth);
        }
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
