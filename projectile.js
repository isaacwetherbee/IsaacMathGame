class projectile {
  constructor(startX, startY, dirX, dirY, digit) {
    this.position = { x: startX, y: startY };
    this.digit = digit;

    this.speed = 10;

    // Normalize direction vector
    const length = Math.hypot(dirX, dirY) || 1;
    this.dx = (dirX / length) * this.speed;
    this.dy = (dirY / length) * this.speed;
 
    this.font = "bold 18px Arial";
  }

  // ======================
  // Update
  // ======================
  update() {
    this.position.x += this.dx;
    this.position.y += this.dy;
  }

  getDigit() {
    return this.digit;
  }

  // ======================
  // Collision bounds
  // ======================
  getBounds() {
    const size = 16;
    return {
      x: this.position.x - size / 2,
      y: this.position.y - size / 2,
      w: size,
      h: size
    };
  }

  // ======================
  // Draw
  // ======================
  draw(ctx) {
    ctx.font = this.font;
    ctx.fillStyle = "red";

    const text = String(this.digit);
    const metrics = ctx.measureText(text);

    const textWidth = metrics.width;
    const textHeight = 12; // approx ascent for 18px font

    ctx.fillText(
      text,
      this.position.x - textWidth / 2,
      this.position.y + textHeight / 2
    );
  }

  // ======================
  // Off screen check
  // ======================
  isOffScreen(width, height) {
    return (
      this.position.x < -20 ||
      this.position.x > width + 20 ||
      this.position.y < -20 ||
      this.position.y > height + 20
    );
  }
}

