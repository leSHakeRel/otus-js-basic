import {
  getWeatherData,
  displayWeatherWithIcon,
  displayWindIcon,
} from "./weatherApi";
import apiConfig from "./weather.config.js";

jest.mock("./weather.config.js", () => ({
  API_KEY: "test-api-key",
  BASE_URL: "https://test-api.com",
}));

global.fetch = jest.fn();

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

global.localStorage = mockLocalStorage;

describe("weatherApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe("getWeatherData", () => {
    test("should successfully get weather by IP", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ip: "127.0.0.1" }),
        }),
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              Key: "12345",
              LocalizedName: "Moscow",
              Country: { LocalizedName: "Russia" },
              GeoPosition: { Latitude: 55.75, Longitude: 37.62 },
              TimeZone: { Name: "Europe/Moscow" },
            }),
        }),
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                Temperature: { Metric: { Value: 15 } },
                WeatherText: "Cloudy",
                WeatherIcon: 5,
                Wind: {
                  Speed: { Metric: { Value: 10 } },
                  Direction: { Localized: "N", Degrees: 0 },
                },
                Pressure: { Metric: { Value: 1013 } },
                Visibility: { Metric: { Value: 10 } },
                UVIndex: 3,
                RealFeelTemperature: { Metric: { Value: 14 } },
              },
            ]),
        }),
      );

      const result = await getWeatherData({ type: "auto" });

      expect(result).toHaveProperty("weather");
      expect(result).toHaveProperty("location");
      expect(result.location.queryCityName).toBe("Moscow");
      expect(result.weather.temperature).toBe(15);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test("should successfully get weather by city name", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                Key: "67890",
                LocalizedName: "London",
                Country: { LocalizedName: "UK" },
                GeoPosition: { Latitude: 51.5, Longitude: -0.13 },
              },
            ]),
        }),
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                Temperature: { Metric: { Value: 12 } },
                WeatherText: "Rainy",
                WeatherIcon: 10,
                Wind: {
                  Speed: { Metric: { Value: 15 } },
                  Direction: { Localized: "NW", Degrees: 315 },
                },
                Pressure: { Metric: { Value: 1008 } },
                Visibility: { Metric: { Value: 8 } },
                UVIndex: 1,
                RealFeelTemperature: { Metric: { Value: 10 } },
              },
            ]),
        }),
      );

      const result = await getWeatherData({ type: "city", cityName: "London" });

      expect(result.location.queryCityName).toBe("London");
      expect(result.location.country).toBe("UK");
      expect(result.weather.temperature).toBe(12);
      expect(result.weather.weatherText).toBe("Rainy");
    });

    test("should throw error for invalid location type", async () => {
      await expect(getWeatherData({ type: "invalid" })).rejects.toThrow(
        "undefined location type",
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should handle API key error", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ip: "127.0.0.1" }),
        }),
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        }),
      );

      await expect(getWeatherData({ type: "auto" })).rejects.toThrow(
        "Недействительный API ключ",
      );
    });

    test("should handle error when searching for non-existent city", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }),
      );

      await expect(
        getWeatherData({ type: "city", cityName: "NonExistentCity" }),
      ).rejects.toThrow("Город <NonExistentCity> не найден");
    });

    test("should handle network error", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error")),
      );

      await expect(getWeatherData({ type: "auto" })).rejects.toThrow(
        "Network error",
      );
    });

    test("should handle empty response from weather API", async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ip: "127.0.0.1" }),
        }),
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              Key: "12345",
              LocalizedName: "Moscow",
              Country: { LocalizedName: "Russia" },
              GeoPosition: { Latitude: 55.75, Longitude: 37.62 },
              TimeZone: { Name: "Europe/Moscow" },
            }),
        }),
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }),
      );

      await expect(getWeatherData({ type: "auto" })).rejects.toThrow(
        "Данные о погоде не найдены",
      );
    });
  });

  describe("displayWeatherWithIcon", () => {
    test("should create img element with correct src", async () => {
      const imgElement = await displayWeatherWithIcon(5);

      expect(imgElement.tagName).toBe("IMG");
      expect(imgElement.src).toContain("ds-weather-5.svg");
      expect(imgElement.width).toBe(64);
      expect(imgElement.height).toBe(64);
    });

    test("should handle object with parameters", async () => {
      const imgElement = await displayWeatherWithIcon({
        weatherIconCode: 10,
        width: 100,
        height: 100,
      });

      expect(imgElement.width).toBe(100);
      expect(imgElement.height).toBe(100);
    });

    test("should use default size values", async () => {
      const imgElement = await displayWeatherWithIcon(15);

      expect(imgElement.width).toBe(64);
      expect(imgElement.height).toBe(64);
    });

    test("should handle undefined", async () => {
      const imgElement = await displayWeatherWithIcon(undefined);

      expect(imgElement.src).toContain("ds-weather-undefined.svg");
    });
  });

  describe("displayWindIcon", () => {
    test("should create div with SVG and correct rotation", async () => {
      const result = await displayWindIcon(45);

      expect(result.tagName).toBe("DIV");
      const svg = result.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg.style.transform).toBe("rotate(45deg)");
      expect(svg.getAttribute("width")).toBe("32");
      expect(svg.getAttribute("height")).toBe("32");
    });

    test("should handle zero wind direction correctly", async () => {
      const result = await displayWindIcon(0);

      const svg = result.querySelector("svg");
      expect(svg.style.transform).toBe("rotate(0deg)");
    });

    test("should handle 360-degree wind direction correctly", async () => {
      const result = await displayWindIcon(360);

      const svg = result.querySelector("svg");
      expect(svg.style.transform).toBe("rotate(360deg)");
    });

    test("should handle negative wind direction", async () => {
      const result = await displayWindIcon(-90);

      const svg = result.querySelector("svg");
      expect(svg.style.transform).toBe("rotate(-90deg)");
    });
  });
});
