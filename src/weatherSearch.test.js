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
    test("should create UI structure", () => {
      getWeatherSearchUI(container);

      const section = container.querySelector(".search");
      expect(section).toBeTruthy();
      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("h1").textContent).toBe("Прогноз погоды");
      expect(container.querySelector("#locationForm")).toBeTruthy();
      expect(container.querySelector('input[type="submit"]')).toBeTruthy();
    });

    test("should create radio buttons for search type selection", () => {
      getWeatherSearchUI(container);

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio).toBeTruthy();
      expect(cityRadio).toBeTruthy();
      expect(ipRadio.getAttribute("value")).toBe("auto");
      expect(cityRadio.getAttribute("value")).toBe("city");
    });

    test("should create input field for city name", () => {
      getWeatherSearchUI(container);

      const cityNameInput = container.querySelector(".cityNameInput");
      expect(cityNameInput).toBeTruthy();
      expect(cityNameInput.getAttribute("placeholder")).toBe(
        "Поиск погоды по городу",
      );
      expect(cityNameInput.getAttribute("name")).toBe("cityName");
    });

    test("should hide city input field when IP search is selected", () => {
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

    test("should show city input field when city search is selected", () => {
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

    test("should add event listeners to radio buttons", () => {
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

    test("should log warning when passing null", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI(null);

      expect(consoleSpy).toHaveBeenCalledWith("element null is not object");
      consoleSpy.mockRestore();
    });

    test("should log warning when passing undefined", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI(undefined);

      expect(consoleSpy).toHaveBeenCalledWith(
        "element undefined is not object",
      );
      consoleSpy.mockRestore();
    });

    test("should log warning when passing primitive", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI("string");

      expect(consoleSpy).toHaveBeenCalledWith("element string is not object");
      consoleSpy.mockRestore();
    });

    test("should log warning when passing number", () => {
      const consoleSpy = jest.spyOn(console, "warn");

      getWeatherSearchUI(123);

      expect(consoleSpy).toHaveBeenCalledWith("element 123 is not object");
      consoleSpy.mockRestore();
    });

    test("should work correctly with empty element", () => {
      const emptyDiv = document.createElement("div");

      getWeatherSearchUI(emptyDiv);

      expect(emptyDiv.querySelector(".search")).toBeTruthy();
      expect(emptyDiv.querySelector("#locationForm")).toBeTruthy();
    });

    test("should handle multiple calls on the same element", () => {
      getWeatherSearchUI(container);
      getWeatherSearchUI(container);

      const sections = container.querySelectorAll(".search");
      expect(sections.length).toBe(2);

      const forms = container.querySelectorAll("#locationForm");
      expect(forms.length).toBe(2);
    });

    test("should correctly toggle input field visibility with multiple toggles", () => {
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

    test("should log warning when passing object without append method", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      const invalidElement = { notAnElement: true };

      getWeatherSearchUI(invalidElement);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("should log warning when passing object without append method and not throw error", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      const invalidElement = {};

      expect(() => getWeatherSearchUI(invalidElement)).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
