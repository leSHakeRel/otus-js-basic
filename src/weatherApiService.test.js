import * as weatherApi from "./weatherApiService";

global.fetch = jest.fn();

describe("weatherApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPublicIP", () => {
    it("should return IP address on success", async () => {
      const mockResponse = { ip: "8.8.8.8" };
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await weatherApi.getPublicIP();

      expect(result).toBe("8.8.8.8");
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("ipify.org"));
    });

    it("should throw error when response is not ok", async () => {
      fetch.mockResolvedValue({ ok: false });

      await expect(weatherApi.getPublicIP()).rejects.toThrow(
        "Ошибка получения IP-адреса",
      );
    });
  });

  describe("getLocationByIP", () => {
    it("should return location data on success", async () => {
      const mockIp = "8.8.8.8";
      const mockLocationData = {
        status: "success",
        lat: 37.7749,
        lon: -122.4194,
        city: "San Francisco",
        country: "US",
        timezone: "America/Los_Angeles",
      };

      jest.spyOn(weatherApi, "getPublicIP").mockResolvedValue(mockIp);
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLocationData),
      });

      const result = await weatherApi.getLocationByIP();

      expect(result).toEqual({
        lat: 37.7749,
        lon: -122.4194,
        city: "San Francisco",
        country: "US",
        timezone: "America/Los_Angeles",
      });
    });

    it("should throw error when location status is not success", async () => {
      jest.spyOn(weatherApi, "getPublicIP").mockResolvedValue("1.1.1.1");
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: "fail" }),
      });

      await expect(weatherApi.getLocationByIP()).rejects.toThrow(
        "Не удалось определить локацию по IP",
      );
    });
  });

  describe("getLocationByCity", () => {
    it("should return city data on success", async () => {
      const mockCityData = {
        results: [{ id: 1, name: "London", latitude: 51.5, longitude: -0.1 }],
      };
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCityData),
      });

      const result = await weatherApi.getLocationByCity("London");

      expect(result).toEqual(mockCityData.results[0]);
    });

    it("should throw error when city not found", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ results: [] }),
      });

      await expect(weatherApi.getLocationByCity("Nowhere")).rejects.toThrow(
        'Город "Nowhere" не найден',
      );
    });
  });

  describe("getCurrentWeather", () => {
    it("should return formatted weather data", async () => {
      const mockWeatherData = {
        current_weather: {
          temperature: 22.5,
          windspeed: 10.3,
          winddirection: 180,
          weathercode: 0,
        },
        hourly: {
          pressure_msl: [1013],
          visibility: [10000],
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockWeatherData),
      });

      const result = await weatherApi.getCurrentWeather(51.5, -0.1);

      expect(result.temperature).toBe(23);
      expect(result.windSpeed).toBe(10);
      expect(result.weatherText).toBe("Ясно");
    });

    it("should throw error when no current weather data", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(weatherApi.getCurrentWeather(0, 0)).rejects.toThrow(
        "Данные о погоде не найдены",
      );
    });
  });
});
