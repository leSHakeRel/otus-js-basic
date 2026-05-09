import "./weatherSearch.css";
import { bus } from "./eventbus";

let form: HTMLFormElement | null = null;
let cityNameInput: HTMLInputElement | null = null;
let radios: NodeListOf<HTMLInputElement> | null = null;

/**
 * Рендер UI поиска
 * @param container - контейнер для заполнения виджетом поиска
 * @param onSearchSubmit - колбек на запрос поиска
 */
export function renderWeatherSearch(
  container: HTMLElement,
  onSearchSubmit?: (searchData: SearchData) => void,
): void {
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

  form = sectionElement.querySelector("#locationForm") as HTMLFormElement;
  cityNameInput = sectionElement.querySelector(".cityNameInput") as HTMLInputElement;
  radios = sectionElement.querySelectorAll(`input[type='radio']`);

  toggleCityInput();
  attachEvents();
}

interface SearchData {
  type: "auto" | "city";
  cityName: string;
}

function processSubmit(): void {
  if (!form) return;
  
  const formData = new FormData(form);
  const searchData: SearchData = {
    type: formData.get("searchType") as "auto" | "city",
    cityName: formData.get("cityName") as string,
  };

  bus.emit("search:submit", searchData);
}

/**
 * Подписка на события
 */
function attachEvents(): void {
  if (!radios) return;
  
  radios.forEach((radio) => radio.addEventListener("change", toggleCityInput));

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      processSubmit();
    });
  }
  
  bus.on("weather:addCity", setCityName);
}

/**
 * Показать/скрыть поле ввода города
 */
function toggleCityInput(): void {
  const isCitySelected = (document.querySelector("#cityNameSearch") as HTMLInputElement)?.checked;
  if (cityNameInput) {
    cityNameInput.style.display = isCitySelected ? "block" : "none";
  }
}

/**
 * Установка значения города
 * @param value - название города
 */
export function setCityName(value: string): void {
  if (cityNameInput) {
    cityNameInput.value = value;
  }
}

/**
 * Установка типа поиска
 * @param type - тип поиска
 */
export function setSearchType(type: "auto" | "city"): void {
  const autoRadio = document.querySelector("#ipSearch") as HTMLInputElement;
  const cityRadio = document.querySelector("#cityNameSearch") as HTMLInputElement;

  if (type === "auto" && autoRadio) {
    autoRadio.checked = true;
  } else if (type === "city" && cityRadio) {
    cityRadio.checked = true;
  }
  toggleCityInput();
}
