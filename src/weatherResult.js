import "./weatherResult.css";
import { displayWeatherWithIcon, displayWindIcon } from "./weatherApi.js";

/**
 * Добавление UI для отображения погоды
 * @param {HTMLElement} element - модифицируемый элемент
 */
export function getWeatherResultUI(element) {
  if (typeof element === "object") {
    element.innerHTML = `
    <div class='grid-container'>
        <div class='grid-item temperatureCell '>
            <div class='cellItem'>
                <p class='weatherIcon'/>
                <p class='weatherText'/>
                <p>Температура</p>
                <p class='temperatureValue'>
            </div>
            
        </div>
        <div class='grid-item'>
            <div class='cellItem'>
                <p>Ощущается</p>
                <p class='feelTemperatureValue'>
            </div>
        </div>
        <div class='grid-item'>
            <div class='cellItem'>
                <p>Давление</p>
                <p class='pressureValue'>
            </div>
        </div>
        <div class='grid-item'>
            <div class='cellItem'>
                <p>Скорость<br>ветра</p>
                <p class='windSpeedValue'>
            </div>
        </div>
        <div class='grid-item'>
            <div class='cellItem'>
                <p>Направл.<br>ветра</p>
                <div class='windDirectionIcon'></div>
            </div>
        </div>
        <div class='grid-item'>
            <div class='cellItem'>
                <p>UV-индекс</p>
                <p class='uvIndexValue'>
            </div>
        </div>
    </div>
    `;
  } else {
    console.warn(`element ${element} is not object`);
  }
}

function fillCell(className, value, unit = "") {
  if (className === undefined) return;
  const cell = document.querySelector(className);
  cell.innerHTML = `${value === undefined || value === null ? "" : value}${unit}`;
}

/**
 *
 * @param {object} weatherData - Данные о погоде
 */
export async function setWeatherData(weatherData) {
  fillCell(".temperatureValue", weatherData.temperature, "° C");
  fillCell(".feelTemperatureValue", weatherData.realFeel, "° C");
  fillCell(".weatherText", weatherData.weatherText);

  fillCell(
    ".pressureValue",
    Math.round(weatherData.pressure * 0.7506),
    " мм р.с.",
  );
  fillCell(".windSpeedValue", weatherData.windSpeed, " км/ч");
  //   fillCell(".windDirectionValue", weatherData.windDirection);
  fillCell(".uvIndexValue", weatherData.uvIndex);

  const icon = await displayWeatherWithIcon(weatherData.weatherIcon);
  const iconElement = document.querySelector(".weatherIcon");
  iconElement.replaceChildren();
  iconElement.append(icon);

  const windIcon = await displayWindIcon(weatherData.Wind.Direction.Degrees);
  const windDirectionIcon = document.querySelector(".windDirectionIcon");
  windDirectionIcon.replaceChildren();
  windDirectionIcon.append(windIcon);
}
