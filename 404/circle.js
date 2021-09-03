class Circle {
  constructor(ctx, size, x, y, color) {
    this.ctx = ctx;
    this.color = color;
    this.x = x;
    this.y = y;
    this.origin = { x, y };
    this.r = size / 2;
    this.isMoving = false;
    this.speed = {
      x: 0,
      y: 0,
    };
    this.angle = 0;
    this.angleSpeed = 0;
    this.quadrant = 0;
  }

  setMoving(value) {
    this.isMoving = value;
    if (this.isMoving) {
      this.angleSpeed = getRandomInt(10, 50) / 10;
    } else {
      this.angleSpeed = 0;
      this.angle = 0;
    }
  }

  update() {
    this.angle += this.angleSpeed;
    if (this.angle >= 360) {
      this.angle = this.angle - 360;
    }

    const originDirection = this.getDirection();
    let gravityMagnitude = 0.5;

    const gravityForce = {
      x: Math.cos(originDirection) * gravityMagnitude,
      y: Math.sin(originDirection) * gravityMagnitude,
    };

    this.speed.x += Math.abs(gravityForce.x) * Vertaxis.sign(gravityForce.x);
    this.speed.y += Math.abs(gravityForce.y) * Vertaxis.sign(gravityForce.y);

    this.speed.x =
      (Math.abs(this.speed.x) - 0.15) * Vertaxis.sign(this.speed.x);
    this.speed.y =
      (Math.abs(this.speed.y) - 0.15) * Vertaxis.sign(this.speed.y);

    this.x += this.speed.x;
    this.y += this.speed.y;

    // Check boundaries
    const cnv = this.ctx.canvas;
    if (this.x > cnv.width - this.r) {
      this.x = cnv.width - this.r;
      this.speed.x = -this.speed.x * 0.9;
    }
    if (this.x < this.r) {
      this.x = this.r;
      this.speed.x = -this.speed.x * 0.9;
    }
    if (this.y > cnv.height - this.r) {
      this.y = cnv.height - this.r;
      this.speed.y = -this.speed.y * 0.9;
    }
    if (this.y < this.r) {
      this.y = this.r;
      this.speed.y = -this.speed.y * 0.9;
    }

    // Calculate quadrant
    // let quadrant;
    // const xDiff = this.x - this.origin.x > 1;
    // const yDiff = this.y - this.origin.y > 1;
    // if (xDiff) {
    //   quadrant = yDiff ? 1 : 2;
    // } else {
    //   quadrant = yDiff ? 3 : 4;
    // }
    // if (quadrant !== this.quadrant) {
    //   if (this.speed.x + this.speed.y > 3) {
    //     this.quadrant = quadrant;
    //     console.log("New Quadrant");
    //   }
    // }

    const xPosReached =
      Math.abs(this.x - this.origin.x) < 1 && Math.abs(this.speed.x) < 1;

    const yPosReached =
      Math.abs(this.y - this.origin.y) < 1 && Math.abs(this.speed.y) < 1;

    if (xPosReached) {
      this.x = this.origin.x;
    }
    if (yPosReached) {
      this.y = this.origin.y;
    }

    if (xPosReached && yPosReached) {
      this.setMoving(false);
    }
  }

  draw() {
    this.ctx.save();

    const colors = [
      "#000",
      "#f04156",
      "#c5754a",
      "#d3c0a8",
      "#2d1b2e",
      "#3cc2fa",
      "#f7db53",
    ];

    this.ctx.fillStyle = colors[this.color];

    this.ctx.strokeStyle = "#2d1b2e";

    const halfSize = this.r;
    let yValue = this.y;

    // translate (including the desired centerX & center)
    this.ctx.translate(this.x + halfSize, yValue + halfSize);
    const angle = 45;
    // rotate
    this.ctx.rotate((this.angle * Math.PI) / 180);

    // fill the rect offset by half its size
    this.ctx.fillRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
    this.ctx.strokeRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);

    // unrotate
    this.ctx.rotate((-this.angle * Math.PI) / 180);

    // untranslate
    this.ctx.translate(-this.x - halfSize, -yValue - halfSize);

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
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

  getDirection() {
    const vector = {
      x: this.origin.x - this.x,
      y: this.origin.y - this.y,
    };
    const direction = Math.atan2(vector.y, vector.x);
    return direction;
  }

  getSqrDistanceToOrigin() {
    const vector = {
      x: this.origin.x - this.x,
      y: this.origin.y - this.y,
    };
    return vector.x * vector.x + vector.y * vector.y;
  }

  getMagnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  getImpactSpeed(impactPos, circle, movement) {
    return {
      x: Math.min(Math.abs(movement.x), 15) * Vertaxis.sign(movement.x),
      y: Math.min(Math.abs(movement.y), 15) * Vertaxis.sign(movement.y),
    };

    // const massVector = {
    //   x: circle.x - impactPos.x,
    //   y: circle.y - impactPos.y,
    // };
    // console.log(movement);
    // console.log(angle(movement));

    // console.log(massVector);
    // console.log(angle(massVector));

    // const result = {
    //   x: massVector.x + movement.x,
    //   y: massVector.y + movement.y,
    // };
    // console.log(result);
    // console.log(angle(result));
    return movement;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
