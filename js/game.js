const closeOptionsModalBtn = document.querySelector("#close-options");
const openOptionsModalBtn = document.querySelector("#options-btn");
const OptionsModal = document.querySelector("#options-holder");
const resultModal = document.querySelector("#result-modal");
const musicSlider = document.querySelector("#music-slider");
const playAgainBtn = document.querySelector("#play-again");
const volumeSpan = document.querySelector("#volume-value");
const timerInput = document.querySelector("#timer-input");
const startBtn = document.querySelector("#start-btn");
const timerText = document.querySelector(".timer");

// Audios
const selectAudio = document.querySelector("#select-sound");
const bgMusicAudio = document.querySelector("#bg-music");
const moveAudio = document.querySelector("#move-sound");
const loseAudio = document.querySelector("#lose-sound");
const winAudio = document.querySelector("#win-sound");

// Script is module
const userGroup = sessionStorage.getItem("sudoku-group") || 1;
let currentCell,
  currentIndx,
  timerId,
  time = 60;
const numOfCells = 16,
  numOfChoices = 4;

// Set username, chosen group of images, background image and background music on load
(function () {
  // Set group images
  const allChoices = document.querySelectorAll(".choices img");
  [...allChoices].forEach((img, indx) => {
    img.src = `assets/images/group-${userGroup}/${indx + 1}.png`;
  });

  // Set background image
  document.querySelector("#container").classList.add(`bg-${userGroup}`);

  // Set username
  document.querySelector("#userName").innerText =
    sessionStorage.getItem("sudoku-name") || "Unknown";

  // Set background music
  bgMusicAudio.querySelector("source").src = `assets/sounds/${userGroup}.mp3`;
  bgMusicAudio.load();
  bgMusicAudio.volume = 0.2;
  bgMusicAudio.play();
  bgMusicAudio.muted = false;
})();

// Starts game
startBtn.addEventListener("click", function () {
  currentCell = null;
  currentIndx = 0;

  // Hide start button
  this.classList.add("hide");

  // Show countdown
  timerText.classList.remove("hide");

  timerId = startCountDown(time, timerText, resultModal, loseAudio);

  startGame(numOfCells, numOfChoices, userGroup, selectAudio);

  document.onkeydown = function (event) {
    // If game ended, prevent keydown actions
    if (resultModal.dataset.show === "true") return false;

    // If user pressed any arrow key, move to selected cell
    if (event.key.includes("Arrow")) {
      [currentIndx, currentCell] = handleMovement(
        event,
        currentIndx,
        currentCell,
        numOfCells,
        moveAudio
      );
      // Listen to numbers from 1 to 4 only when a cell is selected
    } else if (
      currentCell !== null &&
      !isNaN(event.key) &&
      +event.key >= 1 &&
      +event.key <= 4
    ) {
      // If cell was already played, prevent replaying
      if (currentCell.dataset.choice) {
        return;
      }

      playCell(currentCell, event.key, userGroup, selectAudio);

      // Check if user won, lost or still playing
      checkResult(
        currentCell,
        timerId,
        resultModal,
        numOfCells,
        loseAudio,
        winAudio
      );
    }
  };
});

// Reset game
playAgainBtn.onclick = function () {
  // Reset cells
  const allCells = document.querySelectorAll(".cell");
  allCells.forEach((cell) => {
    delete cell.dataset.choice;
    cell.querySelector("img").src = "";
    cell.classList.remove("played", "selected", "repeated");
  });

  // Remove winning animation
  document.querySelector(".board").classList.remove("user-won");

  // Close result modal
  resultModal.classList.remove("win-mode", "lose-mode");
  resultModal.classList.add("hide");
  resultModal.dataset.show = "false";

  // Show start button, reset and hide timer
  timerText.classList.add("hide");
  timerText.innerText = "";
  startBtn.classList.remove("hide");

  // Prevent keydown actions before starting again
  document.onkeydown = null;
};

// Close options modal
closeOptionsModalBtn.addEventListener("click", function () {
  OptionsModal.classList.add("hide");
});

// Open options modal
openOptionsModalBtn.addEventListener("click", function () {
  OptionsModal.classList.remove("hide");
});

// Change music volume when user chooses desired value
musicSlider.addEventListener("input", function () {
  bgMusicAudio.volume = (this.value / 100).toFixed(1);
  volumeSpan.innerText = `${this.value}%`;
  volumeSpan.style.left = `${this.value}%`;
});

// Change timer when user chooses desired value
timerInput.addEventListener("input", function () {
  time = +timerInput.value;
});

// Disable user entering number out of range
timerInput.addEventListener("keydown", (e) => e.preventDefault());
