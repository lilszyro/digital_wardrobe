const buttons = document.querySelectorAll("[data-panel]");
const panels = document.querySelectorAll(".panel");
let activeButton = null;

function closePanel(panel) {
  panel.hidden = true;
  document.body.style.overflow = "";
  activeButton?.focus();
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.panel === "clothes-panel") {
      window.location.href = "clothes.html";
      return;
    }

    if (button.dataset.panel === "accessories-panel") {
      window.location.href = "accessories.html";
      return;
    }

    const panel = document.getElementById(button.dataset.panel);
    activeButton = button;
    panel.hidden = false;
    document.body.style.overflow = "hidden";
    panel.querySelector(".close-button").focus();
  });
});

panels.forEach((panel) => {
  panel.querySelector(".close-button").addEventListener("click", () => closePanel(panel));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const openPanel = [...panels].find((panel) => !panel.hidden);
    if (openPanel) closePanel(openPanel);
  }
});
