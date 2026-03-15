import { getWeatherData, displayWeatherWithIcon } from "./weatherApi";

global.fetch = jest.fn();

describe("weatherApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWeatherData", () => {
    const mockWeatherResponse = [
      {
        Temperature: { Metric: { Value: 20 } },
        WeatherText: "Sunny",
        WeatherIcon: 1,
        Wind: {
          Speed: { Metric: { Value: 5 } },
          Direction: { Localized: "N" },
        },
        Pressure: { Metric: { Value: 1013 } },
        Visibility: { Metric: { Value: 10 } },
        UVIndex: 3,
        RealFeelTemperature: { Metric: { Value: 22 } },
      },
    ];

    const mockLocationResponse = {
      Key: "12345",
      LocalizedName: "Moscow",
      Country: { LocalizedName: "Russia" },
    };

    test("should get weather data by IP (auto)", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocationResponse,
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      });

      const result = await getWeatherData({ type: "auto", cityName: "" });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.temperature).toBe(20);
      expect(result.weatherText).toBe("Sunny");
    });

    test("should get weather data by city name", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLocationResponse],
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      });

      const result = await getWeatherData({ type: "city", cityName: "London" });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.temperature).toBe(20);
    });

    test("should throw error for invalid location type", async () => {
      await expect(getWeatherData({ type: "invalid" })).rejects.toThrow(
        "undefined location type",
      );
    });

    test("should handle API error in location request", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(getWeatherData({ type: "auto" })).rejects.toThrow(
        "Недействительный API ключ",
      );
    });

    test("should handle empty city search results", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await expect(
        getWeatherData({ type: "city", cityName: "Unknown" }),
      ).rejects.toThrow("Город не найден");
    });

    test("should handle empty weather data", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockLocationResponse],
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await expect(
        getWeatherData({ type: "city", cityName: "Moscow" }),
      ).rejects.toThrow("Данные о погоде не найдены");
    });
  });

  describe("displayWeatherWithIcon", () => {
    test("should create image element with default size", async () => {
      const img = await displayWeatherWithIcon(5);

      expect(img).toBeInstanceOf(HTMLImageElement);
      expect(img.src).toContain("ds-weather-5.svg");
      expect(img.width).toBe(64);
      expect(img.height).toBe(64);
    });

    test("should create image element with custom size", async () => {
      const iconCode = { weatherIconCode: 5, width: 100, height: 100 };
      const img = await displayWeatherWithIcon(iconCode);

      expect(img.width).toBe(100);
      expect(img.height).toBe(100);
    });
  });
});
