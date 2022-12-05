"use strict";

const WALL = "WALL";
const FLOOR = "FLOOR";
const PASSAGE = "PASSAGE";
const BALL = "BALL";
const GAMER = "GAMER";
const GLUE = "GLUE";
const scoreDisplay = document.querySelector(".scores");
const nearBallsDisplay = document.querySelector(".near");
const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/candy.png">';
const COLLECT_AUDIO = new Audio("sounds/collect.wav");

// Model:
var gBoard;
var gGamerPos;
var gameOn = true;
var gGameInterval;
var score;
var isGlue = false;
var glueInterval;

function onInitGame() {
  document.querySelector(".play").style.display = "none";
  isGlue = false;
  score = 0;
  gameOn = true;
  clearInterval(gGameInterval);
  score = 0;
  scoreDisplay.innerText = score;
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  renderBoard(gBoard);

  gGameInterval = setInterval(addBall, 3000);

  glueInterval = setInterval(() => addGlue(), 5000);
}

function buildBoard() {
  const board = [];
  // DONE: Create the Matrix 10 * 12
  // DONE: Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < 10; i++) {
    board[i] = [];
    for (var j = 0; j < 12; j++) {
      board[i][j] = { type: FLOOR, gameElement: null };
      if (i === 0 || i === 9 || j === 0 || j === 11) {
        board[i][j].type = WALL;
      }
    }
  }
  // DONE: Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
  board[5][5].gameElement = BALL;
  board[7][2].gameElement = BALL;
  board[0][5].type =
    board[5][0].type =
    board[9][5].type =
    board[5][11].type =
      PASSAGE;
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  const elBoard = document.querySelector(".board");
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j];
      var cellClass = getClassName({ i: i, j: j });
      if (currCell.type === FLOOR) cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";
      else if (currCell.type === PASSAGE) cellClass += " passage";

      strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`;

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      }

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  if (isGlue) return;
  const targetCell = gBoard[i][j];
  console.log(targetCell);
  console.log(i, j);
  if (!gameOn) return;

  if (targetCell.type === WALL) return;

  if (targetCell.gameElement === GLUE && !isGlue) {
    isGlue = true;
    setTimeout(() => (isGlue = false), 3000);
  }
  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i);
  const jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    (jAbsDiff === 0 && iAbsDiff === 9) ||
    (jAbsDiff === 9 && iAbsDiff === 0) ||
    (jAbsDiff === 0 && iAbsDiff === 11) ||
    (jAbsDiff === 11 && iAbsDiff === 0)
  ) {
    if (targetCell.gameElement === BALL) {
      score++;
      scoreDisplay.innerHTML = score;
      // console.log(score);
      COLLECT_AUDIO.play();
      checkVictory();
      console.log("Collecting!");
    }

    // DONE: Move the gamer
    // REMOVING FROM
    // update Model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // update DOM
    renderCell(gGamerPos, "");
    // ADD TO
    // update Model
    targetCell.gameElement = GAMER;
    gGamerPos = { i, j };
    // update DOM
    renderCell(gGamerPos, GAMER_IMG);
  }
  countNeighbors(i, j, gBoard);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  const cellSelector = "." + getClassName(location); // cell-i-j
  const elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function onHandleKey(event) {
  const i = gGamerPos.i;
  const j = gGamerPos.j;
  if (i === 5 && j === 0) {
    console.log("i j", i, j);
    if (event.key === "ArrowLeft") moveTo(i, j + 11);
  }
  if (i === 5 && j === 11) {
    if (event.key === "ArrowRight") moveTo(i, j - 11);
  }

  if (i === 0 && j === 5) {
    if (event.key === "ArrowUp") moveTo(i + 9, j);
  }
  if (i === 9 && j === 5) {
    if (event.key === "ArrowDown") moveTo(i - 9, j);
  }

  switch (event.key) {
    case "ArrowLeft":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  const cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

function countNeighbors(cellI, cellJ, board) {
  var neighborsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (board[i][j].gameElement === BALL) {
        neighborsCount++;
      }
    }
    nearBallsDisplay.innerHTML = neighborsCount;
  }
  return neighborsCount;
}

function addBall() {
  var emptyPos = getEmptyPos();
  gBoard[emptyPos.i][emptyPos.j].gameElement = BALL;
  renderCell(emptyPos, BALL_IMG);
}

function addGlue() {
  var emptyPos = getEmptyPos();
  gBoard[emptyPos.i][emptyPos.j].gameElement = GLUE;
  renderCell(emptyPos, GLUE_IMG);
  setTimeout(() => {
    if (gBoard[emptyPos.i][emptyPos.j].gameElement !== GAMER) {
      gBoard[emptyPos.i][emptyPos.j].gameElement = null;
      renderCell(emptyPos, "");
    }
  }, 3000);
}

function getEmptyPos() {
  var emptyPos = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j];
      if (!currCell.gameElement && currCell.type === FLOOR) {
        emptyPos.push({ i, j });
      }
    }
  }
  var randIdx = getRandomInt(0, emptyPos.length);
  return emptyPos[randIdx];
}

function checkVictory() {
  var sum = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j];
      if (currCell.gameElement !== BALL) {
        currCell = 1;
        sum += currCell;
      }
    }
    if (sum === 119) {
      console.log("You won");
      document.querySelector(".play").style.display = "Inline";
      clearInterval(gGameInterval);
      clearInterval(glueInterval);
      gameOn = false;
    }
  }
}

// "use strict";

// const WALL = "WALL";
// const FLOOR = "FLOOR";
// const PASSAGE = "PASSAGE";
// const BALL = "BALL";
// const GAMER = "GAMER";
// const GLUE = "GLUE";
// const scoreDisplay = document.querySelector(".scores");
// const nearBallsDisplay = document.querySelector(".near");
// const GAMER_IMG = '<img src="img/gamer.png">';
// const BALL_IMG = '<img src="img/ball.png">';
// const GLUE_IMG = '<img src="img/candy.png">';
// const COLLECT_AUDIO = new Audio("sounds/collect.wav");

// // Model:
// var gBoard;
// var gGamerPos;
// var gameOn = true;
// var gGameInterval;
// var score;
// var isGlue = false;
// var glueInterval;

// function onInitGame() {
//   document.querySelector(".play").style.display = "none";
//   isGlue = false;
//   score = 0;
//   gameOn = true;
//   clearInterval(gGameInterval);
//   score = 0;
//   scoreDisplay.innerText = score;
//   gGamerPos = { i: 2, j: 9 };
//   gBoard = buildBoard();
//   renderBoard(gBoard);

//   gGameInterval = setInterval(addBall, 3000);

//   glueInterval = setInterval(() => addGlue(), 5000);
// }

// function buildBoard() {
//   const board = [];
//   // DONE: Create the Matrix 10 * 12
//   // DONE: Put FLOOR everywhere and WALL at edges
//   for (var i = 0; i < 10; i++) {
//     board[i] = [];
//     for (var j = 0; j < 12; j++) {
//       board[i][j] = { type: FLOOR, gameElement: null };
//       if (i === 0 || i === 9 || j === 0 || j === 11) {
//         board[i][j].type = WALL;
//       }
//     }
//   }
//   // DONE: Place the gamer and two balls
//   board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
//   board[5][5].gameElement = BALL;
//   board[7][2].gameElement = BALL;
//   board[0][5].type =
//     board[5][0].type =
//     board[9][5].type =
//     board[5][11].type =
//       PASSAGE;
//   return board;
// }

// // Render the board to an HTML table
// function renderBoard(board) {
//   const elBoard = document.querySelector(".board");
//   var strHTML = "";
//   for (var i = 0; i < board.length; i++) {
//     strHTML += "<tr>\n";
//     for (var j = 0; j < board[0].length; j++) {
//       const currCell = board[i][j];
//       var cellClass = getClassName({ i: i, j: j });
//       if (currCell.type === FLOOR) cellClass += " floor";
//       else if (currCell.type === WALL) cellClass += " wall";
//       else if (currCell.type === PASSAGE) cellClass += " passage";

//       strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`;

