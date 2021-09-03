class Circle {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.origin = { x, y };
    (this.r = 15), (this.isMoving = false);
    this.speed = {
      x: 0,
      y: 0,
    };
  }

  update() {}

  draw() {
    const color = this.isMoving ? "green" : "blue";
    ctx.save();
    ctx.fillStyle = color || "#999";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.restore();
  }

  touching(cursor) {
    if (
      Math.max(Math.abs(cursor.x - this.x), Math.abs(cursor.y - this.y)) >
      this.r + cursor.r
    ) {
      return false;
    }
    return (
      Vertaxis.distance2(this, cursor) <=
      (this.r + cursor.r) * (this.r + cursor.r)
    );
  }
}
