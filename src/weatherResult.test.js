import { getWeatherResultUI, setWeatherData } from "./weatherResult";
import { displayWeatherWithIcon, displayWindIcon } from "./weatherApi";

jest.mock("./weatherApi", () => ({
  displayWeatherWithIcon: jest.fn(),
  displayWindIcon: jest.fn(),
}));

jest.mock("./weatherResult.css", () => ({}), { virtual: true });

describe("weatherResult", () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = "";
    element = document.createElement("div");
    jest.clearAllMocks();
  });

  describe("getWeatherResultUI", () => {
    test("should create weather result UI structure", () => {
      getWeatherResultUI(element);

      expect(element.querySelector(".grid-container")).toBeTruthy();
      expect(element.querySelector(".temperatureCell")).toBeTruthy();
      expect(element.querySelector(".temperatureValue")).toBeTruthy();
      expect(element.querySelector(".weatherIcon")).toBeTruthy();
      expect(element.querySelector(".feelTemperatureValue")).toBeTruthy();
      expect(element.querySelector(".pressureValue")).toBeTruthy();
      expect(element.querySelector(".windSpeedValue")).toBeTruthy();
      expect(element.querySelector(".windDirectionIcon")).toBeTruthy();
      expect(element.querySelector(".uvIndexValue")).toBeTruthy();
    });

    test("should log warning when element is not object", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      getWeatherResultUI("not-an-object");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "element not-an-object is not object",
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("setWeatherData", () => {
    beforeEach(() => {
      getWeatherResultUI(element);
      document.body.appendChild(element);
    });

    test("should fill all weather data cells correctly", async () => {
      const mockWeatherData = {
        temperature: 25,
        realFeel: 23,
        weatherText: "Sunny",
        pressure: 1013,
        windSpeed: 5,
        windDirection: "N",
        uvIndex: 4,
        weatherIcon: 1,
        Wind: {
          Direction: {
            Degrees: 90,
          },
        },
      };

      const mockIcon = document.createElement("img");
      displayWeatherWithIcon.mockResolvedValue(mockIcon);

      await setWeatherData(mockWeatherData);

      expect(document.querySelector(".temperatureValue").innerHTML).toBe(
        "25° C",
      );
      expect(document.querySelector(".feelTemperatureValue").innerHTML).toBe(
        "23° C",
      );
      expect(document.querySelector(".weatherText").innerHTML).toBe("Sunny");
      expect(document.querySelector(".pressureValue").innerHTML).toBe(
        "760 мм р.с.",
      );
      expect(document.querySelector(".windSpeedValue").innerHTML).toBe(
        "5 км/ч",
      );
      expect(document.querySelector(".uvIndexValue").innerHTML).toBe("4");

      expect(displayWeatherWithIcon).toHaveBeenCalledWith(1);
      const iconElement = document.querySelector(".weatherIcon");
      expect(iconElement.children[0]).toBe(mockIcon);
    });

    test("should handle missing optional weather data", async () => {
      const mockWeatherData = {
        temperature: 20,
        realFeel: undefined,
        weatherText: "Cloudy",
        pressure: 1010,
        windSpeed: 3,
        windDirection: null,
        uvIndex: undefined,
        weatherIcon: 2,
        Wind: {
          Direction: {
            Degrees: 90,
          },
        },
      };

      const mockIcon = document.createElement("img");
      displayWeatherWithIcon.mockResolvedValue(mockIcon);

      await setWeatherData(mockWeatherData);

      expect(document.querySelector(".feelTemperatureValue").innerHTML).toBe(
        "° C",
      );
      expect(document.querySelector(".uvIndexValue").innerHTML).toBe("");
    });

    test("should clear previous icon before adding new one", async () => {
      const mockIcon1 = document.createElement("img");
      mockIcon1.id = "icon1";
      displayWeatherWithIcon.mockResolvedValueOnce(mockIcon1);

      await setWeatherData({
        temperature: 20,
        weatherText: "Cloudy",
        pressure: 1010,
        windSpeed: 3,
        weatherIcon: 2,
        Wind: {
          Direction: {
            Degrees: 90,
          },
        },
      });

      const iconContainer = document.querySelector(".weatherIcon");
      expect(iconContainer.children.length).toBe(1);
      expect(iconContainer.children[0].id).toBe("icon1");

      const mockIcon2 = document.createElement("img");
      mockIcon2.id = "icon2";
      displayWeatherWithIcon.mockResolvedValueOnce(mockIcon2);

      await setWeatherData({
        temperature: 22,
        weatherText: "Sunny",
        pressure: 1012,
        windSpeed: 4,
        weatherIcon: 3,
        Wind: {
          Direction: {
            Degrees: 90,
          },
        },
      });

      expect(iconContainer.children.length).toBe(1);
      expect(iconContainer.children[0].id).toBe("icon2");
    });
  });
});