//       if (currCell.gameElement === GAMER) {
//         strHTML += GAMER_IMG;
//       } else if (currCell.gameElement === BALL) {
//         strHTML += BALL_IMG;
//       }

//       strHTML += "\t</td>\n";
//     }
//     strHTML += "</tr>\n";
//   }
//   elBoard.innerHTML = strHTML;
// }

// // Move the player to a specific location
// function moveTo(i, j) {
//   if (isGlue) return;
//   const targetCell = gBoard[i][j];

//   if (!gameOn) return;

//   if (targetCell.type === WALL) return;

//   if (targetCell.gameElement === GLUE && !isGlue) {
//     isGlue = true;
//     setTimeout(() => (isGlue = false), 3000);
//   }
//   // Calculate distance to make sure we are moving to a neighbor cell
//   const iAbsDiff = Math.abs(i - gGamerPos.i);
//   const jAbsDiff = Math.abs(j - gGamerPos.j);

//   // If the clicked Cell is one of the four allowed
//   if (
//     (iAbsDiff === 1 && jAbsDiff === 0) ||
//     (jAbsDiff === 1 && iAbsDiff === 0) ||
//     (jAbsDiff === 0 && iAbsDiff === 9) ||
//     (jAbsDiff === 9 && iAbsDiff === 0) ||
//     (jAbsDiff === 0 && iAbsDiff === 11) ||
//     (jAbsDiff === 11 && iAbsDiff === 0)
//   ) {
//     if (targetCell.gameElement === BALL) {
//       score++;
//       scoreDisplay.innerHTML = score;
//       // console.log(score);
//       COLLECT_AUDIO.play();
//       checkVictory();
//       console.log("Collecting!");
//     }

