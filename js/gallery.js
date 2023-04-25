const groupBtns = document.querySelectorAll(".group-btn");

// Add event listener for every group button
[...groupBtns].forEach((btn) => {
  btn.onclick = function () {
    // Save group number user has chosen
    sessionStorage.setItem("sudoku-group", this.dataset.group);
  };
});
