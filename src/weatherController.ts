import * as weatherApi from "./weatherApiService";
import * as locationModel from "./locationModel";
import * as weatherModel from "./weatherModel";
import * as weatherSearchView from "./weatherSearchView";
import { bus } from "./eventbus";
import { router } from "./router";
import { weatherStorage } from "./weatherStorageService";

interface WeatherData {
  type: "auto" | "city";
  cityName?: string;
}

interface CurrentWeather {
  status: boolean;
  message: string;
  temperature: number;
  weatherText: string;
  weatherIcon: number;
  windSpeed: number;
  windDirection: string;
  windDirectionDegrees: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  realFeel: number;
  location: {
    key: string;
    name: string;
    country: string;
    localizedName: string;
    geo: {
      lat: number;
      lng: number;
    };
    timeZone: string;
  };
  getPressureInMM(): number | null;
}

let currentWeather: CurrentWeather | null = null;
let currentSearchData: WeatherData | null = null;

export function resetControllerState(): void {
  currentWeather = null;
  currentSearchData = null;
}

export function initController(): void {
  loadSavedData();

  bus.on("weather:dataNeeded", () => {
    if (currentWeather) {
      bus.emit("weather:dataLoaded", currentWeather);
    }
  });
}

async function loadSavedData(): Promise<void> {
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

export async function fetchWeather(searchData: WeatherData): Promise<void> {
  currentSearchData = searchData;
  bus.emit("weather:loadingStart");

  try {
    let location: {
      key: string;
      name: string;
      country: string;
      localizedName: string;
      geo: {
        lat: number;
        lng: number;
      };
      timeZone: string;
    };
    let weatherData: {
      temperature: number;
      weatherText: string;
      weatherIcon: number;
      windSpeed: number;
      windDirection: string;
      windDirectionDegrees: number;
      pressure: number;
      visibility: number;
      uvIndex: number;
      realFeel: number;
    };

    if (searchData.type === "auto") {
      const ipLocation = await weatherApi.getLocationByIP();
      location = locationModel.createLocationFromIPData(ipLocation);
      weatherData = await weatherApi.getCurrentWeather(
        location.geo.lat,
        location.geo.lng,
      );
    } else if (searchData.type === "city") {
      const cityGeoData = await weatherApi.getLocationByCity(
        searchData.cityName!,
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
    const message = error instanceof Error ? error.message : String(error);
    bus.emit("weather:error", message);
    bus.emit("weather:loadingEnd");
  }
}

export function getCurrentWeather(): CurrentWeather | null {
  return currentWeather;
}

export { weatherStorage };
