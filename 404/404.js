window.onload = function () {
  const cnv = document.createElement("canvas");
  document.querySelector(".container").appendChild(cnv);
  const cnvWidth = 960;
  const cnvHeight = 480;
  cnv.width = 960;
  cnv.height = 480;
  ctx = cnv.getContext("2d");
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  const cursorPosition = { x: 0, y: 0, r: 50 };
  const movementVector = { x: 0, y: 0 };
  let cursorVisible = false;

  // 14 by 5 grid each 40 pixels and 20px offset from side
  const dataOffset = {
    x: 150,
    y: 120,
  };
  const data = [
    [1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  ];

  const circles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      if (row[j] === 1) {
        circles.push(
          new Circle(ctx, dataOffset.x + j * 50, dataOffset.y + i * 50)
        );
      }
    }
  }

  cnv.addEventListener("mousemove", (e) => {
    cursorPosition.x = e.offsetX;
    cursorPosition.y = e.offsetY;

    movementVector.x = e.movementX;
    movementVector.y = e.movementY;

    // update();
  });

  cnv.addEventListener("mouseleave", (e) => {
    cursorVisible = false;
  });

  cnv.addEventListener("mouseenter", (e) => {
    cursorVisible = true;
  });

  const update = function () {
    circles.forEach((circleEl) => {
      cursorImpactCheck(circleEl);
    });
  };

  const cursorImpactCheck = function (circleEl) {
    if (circleEl.touching(cursorPosition)) {
      circleEl.isMoving = true;
      const impactSpeed = getImpactSpeed(
        cursorPosition,
        circleEl,
        movementVector
      );

      circleEl.speed.x = impactSpeed.x;
      circleEl.speed.y = impactSpeed.y;
    }
  };

  const tick = function () {
    for (let index = 0; index < circles.length; index++) {
      const circle = circles[index];

      cursorImpactCheck(circle);

      if (circle.isMoving) {
        const originDirection = getDirection(circle, circle.origin);

        let gravityMagnitude = 0.5;

        const gravityForce = {
          x: Math.cos(originDirection) * gravityMagnitude,
          y: Math.sin(originDirection) * gravityMagnitude,
        };

        circle.speed.x +=
          Math.abs(gravityForce.x) * Vertaxis.sign(gravityForce.x);
        circle.speed.y +=
          Math.abs(gravityForce.y) * Vertaxis.sign(gravityForce.y);

        circle.speed.x =
          (Math.abs(circle.speed.x) - 0.15) * Vertaxis.sign(circle.speed.x);
        circle.speed.y =
          (Math.abs(circle.speed.y) - 0.15) * Vertaxis.sign(circle.speed.y);

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
        }
        if (yPosReached) {
          circle.y = circle.origin.y;
        }

        if (xPosReached && yPosReached) {
          circle.isMoving = false;
        }
      }
    }

    draw();

    requestAnimationFrame(tick, cnv);
  };
  requestAnimationFrame(tick, cnv);

  const draw = function () {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    circles.forEach((circle) => circle.draw());
    if (cursorVisible) {
      drawCircle(cursorPosition.x, cursorPosition.y, cursorPosition.r);
    }
  };

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
};
