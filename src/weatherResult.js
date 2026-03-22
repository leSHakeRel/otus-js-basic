import "./weatherResult.css";
import { displayWeatherWithIcon, displayWindIcon } from "./weatherApi.js";

/**
 * Добавление UI для отображения погоды
 * @param {HTMLElement} element - модифицируемый элемент
 */
export function getWeatherResultUI(element) {
  if (typeof element !== "object" || element === null) {
    console.warn(`element ${element} is not object`);
    return;
  }
  element.innerHTML = `
    <section class='resultSection'>
        <div class='resultSection-cityName'>
            <div class='cityName-block-text'>
                <p class='cityName-text'></p>
            </div>
            <div class='cityName-block-error'>
                <p class='cityName-error'>error text</p>
            </div>
        </div>
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
    </section>
    `;
}

/**
 * Заполнение "кубиков" информацией
 * @param {string} className - текст для селектора
 * @param {*} value - значение параметра
 * @param {string} unit - единица измерения
 * @returns
 */
function fillCell(className, value, unit = "") {
  if (className === undefined) return;
  const cell = document.querySelector(className);
  cell.innerHTML = `${value === undefined || value === null ? "" : value}${unit}`;
}

/**
 * Установка текста для лейблов
 * @param {string} className - текст для селектора
 * @param {string} message - текст сообщения
 */
function setLabelText(className, message) {
  const element = document.querySelector(className);
  element.textContent = message === undefined || message == null ? "" : message;
}

/**
 * Управление label с ошибкой
 * @param {string} className - текст для селектора
 * @param {boolean} show - отображать или скрыть label с текстом ошибки
 */
function toggleLabel(className, show) {
  const errorElement = document.querySelector(className);
  errorElement.style.display = show ? "flex" : "none";
}

/**
 * Вставка данных о прогнозе погоды
 * @param {object} weatherData - Данные о погоде
 */
export async function setWeatherData(weatherData) {
  if (weatherData.status === false) {
    toggleLabel(".cityName-block-text", false);
    toggleLabel(".cityName-block-error", true, weatherData.message);
    setLabelText(".cityName-error", weatherData.message);
    const gridElement = document.querySelector(".grid-container");
    gridElement.style.visibility = "hidden";
    return;
  }
  //   console.log(JSON.stringify(weatherData));

  const gridElement = document.querySelector(".grid-container");
  gridElement.style.visibility = "visible";
  const weather = weatherData.weather.weather;

  toggleLabel(".cityName-block-error", false);
  toggleLabel(
    ".cityName-block-text",
    true,
    weatherData.weather.location.queryCityName,
  );

  setLabelText(".cityName-text", weatherData.weather.location.queryCityName);

  fillCell(".temperatureValue", weather.temperature, "° C");
  fillCell(".feelTemperatureValue", weather.realFeel, "° C");
  fillCell(".weatherText", weather.weatherText);

  fillCell(".pressureValue", Math.round(weather.pressure * 0.7506), " мм р.с.");
  fillCell(".windSpeedValue", weather.windSpeed, " км/ч");
  //   fillCell(".windDirectionValue", weather.windDirection);
  fillCell(".uvIndexValue", weather.uvIndex);

  const icon = await displayWeatherWithIcon(weather.weatherIcon);
  const iconElement = document.querySelector(".weatherIcon");
  iconElement.replaceChildren();
  iconElement.append(icon);

  const windIcon = await displayWindIcon(weather.Wind.Direction.Degrees);
  const windDirectionIcon = document.querySelector(".windDirectionIcon");
  windDirectionIcon.replaceChildren();
  windDirectionIcon.append(windIcon);
}
