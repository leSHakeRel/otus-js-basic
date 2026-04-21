import "./style.css";
import * as weatherSearchView from "./weatherSearchView.js";
import * as weatherResultView from "./weatherResultView.js";
import * as weatherController from "./weatherController.js";
import { addElement } from "./view.js";

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

  weatherSearchView.renderWeatherSearch(mainContainer, (searchData) => {
    weatherController.fetchWeather(searchData);
  });

  const resultContainer = addElement(mainContainer, "section", "", "row");

  weatherResultView.renderWeatherResult(resultContainer);

  weatherController.initController();
}
