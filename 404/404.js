window.onload = function () {
  const cnv = document.createElement("canvas");
  document.querySelector(".container").appendChild(cnv);
  const cnvWidth = 960;
  const cnvHeight = 480;
  cnv.width = 960;
  cnv.height = 800;
  ctx = cnv.getContext("2d");
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  const cursorPosition = { x: 0, y: 0, r: 60 };
  const movementVector = { x: 0, y: 0 };
  let cursorVisible = false;

  // 14 by 5 grid each 40 pixels and 20px offset from side
  const dataOffset = {
    x: 180,
    y: 40,
  };
  const tileSize = 40;
  const tileGap = 4;

  // 404
  let data = [
    [1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  ];

  // Mario
  data = [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 2, 2, 2, 3, 3, 3, 4, 3, 0, 0, 0],
    [0, 2, 3, 2, 3, 3, 3, 3, 4, 3, 3, 3, 0],
    [0, 2, 3, 2, 2, 3, 3, 3, 3, 4, 3, 3, 3],
    [0, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 0],
    [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0],
    [0, 0, 1, 1, 5, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 0],
    [3, 3, 1, 5, 6, 5, 5, 6, 5, 1, 3, 3, 0],
    [3, 3, 3, 5, 5, 5, 5, 5, 5, 3, 3, 3, 0],
    [3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 0],
    [0, 0, 5, 5, 5, 0, 0, 5, 5, 5, 0, 0, 0],
    [0, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 0],
  ];

  const circles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      if (row[j] > 0) {
        circles.push(
          new Circle(
            ctx,
            tileSize,
            dataOffset.x + j * (tileSize + tileGap),
            dataOffset.y + i * (tileSize + tileGap),
            row[j]
          )
        );
      }
    }
  }

  cnv.addEventListener("mousemove", (e) => {
    cursorPosition.x = e.offsetX;
    cursorPosition.y = e.offsetY;

    movementVector.x = e.movementX;
    movementVector.y = e.movementY;
  });

  cnv.addEventListener("mouseleave", () => {
    cursorVisible = false;
  });

  cnv.addEventListener("mouseenter", () => {
    cursorVisible = true;
  });

  const cursorImpactCheck = function (circleEl) {
    if (circleEl.touching(cursorPosition)) {
      circleEl.setMoving(true);
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
    update();
    draw();
    requestAnimationFrame(tick, cnv);
  };
  requestAnimationFrame(tick, cnv);

  const update = function () {
    for (let index = 0; index < circles.length; index++) {
      const circle = circles[index];
      if (cursorVisible) {
        cursorImpactCheck(circle);
      }
      if (circle.isMoving) {
        circle.update();
      }
    }
  };

  const draw = function () {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    circles.forEach((circle) => circle.draw());
    if (cursorVisible) {
      //drawCircle(cursorPosition.x, cursorPosition.y, cursorPosition.r);
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
