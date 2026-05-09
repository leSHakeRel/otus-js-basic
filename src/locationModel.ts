interface GeoData {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  timezone: string;
}

interface IPData {
  lat: number;
  lon: number;
  city: string;
  country: string;
  timezone: string;
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

export function createLocationFromGeoData(geoData: GeoData): Location {
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

export function createLocationFromIPData(ipData: IPData): Location {
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
