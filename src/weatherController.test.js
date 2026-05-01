// weatherController.test.js
import * as weatherController from "./weatherController.js";
import * as weatherApi from "./weatherApiService.js";
import * as locationModel from "./locationModel.js";
import * as weatherModel from "./weatherModel.js";
import * as weatherSearchView from "./weatherSearchView.js";
import * as weatherResultView from "./weatherResultView.js";
import { bus } from "./eventbus.js";
import { router } from "./router.js";
import { weatherStorage } from "./weatherStorageService.js";
import { historyController } from "./weatherSearchHistoryController.js";

// Мокаем все зависимости
jest.mock("./weatherApiService.js");
jest.mock("./locationModel.js");
jest.mock("./weatherModel.js");
jest.mock("./weatherSearchView.js");
jest.mock("./weatherResultView.js");
jest.mock("./eventbus.js");
jest.mock("./router.js");
jest.mock("./weatherStorageService.js");
jest.mock("./weatherSearchHistoryController.js");

describe("weatherController", () => {
  let mockWeatherData;
  let mockLocation;
  let mockWeather;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock data
    mockLocation = {
      name: "Moscow",
      country: "Russia",
      geo: { lat: 55.7558, lng: 37.6173 },
    };

    mockWeatherData = {
      temperature: 22,
      weatherText: "Sunny",
      weatherIcon: 1,
      windSpeed: 15,
      windDirection: "N",
      windDirectionDegrees: 0,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      realFeel: 20,
    };

    mockWeather = {
      ...mockWeatherData,
      location: mockLocation,
      getPressureInMM: jest.fn(() => 760),
    };

    // Setup mock implementations
    weatherApi.getLocationByIP.mockResolvedValue({
      lat: 55.7558,
      lon: 37.6173,
      city: "Moscow",
      country: "Russia",
      timezone: "Europe/Moscow",
    });

    weatherApi.getLocationByCity.mockResolvedValue({
      latitude: 55.7558,
      longitude: 37.6173,
      name: "Moscow",
      country: "Russia",
      timezone: "Europe/Moscow",
    });

    weatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);

    locationModel.createLocationFromIPData.mockReturnValue(mockLocation);
    locationModel.createLocationFromGeoData.mockReturnValue(mockLocation);

    weatherModel.createWeatherModel.mockReturnValue(mockWeather);

    weatherStorage.getSearchHistory.mockReturnValue([]);
    weatherStorage.getLastCity.mockReturnValue(null);
    weatherStorage.saveSearchHistory.mockImplementation(() => {});
  });

  describe("initController", () => {
    it("should subscribe to weather:dataNeeded event", () => {
      weatherController.initController();

      expect(bus.on).toHaveBeenCalledWith(
        "weather:dataNeeded",
        expect.any(Function),
      );
    });

    it("should load last city from history when no params", async () => {
      router.getCurrentParams.mockReturnValue({});
      weatherStorage.getLastCity.mockReturnValue("London");

      weatherController.initController();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(weatherSearchView.setSearchType).toHaveBeenCalledWith("city");
      expect(weatherSearchView.setCityName).toHaveBeenCalledWith("London");
    });

    it("should use auto detection when no params and no history", async () => {
      router.getCurrentParams.mockReturnValue({});
      weatherStorage.getLastCity.mockReturnValue(null);

      weatherController.initController();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(weatherSearchView.setSearchType).toHaveBeenCalledWith("auto");
    });
  });

  describe("fetchWeather", () => {
    it("should fetch weather by IP when type is auto", async () => {
      const searchData = { type: "auto" };

      await weatherController.fetchWeather(searchData);

      expect(weatherApi.getLocationByIP).toHaveBeenCalled();
      expect(weatherApi.getCurrentWeather).toHaveBeenCalled();
      expect(locationModel.createLocationFromIPData).toHaveBeenCalled();
      expect(weatherModel.createWeatherModel).toHaveBeenCalled();
      expect(bus.emit).toHaveBeenCalledWith("weather:dataLoaded", mockWeather);
      expect(bus.emit).toHaveBeenCalledWith("weather:loadingEnd");
    });

    it("should show loading start and end events", async () => {
      const searchData = { type: "auto" };

      await weatherController.fetchWeather(searchData);

      expect(bus.emit).toHaveBeenCalledWith("weather:loadingStart");
      expect(bus.emit).toHaveBeenCalledWith("weather:loadingEnd");
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("API Error");
      weatherApi.getLocationByIP.mockRejectedValue(error);

      const searchData = { type: "auto" };

      await weatherController.fetchWeather(searchData);

      expect(bus.emit).toHaveBeenCalledWith("weather:error", "API Error");
      expect(bus.emit).toHaveBeenCalledWith("weather:loadingEnd");
    });

    it("should handle unknown search type", async () => {
      const searchData = { type: "unknown" };

      await weatherController.fetchWeather(searchData);

      expect(bus.emit).toHaveBeenCalledWith(
        "weather:error",
        "Неизвестный тип локации",
      );
      expect(bus.emit).toHaveBeenCalledWith("weather:loadingEnd");
    });
  });

  describe("getCurrentWeather", () => {
    it("should return current weather after fetch", async () => {
      const searchData = { type: "auto" };

      await weatherController.fetchWeather(searchData);
      const result = weatherController.getCurrentWeather();

      expect(result).toEqual(mockWeather);
    });
  });
});
