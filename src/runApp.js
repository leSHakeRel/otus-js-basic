import "./style.css";

export function runApp(element, text) {
  if (typeof element === "object") {
    element.innerHTML = `<h1 class="neon-text">${text}</h1>`;
  } else {
    console.warn(`element ${element} is not object`);
  }
}
