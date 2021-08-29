const init = function () {
  const cnv = document.createElement("canvas");
  document.body.appendChild(cnv);
  cnv.style.position = "absolute";
  cnv.style.background = "#0f0f0f";
  cnv.style.left = cnv.style.top = "0px";

  const updateTime = 20;
  const columnFillPercent = 0.5;
  const cellSize = 24;

  let timer;
  let prevTime = 0;
  let tickCounter = 0;
  let ctx;
  let colsCount;
  let rowsCount;
  let heads;
  let speed;
  let matrix = [];
  let opacityStep;

  const generateMatrix = function () {
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;

    ctx = cnv.getContext("2d");
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.font = "bold 20px 'Iceland'";
    ctx.textBaseline = "hanging";

    colsCount = Math.floor(window.innerWidth / cellSize);
    rowsCount = Math.floor(window.innerHeight / cellSize);
    heads = Array(colsCount);
    speed = Array(colsCount)
      .fill("")
      .map(() => getSpeed());

    matrix = [];
    opacityStep = 1 / (rowsCount * columnFillPercent);

    // Generate intial state
    for (let c = 0; c < colsCount; c++) {
      const column = Array(rowsCount);
      matrix.push(column);
      const colHeight = getRandomInt(1, rowsCount - 1);
      heads[c] = colHeight - 1;
      for (let r = 0; r < colHeight; r++) {
        column[r] = getRandomChar();
      }
    }
  };

  generateMatrix();

  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      generateMatrix();
    }, 250);
  });

  const tick = function (T) {
    const dt = T - prevTime;
    if (dt > updateTime) {
      const updatesCount = Math.floor(dt / updateTime);
      const leftover = dt % updateTime;
      prevTime = T - leftover;

      for (let i = 0; i < updatesCount; i++) {
        tickCounter++;
        if (tickCounter > 1000) {
          tickCounter = 0;
        }
        addChars(tickCounter);
      }
      drawMatrix();
    }
    requestAnimationFrame(tick, cnv);
  };

  const drawMatrix = function () {
    ctx.clearRect(0, 0, cnv.width, cnv.height);

    for (let c = 0; c < matrix.length; c++) {
      // Draw head
      const headIdx = heads[c];
      ctx.fillStyle = "AliceBlue";
      ctx.fillText(matrix[c][headIdx], c * cellSize, headIdx * cellSize);

      let opacity = 1;
      for (let r = headIdx - 1; r >= 0; r--) {
        ctx.fillStyle = `rgba(124,252,0,${opacity})`;
        opacity = Math.max(0, opacity - opacityStep);
        const character = matrix[c][r];
        ctx.fillText(matrix[c][r], c * cellSize, r * cellSize);
      }
    }
  };

  const addChars = function () {
    for (let c = 0; c < matrix.length; c++) {
      const colSpeed = speed[c];
      if (colSpeed > 1 && tickCounter % colSpeed !== 0) {
        continue;
      }
      const column = matrix[c];
      let headIdx = heads[c];
      headIdx += 1;
      if (headIdx === rowsCount) {
        headIdx = 0;
        // Generate new speed
        speed[c] = getSpeed();
      }
      heads[c] = headIdx;
      column[headIdx] = getRandomChar();
    }
  };

  requestAnimationFrame(tick, cnv);
};

function getSpeed() {
  return getRandomInt(2, 4);
}

function getRandomChar() {
  // Hiragana 12353 - 12447
  // Katakana	12447- 12543
  return String.fromCharCode(getRandomInt(12353, 12543));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = init;
