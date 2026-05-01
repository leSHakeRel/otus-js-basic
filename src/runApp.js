import "./style.css";
import * as weatherSearchView from "./weatherSearchView.js";
import * as weatherResultView from "./weatherResultView.js";
import * as weatherController from "./weatherController.js";
import { weatherStorage } from "./weatherStorageService.js";
import { historyController } from "./weatherSearchHistoryController.js";
import { renderAbout } from "./aboutView.js";
import { addElement } from "./view.js";
import { bus } from "./eventbus.js";
import { router } from "./router.js";

let mainContainer = undefined;
/**
 * Запуск приложения
 * @param {HTMLElement} element - корневой элемент для приложения
 */
export function runApp(element) {
  if (typeof element !== "object" || element === null) {
    console.warn(`element ${element} is not object`);
    return;
  }

  mainContainer = addElement(element, "div", "", "main-container");

  initUI(mainContainer);

  bus.on("weather:addCity", historyController.addCity, {
    context: historyController,
  });
  bus.on("weather:addCity", weatherStorage.addToHistory, {
    context: weatherStorage,
  });

  setupRoutes();

  weatherController.initController();

  bus.on("search:submit", (searchData) => {
    weatherController.fetchWeather(searchData);
  });
}

function initUI(container) {
  container.innerHTML = "";
  addNavigation(container);

  weatherSearchView.renderWeatherSearch(container);

  const dataContainer = addElement(container, "section", "", "row");

  const resultContainer = addElement(dataContainer, "section", "", "row");
  weatherResultView.renderWeatherResult(resultContainer);

  const searhHistory = addElement(dataContainer, "section", "", "row");
  historyController.init(searhHistory);
}

/**
 * Добавление навигационного меню
 * @param {HTMLElement} container - контейнер для меню
 */
function addNavigation(container) {
  const nav = document.createElement("nav");
  nav.className = "main-navigation";
  nav.innerHTML = `
    <ul class="nav-list">
      <!--li class="nav-item">
        <a href="/" data-router-link class="nav-link ${router.getCurrentPath() === "/" ? "active" : ""}">
          Главная
        </a>
      </li-->
      <li class="nav-item">
        <a href="/about" data-router-link class="nav-link ${router.getCurrentPath() === "/about" ? "active" : ""}">
          О приложении
        </a>
      </li>
    </ul>
  `;

  bus.on("router:routeChanged", ({ pathname }) => {
    const links = nav.querySelectorAll(".nav-link");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === pathname || (href === "/" && pathname === "/")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });

  container.insertBefore(nav, container.firstChild);
}

function setupRoutes() {
  router.addRoute("/", async () => {
    await weatherController.fetchWeather({ type: "auto" });
  });

  router.addRoute("/main", async () => {
    initUI(mainContainer);
  });

  router.addRoute("/weather/:city", async (pathname, params) => {
    const cityName = decodeURIComponent(params.city);
    await weatherController.fetchWeather({ type: "city", cityName });
  });

  router.addRoute("/about", () => {
    renderAbout(mainContainer);
  });

  // 404
  router.setNotFoundHandler(async (pathname) => {
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="not-found">
          <h2>404 - Страница не найдена</h2>
          <p>Маршрут "${pathname}" не существует</p>
          <button class="back-button" data-router-link href="/">На главную</button>
        </div>
      `;
    }
  });
}
