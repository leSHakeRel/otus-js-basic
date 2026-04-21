import "./weatherResult.css";
import { addElement } from "./view.js";

const WIND_ICON_SVG = `
  <svg fill="#006bc2" height="32px" width="32px" version="1.1" viewBox="0 0 512.003 512.003">
    <path d="M322.528,387.207l-57.984-74.551V101.617l46.276,33.057c1.486,1.067,3.228,1.588,4.961,1.588
      c1.981,0,3.954-0.692,5.542-2.049c2.989-2.545,3.851-6.798,2.092-10.316L263.639,4.342c-2.895-5.79-12.382-5.79-15.277,0
      l-59.777,119.554c-1.759,3.51-0.888,7.763,2.092,10.316c2.98,2.545,7.31,2.733,10.504,0.461l46.285-33.057v211.048l-57.984,74.542
      c-1.161,1.494-1.793,3.339-1.793,5.243v111.015c0,3.646,2.314,6.891,5.764,8.078c3.433,1.178,7.276,0.043,9.513-2.835
      l53.039-68.197l53.031,68.189c1.648,2.126,4.159,3.296,6.746,3.296c0.922,0,1.862-0.154,2.775-0.461
      c3.45-1.178,5.764-4.424,5.764-8.07V392.45C324.321,390.546,323.69,388.701,322.528,387.207z"/>
  </svg>
`;

let elements = {};

/**
 * Рендер UI результатов
 * @param { HTMLElement } container - заполнение контейнера виджетами
 */
export function renderWeatherResult(container) {
  const mainSection = addElement(container, "section", "", "resultSection");
  const cityName = addElement(mainSection, "div", "", "resultSection-cityName");
  const cityBlockText = addElement(cityName, "div", "", "cityName-block-text");
  addElement(cityBlockText, "p", "", "cityName-text");

  const cityBlockError = addElement(
    cityName,
    "div",
    "",
    "cityName-block-error",
  );
  addElement(cityBlockError, "p", "", "cityName-error");

  const gridContainer = addElement(mainSection, "div", "", "grid-container");

  elements = {
    cityNameText: document.querySelector(".cityName-text"),
    cityNameError: document.querySelector(".cityName-error"),
    cityBlockText: document.querySelector(".cityName-block-text"),
    cityBlockError: document.querySelector(".cityName-block-error"),
    gridContainer: document.querySelector(".grid-container"),
    weatherIcon: null,
    weatherText: null,
    temperatureValue: null,
    feelTemperatureValue: null,
    pressureValue: null,
    windSpeedValue: null,
    windDirectionIcon: null,
    uvIndexValue: null,
  };

  buildGridItems(gridContainer);
}

/**
 * Построение грида с данными
 * @param { HTMLElement } gridContainer - контейнер
 */
function buildGridItems(gridContainer) {
  const items = [
    { label: "Ощущается", value: "feelTemperatureValue" },
    { label: "Давление", value: "pressureValue" },
    { label: "Скорость ветра", value: "windSpeedValue" },
    { label: "Направл. ветра", value: "windDirectionIcon" },
    { label: "UV-индекс", value: "uvIndexValue" },
  ];

  const tempCell = addElement(gridContainer, "div", "", [
    "grid-item",
    "temperatureCell",
  ]);
  const tempCellItem = addElement(tempCell, "div", "", "cellItem");
  elements.weatherIcon = addElement(tempCellItem, "p", "", "weatherIcon");
  elements.weatherText = addElement(tempCellItem, "p", "", "weatherText");
  addElement(tempCellItem, "p", "Температура");
  elements.temperatureValue = addElement(
    tempCellItem,
    "p",
    "",
    "temperatureValue",
  );

  items.forEach((item) => {
    const cell = addElement(gridContainer, "div", "", "grid-item");
    const cellItem = addElement(cell, "div", "", "cellItem");

    if (item.label) {
      addElement(cellItem, "p", item.label);
    }

    const valueElement = addElement(cellItem, "p", "", item.value);
    if (item.value === "feelTemperatureValue")
      elements.feelTemperatureValue = valueElement;
    if (item.value === "pressureValue") elements.pressureValue = valueElement;
    if (item.value === "windSpeedValue") elements.windSpeedValue = valueElement;
    if (item.value === "windDirectionIcon")
      elements.windDirectionIcon = valueElement;
    if (item.value === "uvIndexValue") elements.uvIndexValue = valueElement;
  });
}

