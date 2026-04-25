import "./style.css";
import * as weatherSearchView from "./weatherSearchView.js";
import * as weatherResultView from "./weatherResultView.js";
import * as weatherController from "./weatherController.js";
import { addElement } from "./view.js";
import { bus } from "./eventbus.js";

/**
 * Запуск приложения
 * @param {HTMLElement} element - корневой элемент для приложения
 */
export function runApp(element) {
  if (typeof element !== "object" || element === null) {
    console.warn(`element ${element} is not object`);
    return;
  }

  const mainContainer = addElement(element, "div", "", "main-container");
  weatherSearchView.renderWeatherSearch(mainContainer);

  const resultContainer = addElement(mainContainer, "section", "", "row");
  weatherResultView.renderWeatherResult(resultContainer);

  weatherController.initController();

  bus.on("search:submit", (searchData) => {
    weatherController.fetchWeather(searchData);
  });
}
