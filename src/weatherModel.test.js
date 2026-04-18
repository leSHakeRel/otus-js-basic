import { createWeatherModel } from "./weatherModel";

describe("createWeatherModel", () => {
  const mockApiData = {
    temperature: 22,
    weatherText: "Sunny",
    weatherIcon: 1,
    windSpeed: 15,
    windDirection: "N",
    windDirectionDegrees: 0,
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    realFeel: 21,
  };

  const mockLocation = {
    name: "London",
    geo: { lat: 51.5, lng: -0.1 },
  };

  it("should create weather model with all properties", () => {
    const result = createWeatherModel(mockApiData, mockLocation);

    expect(result.status).toBe(true);
    expect(result.message).toBe("");
    expect(result.temperature).toBe(22);
    expect(result.weatherText).toBe("Sunny");
    expect(result.weatherIcon).toBe(1);
    expect(result.windSpeed).toBe(15);
    expect(result.windDirection).toBe("N");
    expect(result.windDirectionDegrees).toBe(0);
    expect(result.pressure).toBe(1013);
    expect(result.visibility).toBe(10);
    expect(result.uvIndex).toBe(5);
    expect(result.realFeel).toBe(21);
    expect(result.location).toBe(mockLocation);
  });

  it("should calculate pressure in mmHg correctly", () => {
    const result = createWeatherModel(mockApiData, mockLocation);

    expect(result.getPressureInMM()).toBe(Math.round(1013 * 0.7506));
  });

  it("should return null for pressure in mmHg when pressure is null", () => {
    const dataWithNullPressure = { ...mockApiData, pressure: null };
    const result = createWeatherModel(dataWithNullPressure, mockLocation);

    expect(result.getPressureInMM()).toBeNull();
  });

  it("should return null for pressure in mmHg when pressure is undefined", () => {
    const dataWithUndefinedPressure = { ...mockApiData, pressure: undefined };
    const result = createWeatherModel(dataWithUndefinedPressure, mockLocation);

    expect(result.getPressureInMM()).toBeNull();
  });
});
