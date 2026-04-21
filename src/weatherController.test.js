import * as weatherController from "./weatherController";
import * as weatherApi from "./weatherApiService";
import * as locationModel from "./locationModel";
import * as weatherModel from "./weatherModel";
import * as weatherSearchView from "./weatherSearchView";
import * as weatherResultView from "./weatherResultView";

jest.mock("./weatherApiService");
jest.mock("./locationModel");
jest.mock("./weatherModel");
jest.mock("./weatherSearchView");
jest.mock("./weatherResultView");

describe("weatherController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    weatherResultView.showLoading.mockImplementation(() => {});
    weatherResultView.showWeatherData.mockImplementation(() => {});
    weatherResultView.showError.mockImplementation(() => {});
    weatherSearchView.setSearchType.mockImplementation(() => {});
    weatherSearchView.setCityName.mockImplementation(() => {});
  });

  describe("initController", () => {
    it("should load saved data from localStorage", () => {
      const savedData = { type: "city", cityName: "Paris" };
      localStorage.setItem("searchData", JSON.stringify(savedData));

      weatherController.initController();

      expect(weatherSearchView.setSearchType).toHaveBeenCalledWith("city");
      expect(weatherSearchView.setCityName).toHaveBeenCalledWith("Paris");
    });

    it("should not call fetchWeather when no saved data", () => {
      const fetchSpy = jest.spyOn(weatherController, "fetchWeather");

      weatherController.initController();

      expect(fetchSpy).not.toHaveBeenCalled();
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
      expect(weatherResultView.showWeatherData).toHaveBeenCalledWith(
        mockWeather,
      );
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
      expect(weatherResultView.showWeatherData).toHaveBeenCalledWith(
        mockWeather,
      );
    });

    it("should show loading before fetching", async () => {
      const searchData = { type: "auto" };
      weatherApi.getLocationByIP.mockResolvedValue({});
      weatherApi.getCurrentWeather.mockResolvedValue({});
      locationModel.createLocationFromIPData.mockReturnValue({});
      weatherModel.createWeatherModel.mockReturnValue({});

      await weatherController.fetchWeather(searchData);

      expect(weatherResultView.showLoading).toHaveBeenCalled();
    });

    it("should show error when API call fails", async () => {
      const searchData = { type: "city", cityName: "InvalidCity" };
      weatherApi.getLocationByCity.mockRejectedValue(
        new Error("City not found"),
      );

      await weatherController.fetchWeather(searchData);

      expect(weatherResultView.showError).toHaveBeenCalledWith(
        "City not found",
      );
    });

    it("should throw error for unknown location type", async () => {
      const searchData = { type: "unknown" };

      await weatherController.fetchWeather(searchData);

      expect(weatherResultView.showError).toHaveBeenCalledWith(
        "Неизвестный тип локации",
      );
    });
  });
});
