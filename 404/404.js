window.onload = function () {
  const cnv = document.createElement("canvas");
  document.querySelector(".container").appendChild(cnv);

  const cnvWidth = 960;
  const cnvHeight = 480;

  cnv.width = 960;
  cnv.height = 480;

  ctx = cnv.getContext("2d");
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  const cursorPosition = {
    x: 0,
    y: 0,
  };
  let movementVector = { x: 0, y: 0 };

  const c1 = new Circle(ctx, 500, 200);
  console.log(c1);

  const circle = {
    x: 500,
    y: 200,
    origin: {
      x: 500,
      y: 200,
    },
    r: 15,
    speed: {
      x: 0,
      y: 0,
    },
    isMoving: false,
    draw() {
      drawCircle(this.x, this.y, this.r, this.isMoving ? "green" : "blue");
    },
    touching(cursor) {
      if (
        Math.max(Math.abs(cursor.x - this.x), Math.abs(cursor.y - this.y)) >
        this.r + 25
      ) {
        return false;
      }
      return Vertaxis.distance2(this, cursor) <= 1600;
    },
  };

  cnv.addEventListener("mousemove", (e) => {
    cursorPosition.x = e.offsetX;
    cursorPosition.y = e.offsetY;

    movementVector = {
      x: e.movementX,
      y: e.movementY,
    };

    if (circle.touching(cursorPosition)) {
      circle.isMoving = true;
      const impactSpeed = getImpactSpeed(
        cursorPosition,
        circle,
        movementVector
      );
      circle.speed.x = impactSpeed.x;
      circle.speed.y = impactSpeed.y;
    }
  });

  const applyAcceleration = function (speed, acc) {
    return {
      x: applyAxisAcceleration(speed.x, acc.x),
      y: applyAxisAcceleration(speed.y, acc.y),
    };
  };

  const applyAxisAcceleration = function (speed, acceleration) {
    return Math.max(Math.abs(speed) + acceleration, 0) * Vertaxis.sign(speed);
  };

  document.querySelector(".data-offset").addEventListener("click", () => {
    tick();
  });

  const tick = function () {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    const distance = Vertaxis.distance(circle, circle.origin);
    if (circle.isMoving) {
      const originDirection = getDirection(circle, circle.origin);

      let directionModifier = 1;
      let gravityMagnitude = 0.5;

      const gravityForce = {
        x: Math.cos(originDirection) * gravityMagnitude * directionModifier,
        y: Math.sin(originDirection) * gravityMagnitude * directionModifier,
      };

      const friction = 0;
      circle.speed.x +=
        Math.abs(gravityForce.x) *
        (1 - friction) *
        Vertaxis.sign(gravityForce.x);
      circle.speed.y +=
        Math.abs(gravityForce.y) *
        (1 - friction) *
        Vertaxis.sign(gravityForce.y);

      circle.speed.x =
        (Math.abs(circle.speed.x) - 0.1) * Vertaxis.sign(circle.speed.x);
      circle.speed.y =
        (Math.abs(circle.speed.y) - 0.1) * Vertaxis.sign(circle.speed.y);

      circle.x += circle.speed.x;
      circle.y += circle.speed.y;

      const xPosReached =
        Math.abs(circle.x - circle.origin.x) < 1 &&
        Math.abs(circle.speed.x) < 1;

      const yPosReached =
        Math.abs(circle.y - circle.origin.y) < 1 &&
        Math.abs(circle.speed.y) < 1;

      if (xPosReached) {
        circle.x = circle.origin.x;
        console.log("X position reached");
      }
      if (yPosReached) {
        circle.y = circle.origin.y;
        console.log("Y position reached");
      }

      if (xPosReached && yPosReached) {
        circle.isMoving = false;
      }
    }

    circle.draw();
    drawCircle(cursorPosition.x, cursorPosition.y, 25);

    requestAnimationFrame(tick, cnv);
  };
  requestAnimationFrame(tick, cnv);

  function drawCircle(x, y, r, c) {
    ctx.save();
    ctx.fillStyle = c || "#999";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.restore();
  }

  function getDirection(point, origin) {
    const vector = {
      x: origin.x - point.x,
      y: origin.y - point.y,
    };
    const direction = angle(vector);

    return direction;
  }

  function angle(vector) {
    return Math.atan2(vector.y, vector.x);
  }

  function getImpactSpeed(impactPos, circle, movement) {
    return {
      x: movement.x,
      y: movement.y,
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
};
