import "./style.css";
import { getWeatherData } from "./weatherApi.js";
import { getWeatherSearchUI } from "./weatherSearch.js";
import { getWeatherResultUI, setWeatherData } from "./weatherResult.js";

/**
 * Добавление пользовательского интерфейса
 * @param { HTMLElement } element - модифицируемый элемент
 */
export function runApp(element) {
  if (typeof element === "object" && element !== null) {
    const mainContainer = document.createElement("div");
    mainContainer.classList.add("main-container");
    element.append(mainContainer);

    getWeatherSearchUI(mainContainer);

    const resultContainer = document.createElement("section");
    resultContainer.classList.add("row");

    const form = element.querySelector("#locationForm");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const searchData = {
          type: formData.get("searchType"),
          cityName: formData.get("cityName"),
        };

        try {
          const weather = await getWeatherData(searchData);

          setWeatherData(weather);
        } catch (error) {
          console.error("Ошибка получении погоды:", error);
          throw error;
        }
      });
    }

    getWeatherResultUI(resultContainer);
    mainContainer.append(resultContainer);
  } else {
    console.warn(`element ${element} is not object`);
  }
}
