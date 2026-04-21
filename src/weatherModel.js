/**
 * Создание модели погоды из ответа API
 * @param {Object} apiData - данные от API
 * @param {Object} location - локация
 * @returns {Object} - данные в необходжимом формате
 */
export function createWeatherModel(apiData, location) {
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

    getPressureInMM: function () {
      return this.pressure ? Math.round(this.pressure * 0.7506) : null;
    },
  };
}
