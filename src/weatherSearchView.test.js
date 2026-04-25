import * as weatherSearchView from "./weatherSearchView";
import { bus } from "./eventbus.js";

jest.mock("./eventbus.js", () => ({
  bus: {
    emit: jest.fn(),
  },
}));

describe("weatherSearchView", () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
    bus.emit.mockClear();
  });

  describe("renderWeatherSearch", () => {
    it("should render search form with title", () => {
      weatherSearchView.renderWeatherSearch(container);

      const heading = container.querySelector("h1");
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("Прогноз погоды");
    });

    it("should render form with location selector", () => {
      weatherSearchView.renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      expect(form).toBeTruthy();

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio).toBeTruthy();
      expect(cityRadio).toBeTruthy();
    });

    it("should have IP search checked by default", () => {
      weatherSearchView.renderWeatherSearch(container);

      const ipRadio = container.querySelector("#ipSearch");
      expect(ipRadio.checked).toBe(true);

      const cityRadio = container.querySelector("#cityNameSearch");
      expect(cityRadio.checked).toBe(false);
    });

    it("should render city name input field", () => {
      weatherSearchView.renderWeatherSearch(container);

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput).toBeTruthy();
      expect(cityInput.placeholder).toBe("Поиск погоды по городу");
    });

    it("should render submit button", () => {
      weatherSearchView.renderWeatherSearch(container);

      const submitButton = container.querySelector("input[type='submit']");
      expect(submitButton).toBeTruthy();
      expect(submitButton.value).toBe("Поиск");
    });

    it("should hide city input initially when IP search is default", () => {
      weatherSearchView.renderWeatherSearch(container);

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.style.display).toBe("none");
    });
  });

  describe("form submission", () => {
    it("should emit search:submit event with search data when form is submitted with IP search", () => {
      weatherSearchView.renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const ipRadio = container.querySelector("#ipSearch");
      ipRadio.checked = true;

      const submitEvent = new Event("submit", { bubbles: true });
      form.dispatchEvent(submitEvent);

      expect(bus.emit).toHaveBeenCalledWith("search:submit", {
        type: "auto",
        cityName: "",
      });
    });

    it("should emit search:submit event with city name when city search is selected", () => {
      weatherSearchView.renderWeatherSearch(container);

      const cityRadio = container.querySelector("#cityNameSearch");
      cityRadio.checked = true;

      const cityInput = container.querySelector(".cityNameInput");
      cityInput.value = "Moscow";

      const form = container.querySelector("#locationForm");
      const submitEvent = new Event("submit", { bubbles: true });
      form.dispatchEvent(submitEvent);

      expect(bus.emit).toHaveBeenCalledWith("search:submit", {
        type: "city",
        cityName: "Moscow",
      });
    });

    it("should prevent default form submission", () => {
      weatherSearchView.renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const preventDefaultSpy = jest.fn();

      const submitEvent = new Event("submit", { bubbles: true });
      submitEvent.preventDefault = preventDefaultSpy;
      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("city input visibility toggle", () => {
    it("should show city input when city radio is selected", () => {
      weatherSearchView.renderWeatherSearch(container);

      const cityRadio = container.querySelector("#cityNameSearch");
      const cityInput = container.querySelector(".cityNameInput");

      cityRadio.dispatchEvent(new Event("change"));

      expect(cityInput.style.display).toBe("none");
    });

    it("should hide city input when IP radio is selected", () => {
      weatherSearchView.renderWeatherSearch(container);

      const ipRadio = container.querySelector("#ipSearch");
      const cityInput = container.querySelector(".cityNameInput");

      cityInput.style.display = "block";
      ipRadio.dispatchEvent(new Event("change"));

      expect(cityInput.style.display).toBe("none");
    });
  });

  describe("setCityName", () => {
    it("should set city input value", () => {
      weatherSearchView.renderWeatherSearch(container);

      weatherSearchView.setCityName("Paris");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.value).toBe("Paris");
    });

    it("should do nothing if city input doesn't exist", () => {
      expect(() => weatherSearchView.setCityName("Paris")).not.toThrow();
    });
  });

  describe("setSearchType", () => {
    it("should set search type to auto", () => {
      weatherSearchView.renderWeatherSearch(container);

      weatherSearchView.setSearchType("auto");

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio.checked).toBe(true);
      expect(cityRadio.checked).toBe(false);
    });

    it("should set search type to city", () => {
      weatherSearchView.renderWeatherSearch(container);

      weatherSearchView.setSearchType("city");

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio.checked).toBe(false);
      expect(cityRadio.checked).toBe(true);
    });

    it("should toggle city input visibility when setting search type to city", () => {
      weatherSearchView.renderWeatherSearch(container);

      weatherSearchView.setSearchType("city");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.style.display).toBe("block");
    });

    it("should toggle city input visibility when setting search type to auto", () => {
      weatherSearchView.renderWeatherSearch(container);

      weatherSearchView.setSearchType("city");
      weatherSearchView.setSearchType("auto");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.style.display).toBe("none");
    });

    it("should do nothing if radio buttons don't exist", () => {
      expect(() => weatherSearchView.setSearchType("auto")).not.toThrow();
    });
  });

  describe("multiple form submissions", () => {
    it("should emit event each time form is submitted", () => {
      weatherSearchView.renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const submitEvent = new Event("submit", { bubbles: true });

      form.dispatchEvent(submitEvent);
      form.dispatchEvent(submitEvent);
      form.dispatchEvent(submitEvent);

      expect(bus.emit).toHaveBeenCalledTimes(3);
    });
  });
});
