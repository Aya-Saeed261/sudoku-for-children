/* Function that handles user movement around cells
 * Input: Event object, Currently selected cell index, Currently selected cell html element, Number of all cells and html audio element that makes moving sound
 * Output: Array of new selected cell index and new selected cell html element
 */
const handleMovement = function (
  event,
  currentIndx,
  currentCell,
  numOfCells,
  moveAudio
) {
  // Restart audio and play moving sound
  moveAudio.currentTime = 0;
  moveAudio.play();

  // When there are no previously selected cells, always select first cell
  if (currentIndx === 0) {
    currentIndx++;
    currentCell = document.querySelector(`[data-indx="${currentIndx}"]`);
    currentCell.classList.add("selected");
    return [currentIndx, currentCell];
  }

  // Unselect previous cell
  currentCell.classList.remove("selected");

  // Movement calculations
  if (event.key === "ArrowRight") {
    currentIndx++;
    if (currentIndx > numOfCells) currentIndx = 1;
  } else if (event.key === "ArrowLeft") {
    currentIndx--;
    if (currentIndx < 1) currentIndx = numOfCells;
  } else if (event.key === "ArrowUp") {
    currentIndx -= 4;
    if (currentIndx < 1) currentIndx += numOfCells;
  } else {
    currentIndx += 4;
    if (currentIndx > numOfCells) currentIndx -= numOfCells;
  }

  // Select current cell
  currentCell = document.querySelector(`[data-indx="${currentIndx}"]`);
  currentCell.classList.add("selected");

  return [currentIndx, currentCell];
};

/*
 * Function that generates random number within a specific range
 * Input: Minimum number and Maximum number
 * Output: Random number
 */
const getRandomNum = function (min, max) {
  const randomNum = Math.floor(Math.random() * (max - min) + min);
  return randomNum;
};

/*
 * Function that sets user choice in selected cell
 * Input: Selectd cell html element, selected choice, chosen group and html audio element that makes selection sound
 * Select audio is intially null beacause I won't pass audio element when I generate random cells in the start
 */
const playCell = function (cell, choice, group, selectAudio = null) {
  cell.dataset.choice = choice;
  cell.classList.add("played");
  cell.querySelector("img").src = `assets/images/group-${group}/${choice}.png`;
  if (selectAudio) {
    selectAudio.currentTime = 0;
    selectAudio.play();
  }
};

/*
 * Function that gets a random cell and checks if it's unique (doesn't have other cells in row or column)
 * Input: Number of all cells
 * Output: Unique cell html element
 */
const selectUniqueCell = function (cellsNum) {
  let randomIndx, allAjacentCells, cell, isIndxValid;

  do {
    randomIndx = getRandomNum(1, cellsNum + 1);
    cell = document.querySelector(`[data-indx="${randomIndx}"]`);

    // If cell already has a choice (was played), Redo process
    if (cell.dataset.choice) {
      isIndxValid = false;
      continue;
    }

    // Get all played cells in the same row or column as the selected cell
    allAjacentCells = document.querySelectorAll(
      `[data-row="${cell.dataset.row}"][data-choice],[data-col="${cell.dataset.col}"][data-choice]`
    );

    // Check if there's any other played cell in the same row or column
    if (allAjacentCells.length > 0) {
      isIndxValid = false;
    } else {
      isIndxValid = true;
    }
  } while (!isIndxValid);

  return cell;
};

/*
 * Function that sets board on game start (puts different choices in unique cells)
 * Input: Number of all cells, Number of all choices and Chosen group
 */
const startGame = function (cellsNum, choicesNum, userGroup) {
  let cell, randomChoice;

  for (let i = 0; i < choicesNum; i++) {
    // Get a unique cell
    cell = selectUniqueCell(cellsNum);

    // Get unique choice
    do {
      randomChoice = getRandomNum(1, choicesNum + 1);
    } while (
      document.querySelector(`[data-choice="${randomChoice}"]`) !== null
    );

    playCell(cell, randomChoice, userGroup);
  }
};

/*
 * Function that starts timer
 * Input: Time in seconds, Html element to display time in, Modal html element and losing audio html element
 */
const startCountDown = function (time, timerText, modal, loseAudio) {
  const id = setInterval(() => {
    if (time === 60) {
      timerText.innerText = `01:00`;
    } else {
      timerText.innerText = `00:${time < 10 ? "0" : ""}${time}`;
    }
    --time;
    if (time < 0) {
      clearInterval(id);
      // Show losing message and play audio
      modal.dataset.show = "true";
      modal.classList.remove("hide");
      modal.classList.add("lose-mode");
      loseAudio.play();
    }
  }, 1000);
  return id;
};

/*
 * Function that highlights repeated cells and show losing message
 * Input: Html collection of repeated cells, timer id, result moda and losing audio
 */
const onRepeatedCells = function (repeatedCells, timerId, modal, loseAudio) {
  // Adds class to start losing animation
  [...repeatedCells].forEach((ele) => ele.classList.add("repeated"));

  clearInterval(timerId);

  // Prevent any keydown action
  modal.dataset.show = "true";

  loseAudio.play();

  // Show losing message after animation finishes
  setTimeout(function () {
    modal.classList.remove("hide");
    modal.classList.add("lose-mode");
  }, 1300);
};

/*
 * Function that checks whether user won or lost or still playing
 * Input: Played cell element, timer id, Result modal, number of all cells, losing audio and winning audio
 */
const checkResult = function (
  cell,
  timerId,
  modal,
  numOfCells,
  loseAudio,
  winAudio
) {
  // Get all cells with same choice in the same row or column
  const adjacentCellsWithSameChoices = document.querySelectorAll(
    `[data-row="${cell.dataset.row}"][data-choice="${cell.dataset.choice}"],[data-col="${cell.dataset.col}"][data-choice="${cell.dataset.choice}"]`
  );

  if (adjacentCellsWithSameChoices.length > 1) {
    // User Lost
    onRepeatedCells(adjacentCellsWithSameChoices, timerId, modal, loseAudio);
  } else if (document.querySelectorAll("[data-choice]").length === numOfCells) {
    // If all cells were played and there were no repeated choice in any column or row, User wins
    winAudio.play();

    clearInterval(timerId);

    // Prevent any keydown action
    modal.dataset.show = "true";

    // Show winning animation
    document.querySelector(".board").classList.add("user-won");

    // Show winning message after animation finishes
    setTimeout(function () {
      modal.classList.remove("hide");
      modal.classList.add("win-mode");
    }, 1300);
  }
};
