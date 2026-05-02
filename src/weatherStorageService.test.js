import { weatherStorage } from "./weatherStorageService.js";
import { storage } from "./storageService.js";
import { bus } from "./eventbus.js";

jest.mock("./storageService.js");
jest.mock("./eventbus.js");

describe("WeatherStorageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.get.mockReturnValue([]);
    storage.set.mockReturnValue(true);
    storage.remove.mockReturnValue(true);
  });

  describe("getSearchHistory", () => {
    it("should return search history from storage", () => {
      const mockHistory = ["Moscow", "London"];
      storage.get.mockReturnValue(mockHistory);

      const result = weatherStorage.getSearchHistory();

      expect(storage.get).toHaveBeenCalledWith("searchHistory", []);
      expect(result).toEqual(mockHistory);
    });

    it("should return empty array when no history exists", () => {
      storage.get.mockReturnValue([]);

      const result = weatherStorage.getSearchHistory();

      expect(result).toEqual([]);
    });
  });

  describe("saveSearchHistory", () => {
    it("should save search history to storage", () => {
      const mockHistory = ["Moscow", "London"];

      weatherStorage.saveSearchHistory(mockHistory);

      expect(storage.set).toHaveBeenCalledWith("searchHistory", mockHistory);
    });
  });

  describe("addToHistory", () => {
    it("should add new city to beginning of history", () => {
      const existingHistory = ["London", "Paris"];
      storage.get.mockReturnValue(existingHistory);

      const result = weatherStorage.addToHistory("Moscow");

      expect(result).toEqual(["Moscow", "London", "Paris"]);
      expect(storage.set).toHaveBeenCalledWith("searchHistory", [
        "Moscow",
        "London",
        "Paris",
      ]);
      expect(bus.emit).toHaveBeenCalledWith("history:updated", [
        "Moscow",
        "London",
        "Paris",
      ]);
    });

    it("should remove duplicate city and move to beginning", () => {
      const existingHistory = ["Moscow", "London", "Paris"];
      storage.get.mockReturnValue(existingHistory);

      const result = weatherStorage.addToHistory("London");

      expect(result).toEqual(["London", "Moscow", "Paris"]);
    });

    it("should respect maxItems limit", () => {
      const existingHistory = ["City1", "City2", "City3", "City4", "City5"];
      storage.get.mockReturnValue(existingHistory);

      const result = weatherStorage.addToHistory("NewCity", 3);

      expect(result).toEqual(["NewCity", "City1", "City2"]);
      expect(result.length).toBe(3);
    });
  });

  describe("clearHistory", () => {
    it("should clear search history from storage", () => {
      weatherStorage.clearHistory();

      expect(storage.remove).toHaveBeenCalledWith("searchHistory");
    });
  });

  describe("hasHistory", () => {
    it("should return true when history has items", () => {
      storage.get.mockReturnValue(["Moscow", "London"]);

      expect(weatherStorage.hasHistory()).toBe(true);
    });

    it("should return false when history is empty", () => {
      storage.get.mockReturnValue([]);

      expect(weatherStorage.hasHistory()).toBe(false);
    });
  });

  describe("getLastCity", () => {
    it("should return first city from history", () => {
      storage.get.mockReturnValue(["Moscow", "London", "Paris"]);

      const result = weatherStorage.getLastCity();

      expect(result).toBe("Moscow");
    });

    it("should return null when history is empty", () => {
      storage.get.mockReturnValue([]);

      const result = weatherStorage.getLastCity();

      expect(result).toBeNull();
    });
  });

  describe("removeFromHistory", () => {
    it("should remove specified city from history", () => {
      const existingHistory = ["Moscow", "London", "Paris"];
      storage.get.mockReturnValue(existingHistory);

      weatherStorage.removeFromHistory("London");

      expect(storage.set).toHaveBeenCalledWith("searchHistory", [
        "Moscow",
        "Paris",
      ]);
    });

    it("should do nothing when city not found", () => {
      const existingHistory = ["Moscow", "London"];
      storage.get.mockReturnValue(existingHistory);

      weatherStorage.removeFromHistory("Berlin");

      expect(storage.set).toHaveBeenCalledWith("searchHistory", [
        "Moscow",
        "London",
      ]);
    });
  });
});
