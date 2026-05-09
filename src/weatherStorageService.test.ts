/// <reference types="jest" />
import { storage, StorageKeys } from "./storageService.ts";
import { bus } from "./eventbus.ts";
import { weatherStorage } from "./weatherStorageService.ts";

describe("weatherStorageService", () => {
  beforeEach(() => {
    localStorage.clear();
    bus.clear();
    jest.clearAllMocks();
  });

  describe("getSearchHistory", () => {
    it("should return empty array when no history exists", () => {
      const result = weatherStorage.getSearchHistory();

      expect(result).toEqual([]);
    });

    it("should return history array when data exists", () => {
      const history = ["Moscow", "London", "Paris"];
      storage.set(StorageKeys.SEARCH_HISTORY, history);

      const result = weatherStorage.getSearchHistory();

      expect(result).toEqual(history);
    });
  });

  describe("saveSearchHistory", () => {
    it("should save history to storage", () => {
      const history = ["Moscow", "London"];

      weatherStorage.saveSearchHistory(history);

      const storedValue = localStorage.getItem("weather_app_searchHistory");
      expect(storedValue).toBeTruthy();
      expect(JSON.parse(storedValue!)).toEqual(history);
    });
  });

  describe("addToHistory", () => {
    it("should add city to beginning of history", () => {
      const existingHistory = ["London", "Paris"];
      storage.set(StorageKeys.SEARCH_HISTORY, existingHistory);

      const result = weatherStorage.addToHistory("Moscow");

      expect(result[0]).toBe("Moscow");
      expect(result[1]).toBe("London");
    });

    it("should not add duplicate city", () => {
      const existingHistory = ["Moscow", "London"];
      storage.set(StorageKeys.SEARCH_HISTORY, existingHistory);

      const result = weatherStorage.addToHistory("Moscow");

      expect(result.filter((city) => city === "Moscow").length).toBe(1);
      expect(result[0]).toBe("Moscow");
    });

    it("should limit history to maxItems", () => {
      const existingHistory = Array.from({ length: 15 }, (_, i) => `City ${i}`);
      storage.set(StorageKeys.SEARCH_HISTORY, existingHistory);

      const result = weatherStorage.addToHistory("New City", 10);

      expect(result.length).toBe(10);
    });

    it("should emit history:updated event", () => {
      const historyUpdatedSpy = jest.fn();
      bus.on("history:updated", historyUpdatedSpy);

      weatherStorage.addToHistory("Moscow");

      expect(historyUpdatedSpy).toHaveBeenCalledWith(["Moscow"]);
    });

    it("should use default maxItems of 10", () => {
      const existingHistory = Array.from({ length: 15 }, (_, i) => `City ${i}`);
      storage.set(StorageKeys.SEARCH_HISTORY, existingHistory);

      const result = weatherStorage.addToHistory("New City");

      expect(result.length).toBe(10);
    });
  });

  describe("clearHistory", () => {
    it("should remove history from storage", () => {
      storage.set(StorageKeys.SEARCH_HISTORY, ["Moscow", "London"]);

      weatherStorage.clearHistory();

      expect(localStorage.getItem("weather_app_searchHistory")).toBeNull();
    });
  });

  describe("hasHistory", () => {
    it("should return false when history is empty", () => {
      const result = weatherStorage.hasHistory();

      expect(result).toBe(false);
    });

    it("should return true when history has items", () => {
      storage.set(StorageKeys.SEARCH_HISTORY, ["Moscow"]);

      const result = weatherStorage.hasHistory();

      expect(result).toBe(true);
    });
  });

  describe("getLastCity", () => {
    it("should return null when history is empty", () => {
      const result = weatherStorage.getLastCity();

      expect(result).toBeNull();
    });

    it("should return first city from history", () => {
      const history = ["Moscow", "London", "Paris"];
      storage.set(StorageKeys.SEARCH_HISTORY, history);

      const result = weatherStorage.getLastCity();

      expect(result).toBe("Moscow");
    });
  });

  describe("removeFromHistory", () => {
    it("should remove city from history", () => {
      const history = ["Moscow", "London", "Paris"];
      storage.set(StorageKeys.SEARCH_HISTORY, history);

      weatherStorage.removeFromHistory("London");

      const result = weatherStorage.getSearchHistory();
      expect(result).not.toContain("London");
      expect(result).toContain("Moscow");
      expect(result).toContain("Paris");
    });

    it("should not affect other cities", () => {
      const history = ["Moscow", "London", "Paris"];
      storage.set(StorageKeys.SEARCH_HISTORY, history);

      weatherStorage.removeFromHistory("London");

      const result = weatherStorage.getSearchHistory();
      expect(result.length).toBe(2);
    });
  });
});
