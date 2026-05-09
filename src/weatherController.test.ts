/// <reference types="jest" />
import { initController, fetchWeather, getCurrentWeather, resetControllerState } from "./weatherController.ts";
import { bus } from "./eventbus.ts";

jest.mock("./weatherApiService.ts", () => ({
  getLocationByIP: jest.fn(),
  getLocationByCity: jest.fn(),
  getCurrentWeather: jest.fn(),
}));

jest.mock("./locationModel.ts", () => ({
  createLocationFromIPData: jest.fn(),
  createLocationFromGeoData: jest.fn(),
}));

jest.mock("./weatherModel.ts", () => ({
  createWeatherModel: jest.fn(),
}));

jest.mock("./weatherSearchView.ts", () => ({
  setSearchType: jest.fn(),
  setCityName: jest.fn(),
}));

jest.mock("./weatherStorageService.ts", () => ({
  weatherStorage: {
    getLastCity: jest.fn(),
    addToHistory: jest.fn(),
  },
}));

jest.mock("./router.ts", () => ({
  router: {
    getCurrentParams: jest.fn(),
  },
}));

describe("weatherController", () => {
  const mockWeatherApi = jest.requireMock("./weatherApiService.ts");
  const mockLocationModel = jest.requireMock("./locationModel.ts");
  const mockWeatherModel = jest.requireMock("./weatherModel.ts");
  const mockWeatherSearchView = jest.requireMock("./weatherSearchView.ts");
  const mockWeatherStorage = jest.requireMock("./weatherStorageService.ts").weatherStorage;
  const mockRouter = jest.requireMock("./router.ts").router;
  const mockBus = jest.requireMock("./eventbus.ts").bus;

  beforeEach(() => {
    bus.clear();
    jest.clearAllMocks();
    resetControllerState();
  });

  describe("initController", () => {
    it("should initialize controller and setup event listeners", () => {
      initController();

      expect(mockWeatherStorage.getLastCity).not.toHaveBeenCalled();
    });

    it("should setup weather:dataNeeded event listener", () => {
      const mockWeather = { temperature: 20 };
      mockWeatherModel.createWeatherModel.mockReturnValue(mockWeather);

      initController();

      bus.emit("weather:dataNeeded");
    });
  });

  describe("fetchWeather", () => {
    it("should fetch weather for auto location type", async () => {
      const mockIpLocation = {
        lat: 51.5074,
        lon: -0.1278,
        city: "London",
        country: "UK",
        timezone: "Europe/London",
      };
      const mockLocation = {
        key: "51.5074,-0.1278",
        name: "London",
        geo: { lat: 51.5074, lng: -0.1278 },
      };
      const mockWeatherData = {
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
      };
      const mockWeather = { ...mockWeatherData, location: mockLocation };

      mockWeatherApi.getLocationByIP.mockResolvedValue(mockIpLocation);
      mockLocationModel.createLocationFromIPData.mockReturnValue(mockLocation);
      mockWeatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      mockWeatherModel.createWeatherModel.mockReturnValue(mockWeather);

      await fetchWeather({ type: "auto" });

      expect(mockWeatherApi.getLocationByIP).toHaveBeenCalled();
      expect(mockWeatherApi.getCurrentWeather).toHaveBeenCalledWith(51.5074, -0.1278);
    });

    it("should fetch weather for city location type", async () => {
      const mockCityGeoData = {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "France",
        timezone: "Europe/Paris",
      };
      const mockLocation = {
        key: "48.8566,2.3522",
        name: "Paris",
        geo: { lat: 48.8566, lng: 2.3522 },
      };
      const mockWeatherData = {
        temperature: 20,
        weatherText: "Sunny",
        weatherIcon: 1,
        windSpeed: 5,
        windDirection: "N",
        windDirectionDegrees: 0,
        pressure: 1015,
        visibility: 10,
        uvIndex: 5,
        realFeel: 20,
      };
      const mockWeather = { ...mockWeatherData, location: mockLocation };

      mockWeatherApi.getLocationByCity.mockResolvedValue(mockCityGeoData);
      mockLocationModel.createLocationFromGeoData.mockReturnValue(mockLocation);
      mockWeatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      mockWeatherModel.createWeatherModel.mockReturnValue(mockWeather);

      await fetchWeather({ type: "city", cityName: "Paris" });

      expect(mockWeatherApi.getLocationByCity).toHaveBeenCalledWith("Paris");
      expect(mockWeatherApi.getCurrentWeather).toHaveBeenCalledWith(48.8566, 2.3522);
    });

    it("should emit loadingStart event", async () => {
      const loadingStartSpy = jest.fn();
      bus.on("weather:loadingStart", loadingStartSpy);

      mockWeatherApi.getLocationByIP.mockResolvedValue({
        lat: 51.5074,
        lon: -0.1278,
        city: "London",
        country: "UK",
        timezone: "Europe/London",
      });
      mockLocationModel.createLocationFromIPData.mockReturnValue({
        key: "51.5074,-0.1278",
        name: "London",
        geo: { lat: 51.5074, lng: -0.1278 },
      });
      mockWeatherApi.getCurrentWeather.mockResolvedValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
      });
      mockWeatherModel.createWeatherModel.mockReturnValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
        location: { key: "51.5074,-0.1278", name: "London", geo: { lat: 51.5074, lng: -0.1278 } },
      });

      await fetchWeather({ type: "auto" });

      expect(loadingStartSpy).toHaveBeenCalled();
    });

    it("should emit dataLoaded event with weather data", async () => {
      const dataLoadedSpy = jest.fn();
      bus.on("weather:dataLoaded", dataLoadedSpy);

      mockWeatherApi.getLocationByIP.mockResolvedValue({
        lat: 51.5074,
        lon: -0.1278,
        city: "London",
        country: "UK",
        timezone: "Europe/London",
      });
      mockLocationModel.createLocationFromIPData.mockReturnValue({
        key: "51.5074,-0.1278",
        name: "London",
        geo: { lat: 51.5074, lng: -0.1278 },
      });
      mockWeatherApi.getCurrentWeather.mockResolvedValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
      });
      mockWeatherModel.createWeatherModel.mockReturnValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
        location: { key: "51.5074,-0.1278", name: "London", geo: { lat: 51.5074, lng: -0.1278 } },
      });

      await fetchWeather({ type: "auto" });

      expect(dataLoadedSpy).toHaveBeenCalled();
    });

    it("should emit loadingEnd event", async () => {
      const loadingEndSpy = jest.fn();
      bus.on("weather:loadingEnd", loadingEndSpy);

      mockWeatherApi.getLocationByIP.mockResolvedValue({
        lat: 51.5074,
        lon: -0.1278,
        city: "London",
        country: "UK",
        timezone: "Europe/London",
      });
      mockLocationModel.createLocationFromIPData.mockReturnValue({
        key: "51.5074,-0.1278",
        name: "London",
        geo: { lat: 51.5074, lng: -0.1278 },
      });
      mockWeatherApi.getCurrentWeather.mockResolvedValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
      });
      mockWeatherModel.createWeatherModel.mockReturnValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
        location: { key: "51.5074,-0.1278", name: "London", geo: { lat: 51.5074, lng: -0.1278 } },
      });

      await fetchWeather({ type: "auto" });

      expect(loadingEndSpy).toHaveBeenCalled();
    });

    it("should emit error event when API fails", async () => {
      const errorSpy = jest.fn();
      bus.on("weather:error", errorSpy);

      mockWeatherApi.getLocationByIP.mockRejectedValue(new Error("API Error"));

      await fetchWeather({ type: "auto" });

      expect(errorSpy).toHaveBeenCalled();
    });

    it("should handle unknown location type", async () => {
      const errorSpy = jest.fn();
      bus.on("weather:error", errorSpy);

      await fetchWeather({ type: "unknown" as any });

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("getCurrentWeather", () => {
    it("should return null when no weather is loaded", () => {
      const result = getCurrentWeather();
      expect(result).toBeNull();
    });

    it("should return current weather after fetch", async () => {
      mockWeatherApi.getLocationByIP.mockResolvedValue({
        lat: 51.5074,
        lon: -0.1278,
        city: "London",
        country: "UK",
        timezone: "Europe/London",
      });
      mockLocationModel.createLocationFromIPData.mockReturnValue({
        key: "51.5074,-0.1278",
        name: "London",
        geo: { lat: 51.5074, lng: -0.1278 },
      });
      mockWeatherApi.getCurrentWeather.mockResolvedValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
      });
      mockWeatherModel.createWeatherModel.mockReturnValue({
        temperature: 15,
        weatherText: "Cloudy",
        weatherIcon: 3,
        windSpeed: 10,
        windDirection: "SW",
        windDirectionDegrees: 225,
        pressure: 1013,
        visibility: 10,
        uvIndex: 3,
        realFeel: 14,
        location: { key: "51.5074,-0.1278", name: "London", geo: { lat: 51.5074, lng: -0.1278 } },
      });

      await fetchWeather({ type: "auto" });

      const result = getCurrentWeather();
      expect(result).toBeTruthy();
      expect(result?.temperature).toBe(15);
    });
  });

  describe("loadSavedData integration", () => {
    it("should load weather from router params when city is present", async () => {
      mockRouter.getCurrentParams.mockReturnValue({ city: "Moscow" });
      
      const mockLocation = {
        key: "55.7558,37.6173",
        name: "Moscow",
        geo: { lat: 55.7558, lng: 37.6173 },
      };
      const mockWeatherData = {
        temperature: -5,
        weatherText: "Snowy",
        weatherIcon: 22,
        windSpeed: 15,
        windDirection: "N",
        windDirectionDegrees: 0,
        pressure: 1020,
        visibility: 5,
        uvIndex: 1,
        realFeel: -10,
      };
      const mockWeather = { ...mockWeatherData, location: mockLocation };

      mockWeatherApi.getLocationByCity.mockResolvedValue({
        name: "Moscow",
        latitude: 55.7558,
        longitude: 37.6173,
        country: "Russia",
        timezone: "Europe/Moscow",
      });
      mockLocationModel.createLocationFromGeoData.mockReturnValue(mockLocation);
      mockWeatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      mockWeatherModel.createWeatherModel.mockReturnValue(mockWeather);

      initController();
      
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockWeatherSearchView.setSearchType).toHaveBeenCalledWith("city");
      expect(mockWeatherSearchView.setCityName).toHaveBeenCalledWith("Moscow");
      expect(mockWeatherApi.getLocationByCity).toHaveBeenCalledWith("Moscow");
    });

    it("should load weather from storage when no router params", async () => {
      mockRouter.getCurrentParams.mockReturnValue({});
      mockWeatherStorage.getLastCity.mockReturnValue("Berlin");
      
      const mockLocation = {
        key: "52.5200,13.4050",
        name: "Berlin",
        geo: { lat: 52.5200, lng: 13.4050 },
      };
      const mockWeatherData = {
        temperature: 10,
        weatherText: "Rainy",
        weatherIcon: 61,
        windSpeed: 8,
        windDirection: "W",
        windDirectionDegrees: 270,
        pressure: 1010,
        visibility: 8,
        uvIndex: 2,
        realFeel: 8,
      };
      const mockWeather = { ...mockWeatherData, location: mockLocation };

      mockWeatherApi.getLocationByCity.mockResolvedValue({
        name: "Berlin",
        latitude: 52.5200,
        longitude: 13.4050,
        country: "Germany",
        timezone: "Europe/Berlin",
      });
      mockLocationModel.createLocationFromGeoData.mockReturnValue(mockLocation);
      mockWeatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      mockWeatherModel.createWeatherModel.mockReturnValue(mockWeather);

      initController();
      
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockWeatherStorage.getLastCity).toHaveBeenCalled();
      expect(mockWeatherSearchView.setSearchType).toHaveBeenCalledWith("city");
      expect(mockWeatherSearchView.setCityName).toHaveBeenCalledWith("Berlin");
      expect(mockWeatherApi.getLocationByCity).toHaveBeenCalledWith("Berlin");
    });

    it("should load auto weather when no router params and no storage", async () => {
      mockRouter.getCurrentParams.mockReturnValue({});
      mockWeatherStorage.getLastCity.mockReturnValue(null);
      
      const mockIpLocation = {
        lat: 40.7128,
        lon: -74.0060,
        city: "New York",
        country: "USA",
        timezone: "America/New_York",
      };
      const mockLocation = {
        key: "40.7128,-74.0060",
        name: "New York",
        geo: { lat: 40.7128, lng: -74.0060 },
      };
      const mockWeatherData = {
        temperature: 25,
        weatherText: "Sunny",
        weatherIcon: 1,
        windSpeed: 5,
        windDirection: "E",
        windDirectionDegrees: 90,
        pressure: 1015,
        visibility: 10,
        uvIndex: 6,
        realFeel: 27,
      };
      const mockWeather = { ...mockWeatherData, location: mockLocation };

      mockWeatherApi.getLocationByIP.mockResolvedValue(mockIpLocation);
      mockLocationModel.createLocationFromIPData.mockReturnValue(mockLocation);
      mockWeatherApi.getCurrentWeather.mockResolvedValue(mockWeatherData);
      mockWeatherModel.createWeatherModel.mockReturnValue(mockWeather);

      initController();
      
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockWeatherSearchView.setSearchType).toHaveBeenCalledWith("auto");
      expect(mockWeatherApi.getLocationByIP).toHaveBeenCalled();
    });
  });
});
