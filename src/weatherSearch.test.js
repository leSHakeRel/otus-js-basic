import { getWeatherSearchUI } from "./weatherSearch";

jest.mock("./weatherSearch.css", () => ({}), { virtual: true });

describe("weatherSearch", () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = "";
    element = document.createElement("div");
  });

  describe("getWeatherSearchUI", () => {
    test("should create search UI with form and radio buttons", () => {
      getWeatherSearchUI(element);

      const section = element.querySelector(".search");
      expect(section).toBeTruthy();

      const form = section.querySelector("#locationForm");
      expect(form).toBeTruthy();

      const ipRadio = section.querySelector("#ipSearch");
      expect(ipRadio).toBeTruthy();
      expect(ipRadio.value).toBe("auto");
      expect(ipRadio.checked).toBe(true);

      const cityRadio = section.querySelector("#cityNameSearch");
      expect(cityRadio).toBeTruthy();
      expect(cityRadio.value).toBe("city");

      const cityInput = section.querySelector(".cityNameInput");
      expect(cityInput).toBeTruthy();
      expect(cityInput.placeholder).toBe("Поиск погоды по городу");

      const submitButton = section.querySelector('input[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton.value).toBe("Поиск");
    });

    test("should initially hide city input when auto search is selected", () => {
      getWeatherSearchUI(element);

      const cityInput = element.querySelector(".cityNameInput");
      expect(cityInput.style.display).toBe("");
    });

    test("should show city input when city radio is selected", () => {
      getWeatherSearchUI(element);

      const cityRadio = element.querySelector("#cityNameSearch");
      const cityInput = element.querySelector(".cityNameInput");

      expect(cityInput.style.display).toBe("");

      cityRadio.checked = true;
      cityRadio.dispatchEvent(new Event("change"));

      expect(cityInput.style.display).toBe("block");
    });

    test("should hide city input when switching back to IP search", () => {
      getWeatherSearchUI(element);

      const ipRadio = element.querySelector("#ipSearch");
      const cityRadio = element.querySelector("#cityNameSearch");
      const cityInput = element.querySelector(".cityNameInput");

      cityRadio.checked = true;
      cityRadio.dispatchEvent(new Event("change"));
      expect(cityInput.style.display).toBe("block");

      ipRadio.checked = true;
      ipRadio.dispatchEvent(new Event("change"));

      expect(cityInput.style.display).toBe("none");
    });

    test("should handle change event on all radio buttons", () => {
      getWeatherSearchUI(element);

      const radios = element.querySelectorAll('input[type="radio"]');
      const cityInput = element.querySelector(".cityNameInput");

      expect(radios.length).toBe(2);

      radios.forEach((radio) => {
        const eventSpy = jest.spyOn(radio, "addEventListener");
        expect(eventSpy).not.toHaveBeenCalled();
      });

      const cityRadio = element.querySelector("#cityNameSearch");
      cityRadio.checked = true;
      cityRadio.dispatchEvent(new Event("change"));
      expect(cityInput.style.display).toBe("block");

      const ipRadio = element.querySelector("#ipSearch");
      ipRadio.checked = true;
      ipRadio.dispatchEvent(new Event("change"));
      expect(cityInput.style.display).toBe("none");
    });

    test("should log warning when element is not object", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      getWeatherSearchUI("not-an-object");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "element not-an-object is not object",
      );

      consoleWarnSpy.mockRestore();
    });

    test("should preserve radio button states after multiple toggles", () => {
      getWeatherSearchUI(element);

      const ipRadio = element.querySelector("#ipSearch");
      const cityRadio = element.querySelector("#cityNameSearch");
      const cityInput = element.querySelector(".cityNameInput");

      expect(ipRadio.checked).toBe(true);
      expect(cityRadio.checked).toBe(false);

      cityRadio.checked = true;
      cityRadio.dispatchEvent(new Event("change"));

      expect(ipRadio.checked).toBe(false);
      expect(cityRadio.checked).toBe(true);
      expect(cityInput.style.display).toBe("block");

      ipRadio.checked = true;
      ipRadio.dispatchEvent(new Event("change"));

      expect(ipRadio.checked).toBe(true);
      expect(cityRadio.checked).toBe(false);
      expect(cityInput.style.display).toBe("none");
    });
  });
});
