const nameInput = document.querySelector("[name='name']");
const form = document.querySelector("form");

// Check if name input is empty when submiting
form.addEventListener("submit", function (e) {
  if (nameInput.value.trim().length === 0) {
    e.preventDefault();
    nameInput.parentElement.classList.add("error");
    return;
  }

  // Save name in session storage
  sessionStorage.setItem("sudoku-name", nameInput.value);
});

/*
 * Check if user entered name then emptied input on purpose
 * Remove error msg when user starts typing name
 */
nameInput.addEventListener("input", function (e) {
  if (this.value.trim().length !== 0) {
    nameInput.parentElement.classList.remove("error");
  } else {
    nameInput.parentElement.classList.add("error");
  }
});
