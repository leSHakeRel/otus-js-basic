// weatherSearchView.test.js
import {
  renderWeatherSearch,
  setCityName,
  setSearchType,
} from "./weatherSearchView.js";

// Мокаем eventbus ДО импорта модуля
jest.mock("./eventbus.js", () => ({
  bus: {
    emit: jest.fn(),
    on: jest.fn(),
  },
}));

// Импортируем bus после мока
import { bus } from "./eventbus.js";

// Мокаем CSS
jest.mock("./weatherSearch.css", () => ({}));

describe("weatherSearchView", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  describe("renderWeatherSearch", () => {
    it("should render search form with title", () => {
      renderWeatherSearch(container);

      const title = container.querySelector("h1");
      expect(title).toBeTruthy();
      expect(title.textContent).toBe("Прогноз погоды");
    });

    it("should render form with location selector", () => {
      renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      expect(form).toBeTruthy();

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");
      expect(ipRadio).toBeTruthy();
      expect(cityRadio).toBeTruthy();
    });

    it("should have IP search checked by default", () => {
      renderWeatherSearch(container);

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio.checked).toBe(true);
      expect(cityRadio.checked).toBe(false);
    });

    it("should render city name input field", () => {
      renderWeatherSearch(container);

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput).toBeTruthy();
      expect(cityInput.placeholder).toBe("Поиск погоды по городу");
    });

    it("should render submit button", () => {
      renderWeatherSearch(container);

      const submitButton = container.querySelector('input[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton.value).toBe("Поиск");
    });

    it("should hide city input initially when IP search is default", () => {
      renderWeatherSearch(container);

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.style.display).toBe("none");
    });

    it("should subscribe to weather:addCity event", () => {
      renderWeatherSearch(container);

      expect(bus.on).toHaveBeenCalledWith(
        "weather:addCity",
        expect.any(Function),
      );
    });
  });

  describe("form submission", () => {
    it("should emit search:submit event with search data when form is submitted with IP search", () => {
      renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const ipRadio = container.querySelector("#ipSearch");
      ipRadio.checked = true;

      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );

      expect(bus.emit).toHaveBeenCalledWith("search:submit", {
        type: "auto",
        cityName: "",
      });
    });

    it("should emit search:submit event with city name when city search is selected", () => {
      renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const cityRadio = container.querySelector("#cityNameSearch");
      const cityInput = container.querySelector(".cityNameInput");

      cityRadio.checked = true;
      cityInput.value = "Moscow";

      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );

      expect(bus.emit).toHaveBeenCalledWith("search:submit", {
        type: "city",
        cityName: "Moscow",
      });
    });

    it("should prevent default form submission", () => {
      renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const event = new Event("submit", { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");

      form.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      preventDefaultSpy.mockRestore();
    });
  });

  describe("city input visibility toggle", () => {
    it("should show city input when city radio is selected", () => {
      renderWeatherSearch(container);

      const cityRadio = container.querySelector("#cityNameSearch");
      const cityInput = container.querySelector(".cityNameInput");

      // Устанавливаем checked в true перед диспатчем события
      cityRadio.checked = true;
      cityRadio.dispatchEvent(new Event("change"));

      expect(cityInput.style.display).toBe("block");
    });

    it("should hide city input when IP radio is selected", () => {
      renderWeatherSearch(container);

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");
      const cityInput = container.querySelector(".cityNameInput");

      // Сначала показываем поле ввода
      cityRadio.checked = true;
      cityRadio.dispatchEvent(new Event("change"));
      expect(cityInput.style.display).toBe("block");

      // Затем скрываем
      ipRadio.checked = true;
      ipRadio.dispatchEvent(new Event("change"));
      expect(cityInput.style.display).toBe("none");
    });
  });

  describe("weather:addCity event handling", () => {
    it("should set city name when weather:addCity event is emitted", () => {
      renderWeatherSearch(container);

      // Получаем колбек, который был передан в bus.on
      const onCallback = bus.on.mock.calls.find(
        (call) => call[0] === "weather:addCity",
      )[1];

      // Вызываем колбек с городом
      onCallback("Moscow");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.value).toBe("Moscow");
    });

    it("should handle empty city name from event", () => {
      renderWeatherSearch(container);

      const onCallback = bus.on.mock.calls.find(
        (call) => call[0] === "weather:addCity",
      )[1];

      onCallback("");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.value).toBe("");
    });
  });

  describe("setCityName", () => {
    it("should set city input value", () => {
      renderWeatherSearch(container);

      setCityName("Moscow");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.value).toBe("Moscow");
    });

    it("should handle empty value", () => {
      renderWeatherSearch(container);

      setCityName("");

      const cityInput = container.querySelector(".cityNameInput");
      expect(cityInput.value).toBe("");
    });
  });

  describe("setSearchType", () => {
    it("should set search type to auto", () => {
      renderWeatherSearch(container);

      setSearchType("auto");

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio.checked).toBe(true);
      expect(cityRadio.checked).toBe(false);
    });

    it("should set search type to city", () => {
      renderWeatherSearch(container);

      setSearchType("city");

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio.checked).toBe(false);
      expect(cityRadio.checked).toBe(true);
    });

    it("should toggle city input visibility when setting search type to city", () => {
      renderWeatherSearch(container);

      const cityInput = container.querySelector(".cityNameInput");
      // По умолчанию display = 'none'
      expect(cityInput.style.display).toBe("none");

      setSearchType("city");

      expect(cityInput.style.display).toBe("block");
    });

    it("should toggle city input visibility when setting search type to auto", () => {
      renderWeatherSearch(container);

      const cityInput = container.querySelector(".cityNameInput");

      // Сначала устанавливаем city
      setSearchType("city");
      expect(cityInput.style.display).toBe("block");

      // Затем устанавливаем auto
      setSearchType("auto");
      expect(cityInput.style.display).toBe("none");
    });
  });

  describe("multiple form submissions", () => {
    it("should emit event each time form is submitted", () => {
      renderWeatherSearch(container);

      const form = container.querySelector("#locationForm");
      const ipRadio = container.querySelector("#ipSearch");
      ipRadio.checked = true;

      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );

      expect(bus.emit).toHaveBeenCalledTimes(3);
      expect(bus.emit).toHaveBeenCalledWith("search:submit", {
        type: "auto",
        cityName: "",
      });
    });
  });
});
