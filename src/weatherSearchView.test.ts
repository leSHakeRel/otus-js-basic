/// <reference types="jest" />
import {
  renderWeatherSearch,
  setCityName,
  setSearchType,
} from "./weatherSearchView.ts";
import { bus } from "./eventbus.ts";

describe("weatherSearchView", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    bus.clear();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("renderWeatherSearch", () => {
    it("should render search form", () => {
      renderWeatherSearch(container);

      expect(container.querySelector("section.search")).toBeTruthy();
      expect(container.querySelector("#locationForm")).toBeTruthy();
    });

    it("should create radio buttons for search type", () => {
      renderWeatherSearch(container);

      const ipRadio = container.querySelector("#ipSearch");
      const cityRadio = container.querySelector("#cityNameSearch");

      expect(ipRadio).toBeTruthy();
      expect(cityRadio).toBeTruthy();
    });

    it("should create city name input", () => {
      renderWeatherSearch(container);

      const cityNameInput = container.querySelector(".cityNameInput");
      expect(cityNameInput).toBeTruthy();
    });

    it("should create submit button", () => {
      renderWeatherSearch(container);

      const submitButton = container.querySelector("input[type='submit']");
      expect(submitButton).toBeTruthy();
    });
  });

  describe("setCityName", () => {
    it("should set city name in input", () => {
      renderWeatherSearch(container);

      setCityName("Moscow");

      const cityNameInput = container.querySelector(
        ".cityNameInput",
      ) as HTMLInputElement;
      expect(cityNameInput.value).toBe("Moscow");
    });

    it("should not set city name if input not found", () => {
      const newContainer = document.createElement("div");
      document.body.appendChild(newContainer);

      setCityName("London");

      expect(newContainer.innerHTML).toBe("");
      document.body.removeChild(newContainer);
    });
  });

  describe("setSearchType", () => {
    it("should set search type to auto", () => {
      renderWeatherSearch(container);

      setSearchType("auto");

      const ipRadio = container.querySelector("#ipSearch") as HTMLInputElement;
      const cityRadio = container.querySelector(
        "#cityNameSearch",
      ) as HTMLInputElement;

      expect(ipRadio.checked).toBe(true);
      expect(cityRadio.checked).toBe(false);
    });

    it("should set search type to city", () => {
      renderWeatherSearch(container);

      setSearchType("city");

      const ipRadio = container.querySelector("#ipSearch") as HTMLInputElement;
      const cityRadio = container.querySelector(
        "#cityNameSearch",
      ) as HTMLInputElement;

      expect(ipRadio.checked).toBe(false);
      expect(cityRadio.checked).toBe(true);
    });

    it("should toggle city input visibility based on search type", () => {
      renderWeatherSearch(container);

      setSearchType("city");
      const cityNameInput = container.querySelector(
        ".cityNameInput",
      ) as HTMLInputElement;
      expect(cityNameInput.style.display).toBe("block");

      setSearchType("auto");
      expect(cityNameInput.style.display).toBe("none");
    });
  });

  describe("form submission", () => {
    it("should emit search:submit event with auto type", () => {
      renderWeatherSearch(container);

      const submitSpy = jest.fn();
      bus.on("search:submit", submitSpy);

      const form = container.querySelector("#locationForm") as HTMLFormElement;
      const submitButton = form.querySelector(
        "input[type='submit']",
      ) as HTMLInputElement;
      submitButton.click();

      expect(submitSpy).toHaveBeenCalledWith({
        type: "auto",
        cityName: "",
      });
    });

    it("should emit search:submit event with city type", () => {
      renderWeatherSearch(container);

      const submitSpy = jest.fn();
      bus.on("search:submit", submitSpy);

      const cityRadio = container.querySelector(
        "#cityNameSearch",
      ) as HTMLInputElement;
      const cityNameInput = container.querySelector(
        ".cityNameInput",
      ) as HTMLInputElement;
      const form = container.querySelector("#locationForm") as HTMLFormElement;

      cityRadio.checked = true;
      cityNameInput.value = "Paris";

      const submitEvent = new Event("submit", { cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(submitSpy).toHaveBeenCalledWith({
        type: "city",
        cityName: "Paris",
      });
    });
  });
});
