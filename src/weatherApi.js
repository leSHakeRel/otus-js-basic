import apiConfig from "./weather.config.js";

/**
 * Получение кода локации по IP-адресу
 * @returns {object} - Данные локации
 */
async function getLocationByIP() {
  try {
    const url = new URL(`${apiConfig.BASE_URL}/locations/v1/cities/ipaddress`);
    url.searchParams.append("details", "true");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiConfig.API_KEY}`,
      },
    });

    if (!response.ok) {
      let errorMessage;
      if (response.status === 401) {
        errorMessage = "Недействительный API ключ";
      } else if (response.status === 404) {
        errorMessage = "Локация по IP не найдена";
      } else {
        errorMessage = `HTTP ошибка! Статус: ${response.status}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
      key: data.Key,
      name: data.LocalizedName,
      country: data.Country.LocalizedName,
      timeZone: data.TimeZone?.Name,
      geoPosition: data.GeoPosition,
      ...data,
    };
  } catch (error) {
    console.error("Ошибка при определении локации по IP:", error);
    throw error;
  }
}

/**
 * Поиск города по названию
 * @param {string} cityName - название города для поиска
 * @returns {Promise<Object>} - Первая найденная локация
 */
async function getLocationByCity(cityName) {
  try {
    const url = new URL(`${apiConfig.BASE_URL}/locations/v1/cities/search`);
    url.searchParams.append("q", cityName);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiConfig.API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error("Город не найден");
    }

    return {
      key: data[0].Key,
      name: data[0].LocalizedName,
      country: data[0].Country.LocalizedName,
      ...data[0],
    };
  } catch (error) {
    console.error("Ошибка поиска города:", error);
    throw error;
  }
}

/**
 * Получение текущих погодных условий по ключу локации
 * @param {string} locationKey - Уникальный ключ локации
 * @returns {Promise<Object>} - Данные о текущей погоде
 */
async function getCurrentWeather(locationKey) {
  try {
    const url = new URL(
      `${apiConfig.BASE_URL}/currentconditions/v1/${locationKey}`,
    );
    url.searchParams.append("details", "true");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiConfig.API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(response.statusText);
      throw new Error(`HTTP ошибка! Статус: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      console.error("Data is empty");
      throw new Error("Данные о погоде не найдены");
    }

    const condition = data[0];
    return {
      temperature: condition.Temperature.Metric.Value,
      weatherText: condition.WeatherText,
      weatherIcon: condition.WeatherIcon,
      windSpeed: condition.Wind.Speed.Metric.Value,
      windDirection: condition.Wind.Direction?.Localized,
      pressure: condition.Pressure.Metric.Value,
      visibility: condition.Visibility?.Metric?.Value,
      uvIndex: condition.UVIndex,
      realFeel: condition.RealFeelTemperature?.Metric?.Value,
      ...condition,
    };
  } catch (error) {
    console.error("Ошибка получении погоды:", error);
    throw error;
  }
}

/**
 * Получение иконки погоды
 * @param {object} weatherIcon - параметры элемента
 * @returns {object} - HTML-элемент с иконкой
 */
export async function displayWeatherWithIcon(weatherIconCode) {
  const img = document.createElement("img");
  img.src = `https://cdn.discover.swiss/icons/weather/ds-weather-${weatherIconCode}.svg`;
  img.width = weatherIconCode?.width !== undefined ? weatherIconCode.width : 64;
  img.height =
    weatherIconCode?.height !== undefined ? weatherIconCode.height : 64;

  return img;
}

/**
 * Получение текущих погодных условий по ключу локации
 * @param {object} location -  Параметры запроса
 * @returns {Promise<Object>} - Данные о текущей погоде
 */
export async function getWeatherData(location) {
  let weatherData;
  try {
    let locationKey;
    switch (location.type) {
      case "auto": {
        const ipLocation = await getLocationByIP();
        locationKey = ipLocation.key;
        break;
      }
      case "city": {
        const locationCity = await getLocationByCity(location.cityName);
        locationKey = locationCity.key;
        0;
        break;
      }
      default: {
        const errorMessage = "undefined location type";
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    weatherData = await getCurrentWeather(locationKey);
  } catch (error) {
    console.error("Ошибка получении погоды:", error);
    throw error;
  }
  // console.log(weatherData);
  return weatherData;
}
