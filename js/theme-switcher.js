document.addEventListener("DOMContentLoaded", function () {
  // Check local storage for saved theme
  let savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
    return;
  }

  // Check browser preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
});

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  const themeSelect = document.getElementById("theme-select");
  if (themeSelect) {
    themeSelect.value = theme;
  }

  // Separately, set the background color of the root element
  const root = document.documentElement;
  root.style.backgroundColor = getComputedStyle(document.body).getPropertyValue(
    "--background-color"
  );
}

const themeSelectElement = document.getElementById("theme-select");
if (themeSelectElement) {
  themeSelectElement.addEventListener("change", function () {
    const selectedTheme = this.value;
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
}
