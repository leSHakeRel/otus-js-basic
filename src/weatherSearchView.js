import "./weatherSearch.css";
import { bus } from "./eventbus.js";

let form = null;
let cityNameInput = null;
let radios = null;

/**
 * Рендер UI поиска
 * @param { HTMLElement } container - контейнер для заполнения виджетом поиска
 * @param {*} onSearchSubmit - колбек на запрос поиска
 */
export function renderWeatherSearch(container) {
  const sectionElement = document.createElement("section");
  sectionElement.classList.add("search");
  sectionElement.innerHTML = `
    <h1>Прогноз погоды</h1>
    <form id='locationForm'>
      <div class='columnFlex options'>
        <div class='rowFlex centeredFlex'>
          <div class='rowFlex'>
            <input type='radio' id='ipSearch' name='searchType' value='auto' checked />
            <label for='ipSearch'>Поиск по IP</label>
          </div>
          <div class='rowFlex'>
            <input type='radio' id='cityNameSearch' name='searchType' value='city' />
            <label for='cityNameSearch'>Поиск названия города</label>
          </div>
        </div>
        <input type='text' name='cityName' placeholder='Поиск погоды по городу' class='cityNameInput'/>
      </div>
      <input type='submit' value='Поиск'/>
    </form>
  `;

  container.append(sectionElement);

  form = sectionElement.querySelector("#locationForm");
  cityNameInput = sectionElement.querySelector(".cityNameInput");
  radios = sectionElement.querySelectorAll(`input[type='radio']`);

  toggleCityInput();
  attachEvents();
}

function processSubmit() {
  const formData = new FormData(form);
  const searchData = {
    type: formData.get("searchType"),
    cityName: formData.get("cityName"),
  };

  bus.emit("search:submit", searchData);
}

/**
 * Подписка на события
 */
function attachEvents() {
  radios.forEach((radio) => radio.addEventListener("change", toggleCityInput));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    processSubmit();
  });
}

/**
 * Показать/скрыть поле ввода города
 */
function toggleCityInput() {
  const isCitySelected = document.querySelector("#cityNameSearch")?.checked;
  if (cityNameInput) {
    cityNameInput.style.display = isCitySelected ? "block" : "none";
  }
}

/**
 * Установка значения города
 * @param { string } value - название города
 */
export function setCityName(value) {
  if (cityNameInput) {
    cityNameInput.value = value;
  }
}

/**
 * Установка типа поиска
 * @param { string } type - тип поиска
 */
export function setSearchType(type) {
  const autoRadio = document.querySelector("#ipSearch");
  const cityRadio = document.querySelector("#cityNameSearch");

  if (type === "auto" && autoRadio) {
    autoRadio.checked = true;
  } else if (type === "city" && cityRadio) {
    cityRadio.checked = true;
  }
  toggleCityInput();
}
