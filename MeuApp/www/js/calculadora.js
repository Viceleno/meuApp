const display = document.getElementById("display");

function add(value) {
  if (display.value.length < 20) {
    display.value += value;
  }
}

function clearDisplay() {
  display.value = "";
}

function calculate() {
  try {
    display.value = eval(display.value);
    if (display.value.length > 20) {
      display.value = "Erro";
    }
  } catch (e) {
    display.value = "Erro";
  }
}
const toggleButton = document.getElementById("toggle-theme");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Alterna o ícone (🌙 <-> 🌞)
  if (document.body.classList.contains("dark-mode")) {
    toggleButton.textContent = "🌞";
  } else {
    toggleButton.textContent = "🌙";
  }
});

