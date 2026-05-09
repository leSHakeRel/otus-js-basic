import apiConfig from "./weather.config";

interface LocationData {
  lat: number;
  lon: number;
  city: string;
  country: string;
  timezone: string;
}

interface CityGeoData {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

interface WeatherData {
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
}

interface CurrentWeatherResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
  };
  hourly: {
    pressure_msl?: number[];
    visibility?: number[];
  };
}

interface CitySearchResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

/**
 * Получение внешнего IP-адреса
 * @returns IP-адрес
 */
export async function getPublicIP(): Promise<string> {
  const response = await fetch(`${apiConfig.IPIFY_BASE_URL}?format=json`);
  if (!response.ok) {
    throw new Error("Ошибка получения IP-адреса");
  }
  const data = await response.json();
  return data.ip;
}

/**
 * Получение локации по IP
 * @returns геолокация
 */
export async function getLocationByIP(): Promise<LocationData> {
  const ip = await getPublicIP();
  const response = await fetch(`${apiConfig.IPAPI_BASE_URL}/${ip}`);

  if (!response.ok) {
    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== "success") {
    throw new Error("Не удалось определить локацию по IP");
  }

  return {
    lat: data.lat,
    lon: data.lon,
    city: data.city,
    country: data.country,
    timezone: data.timezone,
  };
}

/**
 * Поиск города по названию
 * @param cityName - название города
 * @returns город
 */
export async function getLocationByCity(
  cityName: string,
): Promise<CitySearchResult> {
  const url = new URL(`${apiConfig.OPEN_METEO_BASE_URL}/search`);
  url.searchParams.append("name", cityName);
  url.searchParams.append("count", "1");
  url.searchParams.append("language", "ru");
  url.searchParams.append("format", "json");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Город "${cityName}" не найден`);
  }

  return data.results[0];
}

/**
 * Получение текущей погоды по геолокации
 * @param lat - широта
 * @param lon - долгота
 * @returns погода
 */
export async function getCurrentWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const url = new URL(`${apiConfig.OPEN_METEO_WEATHER_URL}/forecast`);
  url.searchParams.append("latitude", lat.toString());
  url.searchParams.append("longitude", lon.toString());
  url.searchParams.append("current_weather", "true");
  url.searchParams.append(
    "hourly",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,visibility",
  );
  url.searchParams.append("timezone", "auto");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ошибка! Статус: ${response.status}`);
  }

  const data = (await response.json()) as CurrentWeatherResponse;

  if (!data.current_weather) {
    throw new Error("Данные о погоде не найдены");
  }

  const current = data.current_weather;
  const currentHour = new Date().getHours();
  const hourlyData = data.hourly;

  return {
    temperature: Math.round(current.temperature),
    weatherText: getWeatherDescription(current.weathercode),
    weatherIcon: mapWeatherCodeToIcon(current.weathercode),
    windSpeed: Math.round(current.windspeed),
    windDirection: getWindDirection(current.winddirection),
    windDirectionDegrees: current.winddirection || 0,
    pressure: hourlyData?.pressure_msl?.[currentHour]
      ? Math.round(hourlyData.pressure_msl[currentHour])
      : 1013,
    visibility: hourlyData?.visibility?.[currentHour]
      ? Math.round(hourlyData.visibility[currentHour])
      : 10,
    uvIndex: 5,
    realFeel: Math.round(current.temperature),
  };
}

/**
 * Преобразование кода погоды Open-Meteo в иконку AccuWeather
 * @param weatherCode - код погоды WMO
 * @returns код иконки для отображения
 */
function mapWeatherCodeToIcon(weatherCode: number): number {
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
}

/**
 * Получение текстового описания погоды по коду WMO
 * @param code - код погоды
 * @returns описание погоды
 */
function getWeatherDescription(code: number): string {
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
}

/**
 * Получение стороны света по углу
 * @param degrees - угол в градусах
 * @returns сторона света
 */
function getWindDirection(degrees: number): string {
  const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index] || "С";
}
