import * as weatherApi from "./weatherApiService.js";
import * as locationModel from "./locationModel.js";
import * as weatherModel from "./weatherModel.js";
import * as weatherSearchView from "./weatherSearchView.js";
import * as weatherResultView from "./weatherResultView.js";
import { bus } from "./eventbus.js";

export function initController() {
  loadSavedData();

  bus.on("weather:dataNeeded", () => {
    if (currentWeather) {
      bus.emit("weather:dataLoaded", currentWeather);
    }
  });
}

async function loadSavedData() {
  const savedData = localStorage.getItem("searchData");
  if (savedData) {
    const searchData = JSON.parse(savedData);

    if (searchData.type === "city") {
      weatherSearchView.setSearchType("city");
      weatherSearchView.setCityName(searchData.cityName);
    } else {
      weatherSearchView.setSearchType("auto");
    }

    await fetchWeather(searchData);
  }
}

/**
 * Получение погоды
 * @param {Object} searchData - параметры поиска
 */
export async function fetchWeather(searchData) {
  bus.emit("weather:loadingStart");

  try {
    let location;
    let weatherData;
    console.log("received locatio");

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
    } else {
      throw new Error("Неизвестный тип локации");
    }

    const weather = weatherModel.createWeatherModel(weatherData, location);

    bus.emit("weather:dataLoaded", weather);
    bus.emit("weather:loadingEnd");

    localStorage.setItem("searchData", JSON.stringify(searchData));
  } catch (error) {
    console.error("Ошибка получения погоды:", error);
    bus.emit("weather:error", error.message);
    bus.emit("weather:loadingEnd");
  }
}
