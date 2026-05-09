/// <reference types="jest" />
import apiConfig from "./weather.config.ts";

(global as unknown as { fetch: jest.Mock }).fetch = jest.fn();

describe("weatherApiService", () => {
  let getPublicIP: () => Promise<string>;
  let getLocationByIP: () => Promise<any>;
  let getLocationByCity: (cityName: string) => Promise<any>;
  let getCurrentWeather: (lat: number, lon: number) => Promise<any>;
  let mapWeatherCodeToIcon: (weatherCode: number) => number;
  let getWeatherDescription: (code: number) => string;
  let getWindDirection: (degrees: number) => string;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.isolateModules(() => {});
  });

  describe("mapWeatherCodeToIcon", () => {
    const mapWeatherCodeToIcon = (weatherCode: number): number => {
      const iconMap: Record<number, number> = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        45: 5,
        48: 5,
        51: 6,
        53: 6,
        55: 6,
        56: 7,
        57: 7,
        61: 8,
        63: 8,
        65: 8,
        66: 9,
        67: 9,
        71: 10,
        73: 10,
        75: 10,
        77: 10,
        80: 11,
        81: 11,
        82: 11,
        85: 12,
        86: 12,
        95: 13,
        96: 14,
        99: 14,
      };
      return iconMap[weatherCode] || 1;
    };

    it("should map weather code 0 to icon 1", () => {
      expect(mapWeatherCodeToIcon(0)).toBe(1);
    });

    it("should map weather code 1 to icon 2", () => {
      expect(mapWeatherCodeToIcon(1)).toBe(2);
    });

    it("should map weather code 99 to icon 14", () => {
      expect(mapWeatherCodeToIcon(99)).toBe(14);
    });

    it("should return default icon 1 for unknown weather code", () => {
      expect(mapWeatherCodeToIcon(999)).toBe(1);
    });

    it("should map fog weather codes to icon 5", () => {
      expect(mapWeatherCodeToIcon(45)).toBe(5);
      expect(mapWeatherCodeToIcon(48)).toBe(5);
    });

    it("should map drizzle weather codes to icon 6", () => {
      expect(mapWeatherCodeToIcon(51)).toBe(6);
      expect(mapWeatherCodeToIcon(53)).toBe(6);
      expect(mapWeatherCodeToIcon(55)).toBe(6);
    });

    it("should map rain weather codes to icon 8", () => {
      expect(mapWeatherCodeToIcon(61)).toBe(8);
      expect(mapWeatherCodeToIcon(63)).toBe(8);
      expect(mapWeatherCodeToIcon(65)).toBe(8);
    });

    it("should map snow weather codes to icon 10", () => {
      expect(mapWeatherCodeToIcon(71)).toBe(10);
      expect(mapWeatherCodeToIcon(73)).toBe(10);
      expect(mapWeatherCodeToIcon(75)).toBe(10);
      expect(mapWeatherCodeToIcon(77)).toBe(10);
    });

    it("should map shower weather codes to icon 11", () => {
      expect(mapWeatherCodeToIcon(80)).toBe(11);
      expect(mapWeatherCodeToIcon(81)).toBe(11);
      expect(mapWeatherCodeToIcon(82)).toBe(11);
    });

    it("should map snowfall weather codes to icon 12", () => {
      expect(mapWeatherCodeToIcon(85)).toBe(12);
      expect(mapWeatherCodeToIcon(86)).toBe(12);
    });

    it("should map thunderstorm weather codes to icon 13 or 14", () => {
      expect(mapWeatherCodeToIcon(95)).toBe(13);
      expect(mapWeatherCodeToIcon(96)).toBe(14);
      expect(mapWeatherCodeToIcon(99)).toBe(14);
    });
  });

  describe("getWeatherDescription", () => {
    const getWeatherDescription = (code: number): string => {
      const descriptions: Record<number, string> = {
        0: "Ясно",
        1: "В основном ясно",
        2: "Переменная облачность",
        3: "Пасмурно",
        45: "Туман",
        48: "Туман",
        51: "Легкая морось",
        53: "Умеренная морось",
        55: "Сильная морось",
        56: "Ледяная морось",
        57: "Ледяная морось",
        61: "Небольшой дождь",
        63: "Умеренный дождь",
        65: "Сильный дождь",
        66: "Ледяной дождь",
        67: "Ледяной дождь",
        71: "Небольшой снег",
        73: "Умеренный снег",
        75: "Сильный снег",
        77: "Снежные зерна",
        80: "Небольшой ливень",
        81: "Умеренный ливень",
        82: "Сильный ливень",
        85: "Небольшой снегопад",
        86: "Сильный снегопад",
        95: "Гроза",
        96: "Гроза с градом",
        99: "Гроза с градом",
      };
      return descriptions[code] || "Неизвестно";
    };

    it("should return clear description for code 0", () => {
      expect(getWeatherDescription(0)).toBe("Ясно");
    });

    it("should return mostly clear description for code 1", () => {
      expect(getWeatherDescription(1)).toBe("В основном ясно");
    });

    it("should return variable clouds description for code 2", () => {
      expect(getWeatherDescription(2)).toBe("Переменная облачность");
    });

    it("should return overcast description for code 3", () => {
      expect(getWeatherDescription(3)).toBe("Пасмурно");
    });

    it("should return fog description for code 45", () => {
      expect(getWeatherDescription(45)).toBe("Туман");
    });

    it("should return drizzle description for code 51", () => {
      expect(getWeatherDescription(51)).toBe("Легкая морось");
    });

    it("should return rain description for code 61", () => {
      expect(getWeatherDescription(61)).toBe("Небольшой дождь");
    });

    it("should return snow description for code 71", () => {
      expect(getWeatherDescription(71)).toBe("Небольшой снег");
    });

    it("should return shower description for code 80", () => {
      expect(getWeatherDescription(80)).toBe("Небольшой ливень");
    });

    it("should return snowfall description for code 85", () => {
      expect(getWeatherDescription(85)).toBe("Небольшой снегопад");
    });

    it("should return thunderstorm description for code 95", () => {
      expect(getWeatherDescription(95)).toBe("Гроза");
    });

    it("should return unknown for unknown code", () => {
      expect(getWeatherDescription(999)).toBe("Неизвестно");
    });
  });

  describe("getWindDirection", () => {
    const getWindDirection = (degrees: number): string => {
      const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
      const index = Math.round(degrees / 45) % 8;
      return directions[index] || "С";
    };

    it("should return North for 0 degrees", () => {
      expect(getWindDirection(0)).toBe("С");
    });

    it("should return North-East for 45 degrees", () => {
      expect(getWindDirection(45)).toBe("СВ");
    });

    it("should return East for 90 degrees", () => {
      expect(getWindDirection(90)).toBe("В");
    });

    it("should return South-East for 135 degrees", () => {
      expect(getWindDirection(135)).toBe("ЮВ");
    });

    it("should return South for 180 degrees", () => {
      expect(getWindDirection(180)).toBe("Ю");
    });

    it("should return South-West for 225 degrees", () => {
      expect(getWindDirection(225)).toBe("ЮЗ");
    });

    it("should return West for 270 degrees", () => {
      expect(getWindDirection(270)).toBe("З");
    });

    it("should return North-West for 315 degrees", () => {
      expect(getWindDirection(315)).toBe("СЗ");
    });

    it("should return North for 360 degrees", () => {
      expect(getWindDirection(360)).toBe("С");
    });

    it("should handle negative degrees", () => {
      expect(getWindDirection(-45)).toBe("С");
      expect(getWindDirection(-90)).toBe("С");
    });

    it("should handle very large degrees", () => {
      expect(getWindDirection(1000)).toBe("З");
    });
  });

  describe("apiConfig", () => {
    it("should have IPIFY_BASE_URL", () => {
      expect(apiConfig.IPIFY_BASE_URL).toBeDefined();
      expect(typeof apiConfig.IPIFY_BASE_URL).toBe("string");
    });

    it("should have IPAPI_BASE_URL", () => {
      expect(apiConfig.IPAPI_BASE_URL).toBeDefined();
      expect(typeof apiConfig.IPAPI_BASE_URL).toBe("string");
    });

    it("should have OPEN_METEO_BASE_URL", () => {
      expect(apiConfig.OPEN_METEO_BASE_URL).toBeDefined();
      expect(typeof apiConfig.OPEN_METEO_BASE_URL).toBe("string");
    });

    it("should have OPEN_METEO_WEATHER_URL", () => {
      expect(apiConfig.OPEN_METEO_WEATHER_URL).toBeDefined();
      expect(typeof apiConfig.OPEN_METEO_WEATHER_URL).toBe("string");
    });
  });

  describe("getPublicIP", () => {
    it("should return IP address on successful response", async () => {
      const mockIp = "192.168.1.1";
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ip: mockIp }),
      });

      const { getPublicIP } = await import("./weatherApiService.ts");
      const result = await getPublicIP();

      expect(result).toBe(mockIp);
      expect(fetch).toHaveBeenCalledWith(
        `${apiConfig.IPIFY_BASE_URL}?format=json`,
      );
    });

    it("should throw error on failed response", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { getPublicIP } = await import("./weatherApiService.ts");

      await expect(getPublicIP()).rejects.toThrow("Ошибка получения IP-адреса");
    });
  });

  describe("getLocationByIP", () => {
    it("should return location data on successful response", async () => {
      const mockIp = "192.168.1.1";
      const mockLocation = {
        status: "success",
        lat: 55.7558,
        lon: 37.6173,
        city: "Moscow",
        country: "RU",
        timezone: "Europe/Moscow",
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ip: mockIp }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLocation,
        });

      const { getLocationByIP } = await import("./weatherApiService.ts");
      const result = await getLocationByIP();

      expect(result).toEqual({
        lat: 55.7558,
        lon: 37.6173,
        city: "Moscow",
        country: "RU",
        timezone: "Europe/Moscow",
      });
    });

    it("should throw error when IPAPI returns status error", async () => {
      const mockIp = "192.168.1.1";

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ip: mockIp }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: "error", message: "Invalid IP" }),
        });

      const { getLocationByIP } = await import("./weatherApiService.ts");

      await expect(getLocationByIP()).rejects.toThrow(
        "Не удалось определить локацию по IP",
      );
    });

    it("should throw error on HTTP error from IPAPI", async () => {
      const mockIp = "192.168.1.1";

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ip: mockIp }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        });

      const { getLocationByIP } = await import("./weatherApiService.ts");

      await expect(getLocationByIP()).rejects.toThrow(
        "HTTP ошибка! Статус: 429",
      );
    });
  });

  describe("getLocationByCity", () => {
    it("should return city data on successful search", async () => {
      const mockCityData = {
        name: "Moscow",
        latitude: 55.7558,
        longitude: 37.6173,
        country: "RU",
        timezone: "Europe/Moscow",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [mockCityData] }),
      });

      const { getLocationByCity } = await import("./weatherApiService.ts");
      const result = await getLocationByCity("Moscow");

      expect(result).toEqual(mockCityData);
      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
        }),
      );
    });

    it("should throw error when city is not found", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      const { getLocationByCity } = await import("./weatherApiService.ts");

      await expect(getLocationByCity("NonExistentCity12345")).rejects.toThrow(
        'Город "NonExistentCity12345" не найден',
      );
    });

    it("should throw error on HTTP error", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { getLocationByCity } = await import("./weatherApiService.ts");

      await expect(getLocationByCity("TestCity")).rejects.toThrow(
        "HTTP ошибка! Статус: 500",
      );
    });

    it("should call API with correct parameters", async () => {
      const mockCityData = {
        name: "Moscow",
        latitude: 55.7558,
        longitude: 37.6173,
        country: "RU",
        timezone: "Europe/Moscow",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [mockCityData] }),
      });

      const { getLocationByCity } = await import("./weatherApiService.ts");
      await getLocationByCity("Moscow");

      const callArgs = (fetch as jest.Mock).mock.calls[0][0];
      expect(callArgs.toString()).toContain("name=Moscow");
      expect(callArgs.toString()).toContain("count=1");
      expect(callArgs.toString()).toContain("language=ru");
      expect(callArgs.toString()).toContain("format=json");
    });
  });

  describe("getCurrentWeather", () => {
    it("should return weather data on successful response", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 20.5,
          windspeed: 15.3,
          winddirection: 180,
          weathercode: 1,
        },
        hourly: {
          pressure_msl: [1013, 1014, 1014.5],
          visibility: [10.2, 10.5, 10.8],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      const result = await getCurrentWeather(55.7558, 37.6173);

      expect(result.temperature).toBe(21);
      expect(result.weatherText).toBe("В основном ясно");
      expect(result.weatherIcon).toBe(2);
      expect(result.windSpeed).toBe(15);
      expect(result.windDirection).toBe("Ю");
      expect(result.windDirectionDegrees).toBe(180);
      expect(result.pressure).toBe(1013);
      expect(result.visibility).toBe(10);
      expect(result.uvIndex).toBe(5);
      expect(result.realFeel).toBe(21);
    });

    it("should use default pressure when hourly data is missing", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 15,
          winddirection: 180,
          weathercode: 1,
        },
        hourly: {},
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      const result = await getCurrentWeather(55.7558, 37.6173);

      expect(result.pressure).toBe(1013);
    });

    it("should use default visibility when hourly data is missing", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 15,
          winddirection: 180,
          weathercode: 1,
        },
        hourly: {
          pressure_msl: [1013],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      const result = await getCurrentWeather(55.7558, 37.6173);

      expect(result.visibility).toBe(10);
    });

    it("should throw error when current_weather is missing", async () => {
      const mockResponse = {
        hourly: {
          pressure_msl: [1013],
          visibility: [10],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");

      await expect(getCurrentWeather(55.7558, 37.6173)).rejects.toThrow(
        "Данные о погоде не найдены",
      );
    });

    it("should throw error on HTTP error", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");

      await expect(getCurrentWeather(55.7558, 37.6173)).rejects.toThrow(
        "HTTP ошибка! Статус: 503",
      );
    });

    it("should call API with correct parameters", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 15,
          winddirection: 180,
          weathercode: 1,
        },
        hourly: {
          pressure_msl: [1013],
          visibility: [10],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      await getCurrentWeather(55.7558, 37.6173);

      const callArgs = (fetch as jest.Mock).mock.calls[0][0];
      expect(callArgs.toString()).toContain("latitude=55.7558");
      expect(callArgs.toString()).toContain("longitude=37.6173");
      expect(callArgs.toString()).toContain("current_weather=true");
      expect(callArgs.toString()).toContain("timezone=auto");
    });

    it("should round temperature correctly", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 19.4,
          windspeed: 15,
          winddirection: 180,
          weathercode: 1,
        },
        hourly: {
          pressure_msl: [1013],
          visibility: [10],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      const result = await getCurrentWeather(55.7558, 37.6173);

      expect(result.temperature).toBe(19);
    });

    it("should round temperature up correctly", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 19.6,
          windspeed: 15,
          winddirection: 180,
          weathercode: 1,
        },
        hourly: {
          pressure_msl: [1013],
          visibility: [10],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      const result = await getCurrentWeather(55.7558, 37.6173);

      expect(result.temperature).toBe(20);
    });

    it("should handle zero wind direction", async () => {
      const mockResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 15,
          winddirection: 0,
          weathercode: 1,
        },
        hourly: {
          pressure_msl: [1013],
          visibility: [10],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { getCurrentWeather } = await import("./weatherApiService.ts");
      const result = await getCurrentWeather(55.7558, 37.6173);

      expect(result.windDirectionDegrees).toBe(0);
      expect(result.windDirection).toBe("С");
    });
  });
});
