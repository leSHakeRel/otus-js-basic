import * as weatherResultView from "./weatherResultView";
import { addElement } from "./view.js";

jest.mock("./view.js");

describe("weatherResultView", () => {
  let container;
  let mockWeatherModel;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);

    addElement.mockImplementation(
      (container, elementName, content, className) => {
        const element = document.createElement(elementName);
        if (content) element.textContent = content;
        if (className) {
          if (typeof className === "string") {
            element.classList.add(className);
          } else if (Array.isArray(className)) {
            element.classList.add(...className);
          }
        }
        container.appendChild(element);
        return element;
      },
    );

    mockWeatherModel = {
      status: true,
      message: "",
      temperature: 25,
      weatherText: "Sunny",
      weatherIcon: 1,
      windSpeed: 15,
      windDirection: "N",
      windDirectionDegrees: 90,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      realFeel: 24,
      location: { name: "London" },
      getPressureInMM: jest.fn().mockReturnValue(760),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("renderWeatherResult", () => {
    it("should create result section with required elements", () => {
      weatherResultView.renderWeatherResult(container);

      const resultSection = container.querySelector(".resultSection");
      expect(resultSection).toBeTruthy();

      const cityNameDiv = resultSection.querySelector(
        ".resultSection-cityName",
      );
      expect(cityNameDiv).toBeTruthy();

      const gridContainer = resultSection.querySelector(".grid-container");
      expect(gridContainer).toBeTruthy();
    });

    it("should create city name text and error blocks", () => {
      weatherResultView.renderWeatherResult(container);

      const cityNameText = document.querySelector(".cityName-text");
      const cityNameError = document.querySelector(".cityName-error");

      expect(cityNameText).toBeTruthy();
      expect(cityNameError).toBeTruthy();
    });

    it("should create grid items for weather data", () => {
      weatherResultView.renderWeatherResult(container);

      const gridItems = document.querySelectorAll(".grid-item");
      expect(gridItems.length).toBeGreaterThan(0);

      const temperatureCell = document.querySelector(".temperatureCell");
      expect(temperatureCell).toBeTruthy();
    });
  });

  describe("showLoading", () => {
    it("should hide grid container and show text block", () => {
      weatherResultView.renderWeatherResult(container);

      const gridContainer = document.querySelector(".grid-container");
      gridContainer.style.visibility = "visible";

      weatherResultView.showLoading();

      expect(gridContainer.style.visibility).toBe("hidden");
    });
  });

  describe("showError", () => {
    it("should display error message and hide grid", () => {
      weatherResultView.renderWeatherResult(container);

      const errorMessage = "City not found";
      weatherResultView.showError(errorMessage);

      const errorElement = document.querySelector(".cityName-error");
      expect(errorElement.textContent).toBe(errorMessage);

      const gridContainer = document.querySelector(".grid-container");
      expect(gridContainer.style.visibility).toBe("hidden");
    });
  });

  describe("showWeatherData", () => {
    it("should display city name from weather model", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const cityNameElement = document.querySelector(".cityName-text");
      expect(cityNameElement.textContent).toBe("London");
    });

    it("should display temperature value", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const temperatureElement = document.querySelector(".temperatureValue");
      expect(temperatureElement.textContent).toBe("25° C");
    });

    it("should display feels like temperature", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const feelTempElement = document.querySelector(".feelTemperatureValue");
      expect(feelTempElement.textContent).toBe("24° C");
    });

    it("should display weather text", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const weatherTextElement = document.querySelector(".weatherText");
      expect(weatherTextElement.textContent).toBe("Sunny");
    });

    it("should display pressure with correct unit", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const pressureElement = document.querySelector(".pressureValue");
      expect(pressureElement.textContent).toBe("760 мм рт. ст.");
      expect(mockWeatherModel.getPressureInMM).toHaveBeenCalled();
    });

    it("should display wind speed with unit", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const windSpeedElement = document.querySelector(".windSpeedValue");
      expect(windSpeedElement.textContent).toBe("15 км/ч");
    });

    it("should display UV index", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const uvIndexElement = document.querySelector(".uvIndexValue");
      expect(uvIndexElement.textContent).toBe("5");
    });

    it("should make grid container visible", () => {
      weatherResultView.renderWeatherResult(container);

      const gridContainer = document.querySelector(".grid-container");
      gridContainer.style.visibility = "hidden";

      weatherResultView.showWeatherData(mockWeatherModel);

      expect(gridContainer.style.visibility).toBe("visible");
    });
  });

  describe("wind icon rotation", () => {
    it("should rotate wind icon according to degrees", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const windIconContainer = document.querySelector(".windDirectionIcon");
      expect(windIconContainer).toBeTruthy();

      const svg = windIconContainer.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg.style.transform).toBe("rotate(90deg)");
    });
  });

  describe("error and text block visibility", () => {
    it("should show error block and hide text block when error occurs", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showError("Test error");

      const cityBlockError = document.querySelector(".cityName-block-error");
      const cityBlockText = document.querySelector(".cityName-block-text");

      expect(cityBlockError.style.display).toBe("flex");
      expect(cityBlockText.style.display).toBe("none");
    });

    it("should show text block and hide error block when weather data is shown", () => {
      weatherResultView.renderWeatherResult(container);

      weatherResultView.showWeatherData(mockWeatherModel);

      const cityBlockError = document.querySelector(".cityName-block-error");
      const cityBlockText = document.querySelector(".cityName-block-text");

      expect(cityBlockError.style.display).toBe("none");
      expect(cityBlockText.style.display).toBe("flex");
    });
  });
});
