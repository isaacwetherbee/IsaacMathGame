class player {
  constructor(x = 0, y = 0) {
        this.position = {
            x: x,
            y: y
        };

        this.size = 20; // size of the triangle
    }

    move(dx, dy) {
        this.position.x += dx;
        this.position.y += dy;
    }

    getX() {
        return this.position.x;
    }

    getY() {
        return this.position.y;
    }

    getSize() {
        return this.size;
    }

    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }

    setX(x) {
        this.position.x = x;
    }

    setY(y) {
        this.position.y = y;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const half = this.size / 2;

        // Draw triangle pointing up
        ctx.beginPath();
        ctx.moveTo(x, y - half);        // top point
        ctx.lineTo(x - half, y + half); // bottom left
        ctx.lineTo(x + half, y + half); // bottom right
        ctx.closePath();

        ctx.fillStyle = 'blue';
        ctx.fill();
    }

  
    getBounds() {
        return {
            x: this.position.x - 10,
            y: this.position.y - 10,
            width: 20,
            height: 20
        };
    }

    
}

  


 