//     // DONE: Move the gamer
//     // REMOVING FROM
//     // update Model
//     gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
//     // update DOM
//     renderCell(gGamerPos, "");
//     // ADD TO
//     // update Model
//     targetCell.gameElement = GAMER;
//     gGamerPos = { i, j };
//     // update DOM
//     renderCell(gGamerPos, GAMER_IMG);
//   }
//   countNeighbors(i, j, gBoard);
//   // console.log(i, j, gBoard);
// }

// // Convert a location object {i, j} to a selector and render a value in that element
// function renderCell(location, value) {
//   const cellSelector = "." + getClassName(location); // cell-i-j
//   const elCell = document.querySelector(cellSelector);
//   elCell.innerHTML = value;
// }

// // Move the player by keyboard arrows
// function onHandleKey(event) {
//   const i = gGamerPos.i;
//   const j = gGamerPos.j;
//   console.log(i, j);
//   if (i === 5 && j === 0) {
//     switch (event.key) {
//       case "ArrowLeft":
//         moveTo(i, j + 11);
//         break;
//     }
//   }
//   if (i === 5 && j === 11) {
//     switch (event.key) {
//       case "ArrowRight":
//         moveTo(i, j - 11);
//         break;
//     }
//   }
//   if (i === 0 && j === 5) {
//     switch (event.key) {
//       case "ArrowUp":
//         moveTo(i + 9, j);
//         break;
//     }
//   }
//   if (i === 9 && j === 5) {
//     switch (event.key) {
//       case "ArrowDown":
//         moveTo(i - 9, j);
//         break;
//     }
//   }

//   switch (event.key) {
//     case "ArrowLeft":
//       moveTo(i, j - 1);
//       break;
//     case "ArrowRight":
//       moveTo(i, j + 1);
//       break;
//     case "ArrowUp":
//       moveTo(i - 1, j);
//       break;
//     case "ArrowDown":
//       moveTo(i + 1, j);
//       break;
//   }
// }

// // Returns the class name for a specific cell
// function getClassName(location) {
//   const cellClass = "cell-" + location.i + "-" + location.j;
//   return cellClass;
// }

// function countNeighbors(cellI, cellJ, board) {
//   var neighborsCount = 0;
//   for (var i = cellI - 1; i <= cellI + 1; i++) {
//     for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//       if (board[i][j].gameElement === BALL) {
//         neighborsCount++;
//       }
//     }
//     nearBallsDisplay.innerHTML = neighborsCount;
//   }
//   return neighborsCount;
// }

// function addBall() {
//   var emptyPos = getEmptyPos();
//   gBoard[emptyPos.i][emptyPos.j].gameElement = BALL;
//   renderCell(emptyPos, BALL_IMG);
// }

// function addGlue() {
//   var emptyPos = getEmptyPos();
//   gBoard[emptyPos.i][emptyPos.j].gameElement = GLUE;
//   renderCell(emptyPos, GLUE_IMG);
//   setTimeout(() => {
//     if (gBoard[emptyPos.i][emptyPos.j].gameElement !== GAMER) {
//       gBoard[emptyPos.i][emptyPos.j].gameElement = null;
//       renderCell(emptyPos, "");
//     }
//   }, 3000);
// }

// function getEmptyPos() {
//   var emptyPos = [];
//   for (var i = 0; i < gBoard.length; i++) {
//     for (var j = 0; j < gBoard[0].length; j++) {
//       var currCell = gBoard[i][j];
//       if (!currCell.gameElement && currCell.type === FLOOR) {
//         emptyPos.push({ i, j });
//       }
//     }
//   }
//   var randIdx = getRandomInt(0, emptyPos.length);
//   return emptyPos[randIdx];
// }

// function checkVictory() {
//   var sum = 0;
//   for (var i = 0; i < gBoard.length; i++) {
//     for (var j = 0; j < gBoard[0].length; j++) {
//       var currCell = gBoard[i][j];
//       if (currCell.gameElement !== BALL) {
//         currCell = 1;
//         sum += currCell;
//       }
//     }
//     if (sum === 119) {
//       console.log("You won");
//       document.querySelector(".play").style.display = "Inline";
//       clearInterval(gGameInterval);
//       clearInterval(glueInterval);
//       gameOn = false;
//     }
//   }
// }
