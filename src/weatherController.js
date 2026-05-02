import * as weatherApi from "./weatherApiService.js";
import * as locationModel from "./locationModel.js";
import * as weatherModel from "./weatherModel.js";
import * as weatherSearchView from "./weatherSearchView.js";
import * as weatherResultView from "./weatherResultView.js";
import { bus } from "./eventbus.js";
import { router } from "./router.js";
import { weatherStorage } from "./weatherStorageService.js";

let currentWeather = null;
let currentSearchData = null;

export function initController() {
  loadSavedData();

  bus.on("weather:dataNeeded", () => {
    if (currentWeather) {
      bus.emit("weather:dataLoaded", currentWeather);
    }
  });
}

async function loadSavedData() {
  const currentParams = router.getCurrentParams();
  if (!currentParams) return;
  if (currentParams.city) {
    const cityName = decodeURIComponent(currentParams.city);
    weatherSearchView.setSearchType("city");
    weatherSearchView.setCityName(cityName);
    await fetchWeather({ type: "city", cityName: cityName });
  } else {
    const lastCity = weatherStorage.getLastCity();
    if (lastCity) {
      weatherSearchView.setSearchType("city");
      weatherSearchView.setCityName(lastCity);
      await fetchWeather({ type: "city", cityName: lastCity });
    } else {
      weatherSearchView.setSearchType("auto");
      await fetchWeather({ type: "auto" });
    }
  }
}

export async function fetchWeather(searchData) {
  currentSearchData = searchData;
  bus.emit("weather:loadingStart");

  try {
    let location;
    let weatherData;

    if (searchData.type === "auto") {
      const ipLocation = await weatherApi.getLocationByIP();
      location = locationModel.createLocationFromIPData(ipLocation);
      weatherData = await weatherApi.getCurrentWeather(
        location.geo.lat,
        location.geo.lng,
      );
    } else if (searchData.type === "city") {
      const cityGeoData = await weatherApi.getLocationByCity(
        searchData.cityName,
      );
      location = locationModel.createLocationFromGeoData(cityGeoData);
      weatherData = await weatherApi.getCurrentWeather(
        location.geo.lat,
        location.geo.lng,
      );

      bus.emit("weather:addCity", searchData.cityName);
    } else {
      throw new Error("Неизвестный тип локации");
    }

    const weather = weatherModel.createWeatherModel(weatherData, location);
    currentWeather = weather;

    bus.emit("weather:dataLoaded", weather);
    bus.emit("weather:loadingEnd");
  } catch (error) {
    console.error("Ошибка получения погоды:", error);
    bus.emit("weather:error", error.message);
    bus.emit("weather:loadingEnd");
  }
}

export function getCurrentWeather() {
  return currentWeather;
}

export { weatherStorage };
