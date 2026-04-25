import * as weatherController from "./weatherController";
import * as weatherApi from "./weatherApiService";
import * as locationModel from "./locationModel";
import * as weatherModel from "./weatherModel";
import * as weatherSearchView from "./weatherSearchView";
import * as weatherResultView from "./weatherResultView";
import { bus } from "./eventbus.js";

jest.mock("./weatherApiService");
jest.mock("./locationModel");
jest.mock("./weatherModel");
jest.mock("./weatherSearchView");
jest.mock("./weatherResultView");
jest.mock("./eventbus.js", () => ({
  bus: {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
  },
}));

describe("weatherController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    weatherResultView.showWeatherData.mockImplementation(() => {});
    weatherResultView.showError.mockImplementation(() => {});
    weatherSearchView.setSearchType.mockImplementation(() => {});
    weatherSearchView.setCityName.mockImplementation(() => {});
    bus.emit.mockClear();
  });

  describe("initController", () => {
    it("should load saved data from localStorage", () => {
      const savedData = { type: "city", cityName: "Paris" };
      localStorage.setItem("searchData", JSON.stringify(savedData));

      const fetchSpy = jest
        .spyOn(weatherController, "fetchWeather")
        .mockResolvedValue();

      weatherController.initController();

      expect(weatherSearchView.setSearchType).toHaveBeenCalledWith("city");
      expect(weatherSearchView.setCityName).toHaveBeenCalledWith("Paris");

      fetchSpy.mockRestore();
    });

    it("should subscribe to weather:dataNeeded event", () => {
      weatherController.initController();

      expect(bus.on).toHaveBeenCalledWith(
        "weather:dataNeeded",
        expect.any(Function),
      );
    });

    it("should not call fetchWeather when no saved data", () => {
      const fetchSpy = jest.spyOn(weatherController, "fetchWeather");

      weatherController.initController();

      expect(fetchSpy).not.toHaveBeenCalled();

      fetchSpy.mockRestore();
    });
  });

  describe("fetchWeather", () => {
    it("should fetch weather by IP when type is auto", async () => {
      const searchData = { type: "auto" };
      const mockIpLocation = { lat: 40.7, lon: -74.0, city: "New York" };
      const mockLocation = { name: "New York", geo: { lat: 40.7, lng: -74.0 } };
      const mockWeatherData = { temperature: 25 };
      const mockWeather = { temperature: 25, location: mockLocation };

      weatherApi.getLocationByIP.mockResolvedValue(mockIpLocation);
      locationModel.createLocationFromIPData.mockReturnValue(mockLocation);
      weatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      weatherModel.createWeatherModel.mockReturnValue(mockWeather);

      await weatherController.fetchWeather(searchData);

      expect(weatherApi.getLocationByIP).toHaveBeenCalled();
      expect(locationModel.createLocationFromIPData).toHaveBeenCalledWith(
        mockIpLocation,
      );
      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith(40.7, -74.0);
      expect(bus.emit).toHaveBeenCalledWith("weather:dataLoaded", mockWeather);
    });

    it("should fetch weather by city name when type is city", async () => {
      const searchData = { type: "city", cityName: "Tokyo" };
      const mockCityGeo = { lat: 35.68, lon: 139.76 };
      const mockLocation = { name: "Tokyo", geo: { lat: 35.68, lng: 139.76 } };
      const mockWeatherData = { temperature: 18 };
      const mockWeather = { temperature: 18, location: mockLocation };

      weatherApi.getLocationByCity.mockResolvedValue(mockCityGeo);
      locationModel.createLocationFromGeoData.mockReturnValue(mockLocation);
      weatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      weatherModel.createWeatherModel.mockReturnValue(mockWeather);

      await weatherController.fetchWeather(searchData);

      expect(weatherApi.getLocationByCity).toHaveBeenCalledWith("Tokyo");
      expect(locationModel.createLocationFromGeoData).toHaveBeenCalledWith(
        mockCityGeo,
      );
      expect(bus.emit).toHaveBeenCalledWith("weather:dataLoaded", mockWeather);
    });

    it("should emit loadingStart before fetching", async () => {
      const searchData = { type: "auto" };
      weatherApi.getLocationByIP.mockResolvedValue({});
      weatherApi.getCurrentWeather.mockResolvedValue({});
      locationModel.createLocationFromIPData.mockReturnValue({});
      weatherModel.createWeatherModel.mockReturnValue({});

      await weatherController.fetchWeather(searchData);

      expect(bus.emit).toHaveBeenCalledWith("weather:loadingStart");
      expect(bus.emit).toHaveBeenCalledWith("weather:loadingEnd");
    });

    it("should emit error when API call fails", async () => {
      const searchData = { type: "city", cityName: "InvalidCity" };
      weatherApi.getLocationByCity.mockRejectedValue(
        new Error("City not found"),
      );

      await weatherController.fetchWeather(searchData);

      expect(bus.emit).toHaveBeenCalledWith("weather:error", "City not found");
      expect(bus.emit).toHaveBeenCalledWith("weather:loadingEnd");
    });

    it("should emit error for unknown location type", async () => {
      const searchData = { type: "unknown" };

      await weatherController.fetchWeather(searchData);

      expect(bus.emit).toHaveBeenCalledWith(
        "weather:error",
        "Неизвестный тип локации",
      );
    });

    it("should save search data to localStorage on success", async () => {
      const searchData = { type: "city", cityName: "Paris" };
      const mockCityGeo = { lat: 48.85, lon: 2.35 };
      const mockLocation = { name: "Paris", geo: { lat: 48.85, lng: 2.35 } };
      const mockWeatherData = { temperature: 20 };
      const mockWeather = { temperature: 20, location: mockLocation };

      weatherApi.getLocationByCity.mockResolvedValue(mockCityGeo);
      locationModel.createLocationFromGeoData.mockReturnValue(mockLocation);
      weatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      weatherModel.createWeatherModel.mockReturnValue(mockWeather);

      await weatherController.fetchWeather(searchData);

      const savedData = JSON.parse(localStorage.getItem("searchData"));
      expect(savedData).toEqual(searchData);
    });
  });
});
