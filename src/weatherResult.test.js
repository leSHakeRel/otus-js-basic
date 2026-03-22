import { getWeatherResultUI, setWeatherData } from "./weatherResult";
import { displayWeatherWithIcon, displayWindIcon } from "./weatherApi";

jest.mock("./weatherApi", () => ({
  displayWeatherWithIcon: jest.fn(),
  displayWindIcon: jest.fn(),
}));

describe("weatherResult", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    jest.clearAllMocks();

    const mockImg = document.createElement("img");
    displayWeatherWithIcon.mockResolvedValue(mockImg);

    const mockWindDiv = document.createElement("div");
    displayWindIcon.mockResolvedValue(mockWindDiv);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("getWeatherResultUI", () => {
    test("должен создать UI структуру", () => {
      getWeatherResultUI(container);

      const resultSection = container.querySelector(".resultSection");
      expect(resultSection).toBeTruthy();
      expect(container.querySelector(".grid-container")).toBeTruthy();
      expect(container.querySelector(".temperatureValue")).toBeTruthy();
      expect(container.querySelector(".feelTemperatureValue")).toBeTruthy();
      expect(container.querySelector(".pressureValue")).toBeTruthy();
      expect(container.querySelector(".windSpeedValue")).toBeTruthy();
      expect(container.querySelector(".uvIndexValue")).toBeTruthy();
      expect(container.querySelector(".weatherIcon")).toBeTruthy();
    });

    test("должен вывести предупреждение при неверном элементе", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      getWeatherResultUI(null);
      expect(consoleSpy).toHaveBeenCalledWith("element null is not object");
      consoleSpy.mockRestore();
    });

    test("должен вывести предупреждение при undefined элементе", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      getWeatherResultUI(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(
        "element undefined is not object",
      );
      consoleSpy.mockRestore();
    });

    test("должен вывести предупреждение при строковом элементе", () => {
      const consoleSpy = jest.spyOn(console, "warn");
      getWeatherResultUI("not an object");
      expect(consoleSpy).toHaveBeenCalledWith(
        "element not an object is not object",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("setWeatherData", () => {
    beforeEach(() => {
      getWeatherResultUI(container);
    });

    test("должен отобразить данные о погоде при успешном запросе", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: 20,
            realFeel: 19,
            weatherText: "Sunny",
            pressure: 1013,
            windSpeed: 10,
            uvIndex: 5,
            weatherIcon: 1,
            Wind: { Direction: { Degrees: 180 } },
          },
          location: {
            queryCityName: "Moscow",
          },
        },
      };

      await setWeatherData(weatherData);

      const cityNameText = document.querySelector(".cityName-text");
      expect(cityNameText.textContent).toBe("Moscow");

      const temperatureValue = document.querySelector(".temperatureValue");
      expect(temperatureValue.innerHTML).toBe("20° C");

      const feelTempValue = document.querySelector(".feelTemperatureValue");
      expect(feelTempValue.innerHTML).toBe("19° C");

      const weatherText = document.querySelector(".weatherText");
      expect(weatherText.textContent).toBe("Sunny");

      const gridContainer = document.querySelector(".grid-container");
      expect(gridContainer.style.visibility).toBe("visible");
    });

    test("должен отобразить ошибку при неудачном запросе", async () => {
      const weatherData = {
        status: false,
        message: "City not found",
      };

      await setWeatherData(weatherData);

      const errorElement = document.querySelector(".cityName-error");
      expect(errorElement.textContent).toBe("City not found");

      const errorBlock = document.querySelector(".cityName-block-error");
      expect(errorBlock.style.display).toBe("flex");

      const textBlock = document.querySelector(".cityName-block-text");
      expect(textBlock.style.display).toBe("none");

      const gridContainer = document.querySelector(".grid-container");
      expect(gridContainer.style.visibility).toBe("hidden");
    });

    test("должен корректно конвертировать давление", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: 20,
            realFeel: 19,
            weatherText: "Sunny",
            pressure: 1013,
            windSpeed: 10,
            uvIndex: 5,
            weatherIcon: 1,
            Wind: { Direction: { Degrees: 180 } },
          },
          location: {
            queryCityName: "Moscow",
          },
        },
      };

      await setWeatherData(weatherData);

      const pressureValue = document.querySelector(".pressureValue");
      expect(pressureValue.innerHTML).toContain("760");
    });

    test("должен обработать отсутствующие значения", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: null,
            realFeel: undefined,
            weatherText: "",
            pressure: null,
            windSpeed: null,
            uvIndex: null,
            weatherIcon: null,
            Wind: { Direction: { Degrees: null } },
          },
          location: {
            queryCityName: "Moscow",
          },
        },
      };

      await setWeatherData(weatherData);

      const temperatureValue = document.querySelector(".temperatureValue");
      expect(temperatureValue.innerHTML).toBe("° C");

      const feelTempValue = document.querySelector(".feelTemperatureValue");
      expect(feelTempValue.innerHTML).toBe("° C");

      const pressureValue = document.querySelector(".pressureValue");
      expect(pressureValue.innerHTML).toBe("0 мм р.с.");

      const windSpeedValue = document.querySelector(".windSpeedValue");
      expect(windSpeedValue.innerHTML).toBe(" км/ч");

      const uvIndexValue = document.querySelector(".uvIndexValue");
      expect(uvIndexValue.innerHTML).toBe("");
    });

    test("должен вызвать displayWeatherWithIcon с правильным кодом иконки", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: 20,
            realFeel: 19,
            weatherText: "Sunny",
            pressure: 1013,
            windSpeed: 10,
            uvIndex: 5,
            weatherIcon: 42,
            Wind: { Direction: { Degrees: 180 } },
          },
          location: {
            queryCityName: "Moscow",
          },
        },
      };

      await setWeatherData(weatherData);

      expect(displayWeatherWithIcon).toHaveBeenCalledWith(42);
    });

    test("должен вызвать displayWindIcon с правильным направлением", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: 20,
            realFeel: 19,
            weatherText: "Sunny",
            pressure: 1013,
            windSpeed: 10,
            uvIndex: 5,
            weatherIcon: 1,
            Wind: { Direction: { Degrees: 270 } },
          },
          location: {
            queryCityName: "Moscow",
          },
        },
      };

      await setWeatherData(weatherData);

      expect(displayWindIcon).toHaveBeenCalledWith(270);
    });

    test("должен обработать данные без направления ветра", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: 20,
            realFeel: 19,
            weatherText: "Sunny",
            pressure: 1013,
            windSpeed: 10,
            uvIndex: 5,
            weatherIcon: 1,
            Wind: { Direction: { Degrees: null } },
          },
          location: {
            queryCityName: "Moscow",
          },
        },
      };

      await setWeatherData(weatherData);

      expect(displayWindIcon).toHaveBeenCalledWith(null);
    });

    test("должен обработать отрицательную температуру", async () => {
      const weatherData = {
        status: true,
        weather: {
          weather: {
            temperature: -15,
            realFeel: -18,
            weatherText: "Freezing",
            pressure: 1020,
            windSpeed: 25,
            uvIndex: 1,
            weatherIcon: 7,
            Wind: { Direction: { Degrees: 45 } },
          },
          location: {
            queryCityName: "Murmansk",
          },
        },
      };

      await setWeatherData(weatherData);

      const temperatureValue = document.querySelector(".temperatureValue");
      expect(temperatureValue.innerHTML).toBe("-15° C");

      const feelTempValue = document.querySelector(".feelTemperatureValue");
      expect(feelTempValue.innerHTML).toBe("-18° C");
    });
  });
});
