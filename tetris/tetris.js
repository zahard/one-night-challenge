const init = function () {
  var audio = new Audio("media/arcade-kid.mp3");
  audio.volume = 0.4;

  var audioClick = new Audio("media/click.wav");
  audioClick.volume = 0.5;

  var audioExplosion = new Audio("media/explosion.wav");
  audioExplosion.volume = 0.4;

  const cnv = document.querySelector("#main");
  ctx = cnv.getContext("2d");
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  const tileColors = ["", "#f272ce", "#4a247c", "#3cc2fa", "#f2a759"];

  const figureShapes = [
    (X) => [
      [X, X, X],
      [0, X, 0],
    ],
    (X) => [
      [X, X, X],
      [0, 0, X],
    ],
    (X) => [
      [X, X, 0],
      [0, X, X],
    ],
    (X) => [
      [X, X],
      [X, X],
    ],
    (X) => [
      [0, X, X],
      [X, X, 0],
    ],
    (X) => [
      [X, X, X],
      [X, 0, 0],
    ],
    (X) => [[X, X, X, X]],
  ];

  let lastFigure = -1;
  const generateFigure = function () {
    let figureIndex = getRandomInt(0, figureShapes.length - 1);
    if (figureIndex === lastFigure) {
      figureIndex = getRandomInt(0, figureShapes.length - 2);
    }
    lastFigure = figureIndex;
    const figureColor = getRandomInt(1, tileColors.length - 1);
    const shape = figureShapes[figureIndex](figureColor);
    return {
      shape,
      position: {
        y: 0,
        x: shape[0].length === 4 ? 3 : 4,
      },
    };
  };

  let gameOverFlag;
  let generateNewFigureNextStep = false;
  let animationInProgress = false;
  let paused = false;
  const height = 20;
  const width = 10;

  const pixel = 4;
  const tileSize = 8;
  const tilePixels = tileSize * pixel;

  cnv.width = (tilePixels + pixel) * width + pixel;
  cnv.height = (tilePixels + pixel) * height + pixel;

  let playground = [[]];

  document.addEventListener("keydown", (e) => {
    let keyFound = true;
    switch (e.key) {
      case "m":
        if (audio.paused || audio.currentTime === 0) {
          audio.play();
        } else {
          audio.pause();
        }
        break;
      case "Escape":
        togglePause();
        break;
      case "Enter":
        move("drop");
        break;
      case "ArrowLeft":
        move("left");
        break;
      case "ArrowRight":
        move("right");
        break;
      case "ArrowDown":
        move("down");
        break;
      case " ": //Spacebar
        rotateFigure();
        break;
      default:
        keyFound = false;
        break;
    }
    if (keyFound) {
      audioClick.currentTime = 0;
      audioClick.play();
    }
  });

  const restart = function () {
    gameOverFlag = false;
    paused = false;
    animationInProgress = false;
    figure = generateFigure();

    playground = new Array(height)
      .fill("")
      .map(() => new Array(width).fill(null));

    redraw();
    requestAnimationFrame(tick, cnv);
  };

  const togglePause = function () {
    if (gameOverFlag) {
      return;
    }
    if (paused) {
      paused = false;
      redraw();
      prevTime = Date.now();
      tick();
    } else {
      paused = true;
      redraw();
    }
  };

  const move = function (direction) {
    if (paused) {
      return;
    }
    let update = false;
    switch (direction) {
      case "left":
        if (canMove("left")) {
          figure.position.x--;
          update = true;
        }
        break;
      case "right":
        if (canMove("right")) {
          figure.position.x++;
          update = true;
        }
        break;
      case "down":
        if (canMove("down")) {
          figure.position.y++;
          update = true;
        }

        break;
      case "drop":
        figure.position.y = findLanding();
        redraw();

        mergeFigure();

        break;
    }
    if (update) {
      redraw();
    }
  };

  const mergeFigure = function () {
    const shape = figure.shape;
    const pos = figure.position;
    const fWidth = shape[0].length;
    // Start from bottom of shape to optimize process
    for (let y = shape.length - 1; y >= 0; y--) {
      for (let x = 0; x < fWidth; x++) {
        if (shape[y][x]) {
          playground[pos.y + y][pos.x + x] = shape[y][x];
        }
      }
    }

    generateNewFigureNextStep = true;

    const lineFilled = findFilledLine();
    if (lineFilled > -1) {
      explodeLine(lineFilled);
    }
  };

  const findFilledLine = function () {
    for (let y = 0; y < height; y++) {
      let lineFilled = true;
      for (let x = 0; x < width; x++) {
        // If its a gap in that line skip to next line
        if (!playground[y][x]) {
          lineFilled = false;
          break;
        }
      }
      if (lineFilled) {
        return y;
      }
    }
    return -1;
  };

  const explodeLine = function (line) {
    audioExplosion.currentTime = 0;
    audioExplosion.play();
    animationInProgress = true;

    let x = 4;
    let level = 0;

    const explodeTile = () => {
      drawExplodingTile(line, x, level);
      drawExplodingTile(line, width - x - 1, level);
      level++;
      if (level > 4) {
        level = 0;
        x--;
      }
      if (x >= 0) {
        requestAnimationFrame(explodeTile, cnv);
      } else {
        fillLine(line);
      }
    };
    explodeTile();
  };

  const fillLine = function (line) {
    for (let x = 0; x < width; x++) {
      const emptyCellY = line;
      for (let y = line - 1; y >= 0; y--) {
        playground[y + 1][x] = playground[y][x];
      }
    }

    const lineFilled = findFilledLine();
    if (lineFilled > -1) {
      explodeLine(lineFilled);
    } else {
      // Animation is finished
      animationInProgress = false;
      requestAnimationFrame(tick, cnv);
    }
  };

  const findLanding = function () {
    const fHeight = figure.shape.length;
    while (figure.position.y + fHeight < height) {
      if (canMove("down")) {
        figure.position.y++;
      } else {
        break;
      }
    }
    return figure.position.y;
  };

  const canMove = function (dir) {
    const directions = {
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };

    return !detectCollision({
      x: figure.position.x + directions[dir][0],
      y: figure.position.y + directions[dir][1],
    });
  };

  const detectCollision = function (position) {
    const shape = figure.shape;
    const fWidth = shape[0].length;

    //Check if shape inside boundaries
    if (
      position.x < 0 ||
      position.x + fWidth > width ||
      position.y + shape.length > height
    ) {
      return true;
    }

    // Start from bottom of shape to optimize process
    for (let y = shape.length - 1; y >= 0; y--) {
      for (let x = 0; x < fWidth; x++) {
        if (shape[y][x] && playground[position.y + y][position.x + x]) {
          return true;
        }
      }
    }

    return false;
  };

  const stepTime = 500;
  let prevTime = 0;

  const tick = function (T) {
    if (animationInProgress) {
      return;
    }
    if (paused) {
      return;
    }
    const now = Date.now();
    const dt = now - prevTime;
    if (dt >= stepTime) {
      prevTime = now;

      if (generateNewFigureNextStep) {
        generateNewFigureNextStep = false;
        figure = generateFigure();
        redraw();
        if (detectCollision(figure.position)) {
          gameOver();
          return;
        }
      } else {
        if (canMove("down")) {
          figure.position.y++;
        } else {
          mergeFigure();
        }
        redraw();
      }
    }

    requestAnimationFrame(tick, cnv);
  };

  const redraw = function () {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    drawPlayground();
    drawFigure();
    if (paused) {
      ctx.fillStyle = "fff";
      ctx.font = "bold 48px Arial";
      ctx.fillText("PAUSE", 100, 300);
    }
  };

  const gameOver = function () {
    paused = true;
    gameOverFlag = true;
    ctx.fillStyle = "f7db53";
    ctx.font = "bold 48px Arial";
    ctx.fillText("GAME OVER", 30, 300);
  };

  const rotateFigure = function () {
    if (paused) {
      return;
    }
    let shape = figure.shape;
    figure.shape = shape[0].map((val, index) =>
      shape.map((row) => row[index]).reverse()
    );
    const fWidth = figure.shape[0].length;
    // if shape is going off screen after rotation - fix it
    if (figure.position.x + fWidth >= width) {
      figure.position.x -= figure.position.x + fWidth - width;
    }

    redraw();
  };

  const drawFigure = function () {
    figure.shape.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        if (!color) return;
        drawTile(
          color,
          rowIndex + figure.position.y,
          colIndex + figure.position.x
        );
      });
    });
  };

  const drawPlayground = function () {
    playground.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        drawTile(color, rowIndex, colIndex);
      });
    });
  };

  const drawTile = function (color, y, x) {
    const xOffset = x * (tilePixels + pixel) + pixel;
    const yOffset = y * (tilePixels + pixel) + pixel;

    if (color) {
      // Fill tile
      ctx.fillStyle = tileColors[color];
      ctx.fillRect(xOffset, yOffset, tilePixels, tilePixels);
      // Add highlights

      ctx.fillStyle = "#fff";
      putPixel({ x: xOffset, y: yOffset }, 0, 0);
      putPixel({ x: xOffset, y: yOffset }, 1, 1);
      putPixel({ x: xOffset, y: yOffset }, 2, 1);
      putPixel({ x: xOffset, y: yOffset }, 1, 2);
    } else {
      ctx.clearRect(xOffset, yOffset, tilePixels, tilePixels);
    }
  };

  const drawExplodingTile = function (y, x, level) {
    const xOffset = x * (tilePixels + pixel) + pixel;
    const yOffset = y * (tilePixels + pixel) + pixel;
    ctx.clearRect(xOffset - 1, yOffset - 1, tilePixels + 2, tilePixels + 2);

    if (level > 3) {
      return;
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(
      xOffset + level * pixel,
      yOffset + level * pixel,
      tilePixels - level * pixel * 2,
      tilePixels - level * pixel * 2
    );
    return;
  };

  const putPixel = function (offset, x, y) {
    ctx.fillRect(offset.x + x * pixel, offset.y + y * pixel, pixel, pixel);
  };

  restart();
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = init;
