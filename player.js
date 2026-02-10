class Player {
  constructor(x = 0, y = 0) {
    this.position = { x, y };
    this.size = 20; // triangle size
  }

  // ======================
  // Movement
  // ======================
  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  // ======================
  // Getters
  // ======================
  getX() {
    return this.position.x;
  }

  getY() {
    return this.position.y;
  }

  getSize() {
    return this.size;
  }

  getBounds() {
    return {
      x: this.position.x - 10,
      y: this.position.y - 10,
      w: 20,
      h: 20
    };
  }

  // ======================
  // Draw
  // ======================
  draw(ctx) {
    const x = this.position.x;
    const y = this.position.y;
    const half = this.size / 2;

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(x, y - half);
    ctx.lineTo(x - half, y + half);
    ctx.lineTo(x + half, y + half);
    ctx.closePath();
    ctx.fill();
  }
}

