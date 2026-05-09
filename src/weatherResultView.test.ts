/// <reference types="jest" />
import {
  renderWeatherResult,
  showLoading,
  showError,
  showWeatherData,
} from "./weatherResultView.ts";
import { bus } from "./eventbus.ts";

describe("weatherResultView", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    bus.clear();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("renderWeatherResult", () => {
    it("should render weather result container", () => {
      renderWeatherResult(container);

      expect(container.querySelector(".resultSection")).toBeTruthy();
      expect(container.querySelector(".grid-container")).toBeTruthy();
    });

    it("should create all required elements", () => {
      renderWeatherResult(container);

      expect(container.querySelector(".cityName-text")).toBeTruthy();
      expect(container.querySelector(".cityName-error")).toBeTruthy();
      expect(container.querySelector(".temperatureCell")).toBeTruthy();
    });
  });

  describe("showLoading", () => {
    it("should hide grid container", () => {
      renderWeatherResult(container);
      const gridContainer = container.querySelector(
        ".grid-container",
      ) as HTMLElement;

      showLoading();

      expect(gridContainer.style.visibility).toBe("hidden");
    });

    it("should show text block", () => {
      renderWeatherResult(container);
      const cityBlockText = container.querySelector(
        ".cityName-block-text",
      ) as HTMLElement;

      showLoading();

      expect(cityBlockText.style.display).toBe("flex");
    });

    it("should hide error block", () => {
      renderWeatherResult(container);
      const cityBlockError = container.querySelector(
        ".cityName-block-error",
      ) as HTMLElement;

      showLoading();

      expect(cityBlockError.style.display).toBe("none");
    });
  });

  describe("showError", () => {
    it("should show error message", () => {
      renderWeatherResult(container);

      showError("Test error message");

      const cityNameError = container.querySelector(
        ".cityName-error",
      ) as HTMLElement;
      expect(cityNameError.textContent).toBe("Test error message");
    });

    it("should hide grid container", () => {
      renderWeatherResult(container);
      const gridContainer = container.querySelector(
        ".grid-container",
      ) as HTMLElement;

      showError("Test error");

      expect(gridContainer.style.visibility).toBe("hidden");
    });

    it("should hide text block", () => {
      renderWeatherResult(container);
      const cityBlockText = container.querySelector(
        ".cityName-block-text",
      ) as HTMLElement;

      showError("Test error");

      expect(cityBlockText.style.display).toBe("none");
    });

    it("should show error block", () => {
      renderWeatherResult(container);
      const cityBlockError = container.querySelector(
        ".cityName-block-error",
      ) as HTMLElement;

      showError("Test error");

      expect(cityBlockError.style.display).toBe("flex");
    });
  });

  describe("showWeatherData", () => {
    const mockWeatherData = {
      temperature: 22,
      weatherText: "Sunny",
      weatherIcon: 1,
      windSpeed: 15,
      windDirection: "N",
      windDirectionDegrees: 0,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      realFeel: 21,
      location: {
        name: "London",
      },
      getPressureInMM: () => 760,
    };

    it("should display city name", () => {
      renderWeatherResult(container);

      showWeatherData(mockWeatherData);

      const cityNameText = container.querySelector(
        ".cityName-text",
      ) as HTMLElement;
      expect(cityNameText.textContent).toBe("London");
    });

    it("should display temperature", () => {
      renderWeatherResult(container);

      showWeatherData(mockWeatherData);

      const temperatureValue = container.querySelector(
        ".temperatureValue",
      ) as HTMLElement;
      expect(temperatureValue.textContent).toContain("22");
    });

    it("should display weather text", () => {
      renderWeatherResult(container);

      showWeatherData(mockWeatherData);

      const weatherText = container.querySelector(
        ".weatherText",
      ) as HTMLElement;
      expect(weatherText.textContent).toBe("Sunny");
    });

    it("should show grid container", () => {
      renderWeatherResult(container);
      const gridContainer = container.querySelector(
        ".grid-container",
      ) as HTMLElement;

      showWeatherData(mockWeatherData);

      expect(gridContainer.style.visibility).toBe("visible");
    });

    it("should show text block", () => {
      renderWeatherResult(container);
      const cityBlockText = container.querySelector(
        ".cityName-block-text",
      ) as HTMLElement;

      showWeatherData(mockWeatherData);

      expect(cityBlockText.style.display).toBe("flex");
    });

    it("should hide error block", () => {
      renderWeatherResult(container);
      const cityBlockError = container.querySelector(
        ".cityName-block-error",
      ) as HTMLElement;

      showWeatherData(mockWeatherData);

      expect(cityBlockError.style.display).toBe("none");
    });
  });
});
