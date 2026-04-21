import * as locationModel from "./locationModel";

describe("locationModel", () => {
  describe("createLocationFromGeoData", () => {
    it("should create location model from valid geo data", () => {
      const geoData = {
        latitude: 51.5074,
        longitude: -0.1278,
        name: "London",
        country: "United Kingdom",
        timezone: "Europe/London",
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result).toEqual({
        key: "51.5074,-0.1278",
        name: "London",
        country: "United Kingdom",
        localizedName: "London",
        geo: {
          lat: 51.5074,
          lng: -0.1278,
        },
        timeZone: "Europe/London",
      });
    });

    it("should create location model with different city data", () => {
      const geoData = {
        latitude: 40.7128,
        longitude: -74.006,
        name: "New York",
        country: "USA",
        timezone: "America/New_York",
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result.key).toEqual("40.7128,-74.006");
      expect(result.name).toEqual("New York");
      expect(result.country).toEqual("USA");
      expect(result.geo.lat).toEqual(40.7128);
      expect(result.geo.lng).toEqual(-74.006);
      expect(result.timeZone).toEqual("America/New_York");
    });

    it("should handle negative longitude values", () => {
      const geoData = {
        latitude: -33.8688,
        longitude: -151.2093,
        name: "Sydney",
        country: "Australia",
        timezone: "Australia/Sydney",
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result.key).toEqual("-33.8688,-151.2093");
      expect(result.geo.lat).toEqual(-33.8688);
      expect(result.geo.lng).toEqual(-151.2093);
    });

    it("should handle positive longitude values", () => {
      const geoData = {
        latitude: 35.6895,
        longitude: 139.6917,
        name: "Tokyo",
        country: "Japan",
        timezone: "Asia/Tokyo",
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result.key).toEqual("35.6895,139.6917");
      expect(result.geo.lat).toEqual(35.6895);
      expect(result.geo.lng).toEqual(139.6917);
    });

    it("should handle decimal coordinates correctly", () => {
      const geoData = {
        latitude: 48.8566,
        longitude: 2.3522,
        name: "Paris",
        country: "France",
        timezone: "Europe/Paris",
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result.key).toEqual("48.8566,2.3522");
      expect(result.geo.lat).toEqual(48.8566);
      expect(result.geo.lng).toEqual(2.3522);
    });

    it("should handle missing timezone", () => {
      const geoData = {
        latitude: 55.7558,
        longitude: 37.6173,
        name: "Moscow",
        country: "Russia",
        timezone: undefined,
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result.timeZone).toBeUndefined();
      expect(result.name).toEqual("Moscow");
    });

    it("should preserve localizedName same as name", () => {
      const geoData = {
        latitude: 52.52,
        longitude: 13.405,
        name: "Berlin",
        country: "Germany",
        timezone: "Europe/Berlin",
      };

      const result = locationModel.createLocationFromGeoData(geoData);

      expect(result.localizedName).toEqual(result.name);
      expect(result.localizedName).toEqual("Berlin");
    });
  });

  describe("createLocationFromIPData", () => {
    it("should create location model from valid IP data", () => {
      const ipData = {
        lat: 37.7749,
        lon: -122.4194,
        city: "San Francisco",
        country: "USA",
        timezone: "America/Los_Angeles",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result).toEqual({
        key: "37.7749,-122.4194",
        name: "San Francisco",
        country: "USA",
        localizedName: "San Francisco",
        geo: {
          lat: 37.7749,
          lng: -122.4194,
        },
        timeZone: "America/Los_Angeles",
      });
    });

    it("should create location model from IP data with different coordinates", () => {
      const ipData = {
        lat: 51.5074,
        lon: -0.1278,
        city: "London",
        country: "United Kingdom",
        timezone: "Europe/London",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.key).toEqual("51.5074,-0.1278");
      expect(result.name).toEqual("London");
      expect(result.country).toEqual("United Kingdom");
      expect(result.geo.lat).toEqual(51.5074);
      expect(result.geo.lng).toEqual(-0.1278);
      expect(result.timeZone).toEqual("Europe/London");
    });

    it("should handle Asian city IP data", () => {
      const ipData = {
        lat: 35.6895,
        lon: 139.6917,
        city: "Tokyo",
        country: "Japan",
        timezone: "Asia/Tokyo",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.key).toEqual("35.6895,139.6917");
      expect(result.name).toEqual("Tokyo");
      expect(result.country).toEqual("Japan");
      expect(result.geo.lat).toEqual(35.6895);
      expect(result.geo.lng).toEqual(139.6917);
    });

    it("should handle southern hemisphere IP data", () => {
      const ipData = {
        lat: -33.8688,
        lon: 151.2093,
        city: "Sydney",
        country: "Australia",
        timezone: "Australia/Sydney",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.key).toEqual("-33.8688,151.2093");
      expect(result.geo.lat).toEqual(-33.8688);
      expect(result.geo.lng).toEqual(151.2093);
    });

    it("should handle decimal precision in IP coordinates", () => {
      const ipData = {
        lat: 40.7128,
        lon: -74.006,
        city: "New York",
        country: "USA",
        timezone: "America/New_York",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.key).toEqual("40.7128,-74.006");
      expect(result.geo.lat).toEqual(40.7128);
      expect(result.geo.lng).toEqual(-74.006);
    });

    it("should handle missing timezone in IP data", () => {
      const ipData = {
        lat: 55.7558,
        lon: 37.6173,
        city: "Moscow",
        country: "Russia",
        timezone: undefined,
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.timeZone).toBeUndefined();
      expect(result.name).toEqual("Moscow");
    });

    it("should preserve localizedName same as city name", () => {
      const ipData = {
        lat: 48.8566,
        lon: 2.3522,
        city: "Paris",
        country: "France",
        timezone: "Europe/Paris",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.localizedName).toEqual(result.name);
      expect(result.localizedName).toEqual("Paris");
    });

    it("should handle city names with spaces", () => {
      const ipData = {
        lat: 34.0522,
        lon: -118.2437,
        city: "Los Angeles",
        country: "USA",
        timezone: "America/Los_Angeles",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.name).toEqual("Los Angeles");
      expect(result.localizedName).toEqual("Los Angeles");
    });

    it("should handle city names with special characters", () => {
      const ipData = {
        lat: 48.5734,
        lon: 7.7521,
        city: "Strasbourg",
        country: "France",
        timezone: "Europe/Paris",
      };

      const result = locationModel.createLocationFromIPData(ipData);

      expect(result.name).toEqual("Strasbourg");
      expect(result.country).toEqual("France");
    });
  });

  describe("comparison between createLocationFromGeoData and createLocationFromIPData", () => {
    it("should produce same structure from both methods", () => {
      const geoData = {
        latitude: 41.9028,
        longitude: 12.4964,
        name: "Rome",
        country: "Italy",
        timezone: "Europe/Rome",
      };

      const ipData = {
        lat: 41.9028,
        lon: 12.4964,
        city: "Rome",
        country: "Italy",
        timezone: "Europe/Rome",
      };

      const geoResult = locationModel.createLocationFromGeoData(geoData);
      const ipResult = locationModel.createLocationFromIPData(ipData);

      expect(geoResult.key).toEqual(ipResult.key);
      expect(geoResult.name).toEqual(ipResult.name);
      expect(geoResult.country).toEqual(ipResult.country);
      expect(geoResult.geo.lat).toEqual(ipResult.geo.lat);
      expect(geoResult.geo.lng).toEqual(ipResult.geo.lng);
      expect(geoResult.timeZone).toEqual(ipResult.timeZone);
    });

    it("should handle zero coordinates correctly", () => {
      const geoData = {
        latitude: 0,
        longitude: 0,
        name: "Null Island",
        country: "International Waters",
        timezone: "UTC",
      };

      const ipData = {
        lat: 0,
        lon: 0,
        city: "Null Island",
        country: "International Waters",
        timezone: "UTC",
      };

      const geoResult = locationModel.createLocationFromGeoData(geoData);
      const ipResult = locationModel.createLocationFromIPData(ipData);

      expect(geoResult.key).toEqual("0,0");
      expect(ipResult.key).toEqual("0,0");
      expect(geoResult.geo.lat).toEqual(0);
      expect(ipResult.geo.lng).toEqual(0);
    });
  });
});