export function showLoading() {
  if (elements.gridContainer) {
    elements.gridContainer.style.visibility = "hidden";
  }
  showErrorBlock(false);
  showTextBlock(true);
}

/**
 * Показать ошибку
 * @param {string} message - текст ошибки
 */
export function showError(message) {
  showErrorBlock(true);
  showTextBlock(false);
  if (elements.cityNameError) {
    elements.cityNameError.textContent = message;
  }
  if (elements.gridContainer) {
    elements.gridContainer.style.visibility = "hidden";
  }
}

/**
 * Отображение погоды
 * @param {Object} weatherModel - модель данных погоды
 */
export function showWeatherData(weatherModel) {
  showErrorBlock(false);
  showTextBlock(true);

  if (elements.gridContainer) {
    elements.gridContainer.style.visibility = "visible";
  }

  if (elements.cityNameText && weatherModel.location) {
    elements.cityNameText.textContent = weatherModel.location.name;
  }

  fillCell(elements.temperatureValue, weatherModel.temperature, "° C");
  fillCell(elements.feelTemperatureValue, weatherModel.realFeel, "° C");
  fillCell(elements.weatherText, weatherModel.weatherText);
  fillCell(
    elements.pressureValue,
    weatherModel.getPressureInMM(),
    " мм рт. ст.",
  );
  fillCell(elements.windSpeedValue, weatherModel.windSpeed, " км/ч");
  fillCell(elements.uvIndexValue, weatherModel.uvIndex);

  setWeatherIcon(weatherModel.weatherIcon);
  setWindIcon(weatherModel.windDirectionDegrees);
}

/**
 * Заполнение "кубиков" информацией
 * @param {string} className - текст для селектора
 * @param {*} value - значение параметра
 * @param {string} unit - единица измерения
 */
function fillCell(element, value, unit = "") {
  if (element) {
    element.textContent = `${value === undefined || value === null ? "" : value}${unit}`;
  }
}

/**
 * Установка иконки погоды
 * @param {number} iconCode - код иконки погоды
 */
async function setWeatherIcon(iconCode) {
  if (elements.weatherIcon) {
    const img = document.createElement("img");
    img.src = `https://cdn.discover.swiss/icons/weather/ds-weather-${iconCode}.svg`;
    img.width = 64;
    img.height = 64;
    elements.weatherIcon.replaceChildren();
    elements.weatherIcon.append(img);
  }
}

/**
 * Установка иконки ветра
 * @param {number} degrees - градусы направления ветра
 */
function setWindIcon(degrees) {
  if (elements.windDirectionIcon) {
    const div = document.createElement("div");
    div.innerHTML = WIND_ICON_SVG;
    const svg = div.firstElementChild;
    svg.style.transition = "transform 0.3s ease";
    svg.style.transform = `rotate(${degrees}deg)`;
    elements.windDirectionIcon.replaceChildren();
    elements.windDirectionIcon.append(div);
  }
}

/**
 * Управление отображением блока ошибки
 * @param {boolean} show - флаг отображения ошибки
 */
function showErrorBlock(show) {
  if (elements.cityBlockError) {
    elements.cityBlockError.style.display = show ? "flex" : "none";
  }
}

/**
 * Управление отображением текстового блока
 * @param {boolean} show - флаг отображения
 */
function showTextBlock(show) {
  if (elements.cityBlockText) {
    elements.cityBlockText.style.display = show ? "flex" : "none";
  }
}
