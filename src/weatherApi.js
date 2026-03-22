import apiConfig from "./weather.config.js";
const windIcon = `
  <?xml version="1.0" encoding="iso-8859-1"?>
  <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
  <svg fill="#006bc2" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
  	 viewBox="0 0 512.003 512.003" xml:space="preserve">
  <g>
  	<g>
  		<path d="M322.528,387.207l-57.984-74.551V101.617l46.276,33.057c1.486,1.067,3.228,1.588,4.961,1.588
  			c1.981,0,3.954-0.692,5.542-2.049c2.989-2.545,3.851-6.798,2.092-10.316L263.639,4.342c-2.895-5.79-12.382-5.79-15.277,0
  			l-59.777,119.554c-1.759,3.51-0.888,7.763,2.092,10.316c2.98,2.545,7.31,2.733,10.504,0.461l46.285-33.057v211.048l-57.984,74.542
  			c-1.161,1.494-1.793,3.339-1.793,5.243v111.015c0,3.646,2.314,6.891,5.764,8.078c3.433,1.178,7.276,0.043,9.513-2.835
  			l53.039-68.197l53.031,68.189c1.648,2.126,4.159,3.296,6.746,3.296c0.922,0,1.862-0.154,2.775-0.461
  			c3.45-1.178,5.764-4.424,5.764-8.07V392.45C324.321,390.546,323.69,388.701,322.528,387.207z"/>
  	</g>
  </g>
  </svg>
`;

/**
 * Получение IP-адреса
 * @returns {string} - IP-адрес
 */
async function getPublicIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Ошибка:", error);
    throw error;
  }
}

/**
 * Получение кода локации по IP-адресу
 * @returns {object} - Данные локации
 */
async function getLocationByIP() {
  try {
    const ip = await getPublicIP();
    const url = new URL(`${apiConfig.BASE_URL}/locations/v1/cities/ipaddress`);
    url.searchParams.append("q", ip);
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
    console.log(data);

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

  let iconCode;
  if (typeof weatherIconCode === "object" && weatherIconCode !== null) {
    iconCode = weatherIconCode.weatherIconCode;
  } else {
    iconCode = weatherIconCode;
  }

  img.src = `https://cdn.discover.swiss/icons/weather/ds-weather-${iconCode}.svg`;

  if (typeof weatherIconCode === "object" && weatherIconCode !== null) {
    img.width =
      weatherIconCode.width !== undefined ? weatherIconCode.width : 64;
    img.height =
      weatherIconCode.height !== undefined ? weatherIconCode.height : 64;
  } else {
    img.width = 64;
    img.height = 64;
  }

  return img;
}

export async function displayWindIcon(windDirection) {
  const img = document.createElement("div");
  img.innerHTML = windIcon;
  const svg = img.firstElementChild;

  svg.setAttribute("width", 32);
  svg.setAttribute("height", 32);

  svg.style.transition = "transform 0.3s ease";
  svg.style.transform = `rotate(${windDirection}deg)`;

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
