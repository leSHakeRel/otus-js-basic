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

    const applyWeatherData = async (searchData) => {
      const weather = await getWeatherData(searchData);
      setWeatherData(weather);
    };

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
          await applyWeatherData(searchData);
        } catch (error) {
          console.error("Ошибка получении погоды:", error);
          throw error;
        }

        localStorage.setItem("searchData", JSON.stringify(searchData));
      });
    }

    getWeatherResultUI(resultContainer);
    mainContainer.append(resultContainer);

    const loadedData = localStorage.getItem("searchData");

    if (loadedData) {
      const jsonLoadedData = JSON.parse(loadedData);
      if (jsonLoadedData.type === "city") {
        const cityRadioButton = element.querySelector("#cityNameSearch");
        if (cityRadioButton) cityRadioButton.checked = true;

        const cityNameInput = element.querySelector(".cityNameInput");
        if (cityNameInput) cityNameInput.value = jsonLoadedData.cityName;
        if (cityNameInput && cityNameInput.style)
          cityNameInput.style.display = "block";
      }
      try {
        applyWeatherData(jsonLoadedData);
      } catch (error) {
        console.error("Ошибка получении погоды:", error);
      }
    }
  } else {
    console.warn(`element ${element} is not object`);
  }
}
