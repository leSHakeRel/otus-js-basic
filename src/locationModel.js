// Создание модели локации из данных геокодинга
export function createLocationFromGeoData(geoData) {
  return {
    key: `${geoData.latitude},${geoData.longitude}`,
    name: geoData.name,
    country: geoData.country,
    localizedName: geoData.name,
    geo: {
      lat: geoData.latitude,
      lng: geoData.longitude,
    },
    timeZone: geoData.timezone,
  };
}

// Создание модели локации из IP данных
export function createLocationFromIPData(ipData) {
  return {
    key: `${ipData.lat},${ipData.lon}`,
    name: ipData.city,
    country: ipData.country,
    localizedName: ipData.city,
    geo: {
      lat: ipData.lat,
      lng: ipData.lon,
    },
    timeZone: ipData.timezone,
  };
}
