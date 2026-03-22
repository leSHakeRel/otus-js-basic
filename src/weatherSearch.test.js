import { getWeatherSearchUI } from "./weatherSearch";

describe("weatherSearch", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("getWeatherSearchUI", () => {
    test("должен создать UI структуру", () => {
      getWeatherSearchUI(container);

      const section = container.querySelector(".search");
      expect(section).toBeTruthy();
      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("h1").textContent).toBe("Прогноз погоды");
      expect(container.querySelector("#locationForm")).toBeTruthy();
      expect(container.querySelector('input[type="submit"]')).toBeTruthy();
    });

    test("должен создать radio кнопки для выбора типа поиска", () => {
      getWeatherSearchUI(container);

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio).toBeTruthy();
      expect(cityRadio).toBeTruthy();
      expect(ipRadio.getAttribute("value")).toBe("auto");
      expect(cityRadio.getAttribute("value")).toBe("city");
    });

    test("должен создать поле ввода для названия города", () => {
      getWeatherSearchUI(container);

      const cityNameInput = container.querySelector(".cityNameInput");
      expect(cityNameInput).toBeTruthy();
      expect(cityNameInput.getAttribute("placeholder")).toBe(
        "Поиск погоды по городу",
      );
      expect(cityNameInput.getAttribute("name")).toBe("cityName");
    });

    test("должен скрывать поле ввода города при выборе поиска по IP", () => {
      getWeatherSearchUI(container);

      const cityNameInput = container.querySelector(".cityNameInput");
      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      const changeEvent = new Event("change");

      ipRadio.dispatchEvent(changeEvent);

      expect(cityNameInput.style.display).toBe("none");

      cityRadio.checked = true;
      cityRadio.dispatchEvent(changeEvent);
      expect(cityNameInput.style.display).toBe("block");

      ipRadio.checked = true;
      ipRadio.dispatchEvent(changeEvent);
      expect(cityNameInput.style.display).toBe("none");
    });

    test("должен показывать поле ввода города при выборе поиска по городу", () => {
      getWeatherSearchUI(container);

      const cityNameInput = container.querySelector(".cityNameInput");
      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");
      const changeEvent = new Event("change");

      ipRadio.dispatchEvent(changeEvent);
      expect(cityNameInput.style.display).toBe("none");

      cityRadio.checked = true;
      cityRadio.dispatchEvent(changeEvent);

      expect(cityNameInput.style.display).toBe("block");
    });

    test("должен добавлять обработчики событий на radio кнопки", () => {
      const addEventListenerSpy = jest.spyOn(
        HTMLElement.prototype,
        "addEventListener",
      );

      getWeatherSearchUI(container);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);

      addEventListenerSpy.mockRestore();
    });

    test("должен вывести предупреждение при передаче null", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI(null);

      expect(consoleSpy).toHaveBeenCalledWith("element null is not object");
      consoleSpy.mockRestore();
    });

    test("должен вывести предупреждение при передаче undefined", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI(undefined);

      expect(consoleSpy).toHaveBeenCalledWith(
        "element undefined is not object",
      );
      consoleSpy.mockRestore();
    });

    test("должен вывести предупреждение при передаче примитива", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI("string");

      expect(consoleSpy).toHaveBeenCalledWith("element string is not object");
      consoleSpy.mockRestore();
    });

    test("должен вывести предупреждение при передаче числа", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI(123);

      expect(consoleSpy).toHaveBeenCalledWith("element 123 is not object");
      consoleSpy.mockRestore();
    });

    test("должен корректно работать с пустым элементом", () => {
      const emptyDiv = document.createElement("div");

      getWeatherSearchUI(emptyDiv);

      expect(emptyDiv.querySelector(".search")).toBeTruthy();
      expect(emptyDiv.querySelector("#locationForm")).toBeTruthy();
    });

    test("должен обрабатывать несколько вызовов на одном элементе", () => {
      getWeatherSearchUI(container);
      getWeatherSearchUI(container);

      const sections = container.querySelectorAll(".search");
      expect(sections.length).toBe(2);

      const forms = container.querySelectorAll("#locationForm");
      expect(forms.length).toBe(2);
    });

    test("должен корректно переключать видимость поля ввода при нескольких переключениях", () => {
      getWeatherSearchUI(container);

      const cityNameInput = container.querySelector(".cityNameInput");
      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");
      const changeEvent = new Event("change");

      const states = [];

      ipRadio.dispatchEvent(changeEvent);
      states.push(cityNameInput.style.display);

      cityRadio.checked = true;
      cityRadio.dispatchEvent(changeEvent);
      states.push(cityNameInput.style.display);

      ipRadio.checked = true;
      ipRadio.dispatchEvent(changeEvent);
      states.push(cityNameInput.style.display);

      cityRadio.checked = true;
      cityRadio.dispatchEvent(changeEvent);
      states.push(cityNameInput.style.display);

      expect(states).toEqual(["none", "block", "none", "block"]);
    });

    test("должен вывести предупреждение при передаче объекта без метода append", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      const invalidElement = { notAnElement: true };

      getWeatherSearchUI(invalidElement);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("должен вывести предупреждение при передаче объекта без метода append и не выбросить ошибку", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      const invalidElement = {};

      expect(() => getWeatherSearchUI(invalidElement)).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
