interface WeatherApiData {
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

interface Location {
  key: string;
  name: string;
  country: string;
  localizedName: string;
  geo: {
    lat: number;
    lng: number;
  };
  timeZone: string;
}

interface WeatherModel {
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
  location: Location;
  getPressureInMM(): number | null;
}

export function createWeatherModel(
  apiData: WeatherApiData,
  location: Location,
): WeatherModel {
  return {
    status: true,
    message: "",
    temperature: apiData.temperature,
    weatherText: apiData.weatherText,
    weatherIcon: apiData.weatherIcon,
    windSpeed: apiData.windSpeed,
    windDirection: apiData.windDirection,
    windDirectionDegrees: apiData.windDirectionDegrees,
    pressure: apiData.pressure,
    visibility: apiData.visibility,
    uvIndex: apiData.uvIndex,
    realFeel: apiData.realFeel,
    location: location,
    getPressureInMM(): number | null {
      return this.pressure ? Math.round(this.pressure * 0.7506) : null;
    },
  };
}
