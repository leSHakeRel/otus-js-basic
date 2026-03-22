import "./weatherSearch.css";

/**
 * Добавление UI для поиска погоды
 * @param {HTMLElement} element - модифицируемый элемент
 */
export function getWeatherSearchUI(element) {
  if (typeof element === "object" && element !== null) {
    const sectionElement = document.createElement("section");
    sectionElement.classList.add("search");
    sectionElement.innerHTML = `
    <h1>Поиск погоды</h1>
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
    element.append(sectionElement);

    const cityNameInput = sectionElement.querySelector(".cityNameInput");
    const radios = sectionElement.querySelectorAll(`input[type='radio']`);

    const toggleInput = () => {
      cityNameInput.style.display = sectionElement.querySelector(
        "#cityNameSearch",
      ).checked
        ? "block"
        : "none";
    };

    radios.forEach((radio) => radio.addEventListener("change", toggleInput));
  } else {
    console.warn(`element ${element} is not object`);
  }
}
