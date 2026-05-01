import { historyModel } from "./weatherSearchHistoryModel.js";
import { weatherStorage } from "./weatherStorageService.js";

jest.mock("./weatherStorageService.js");

describe("WeatherSearchHistoryModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    weatherStorage.getSearchHistory.mockReturnValue([]);
    weatherStorage.saveSearchHistory.mockImplementation(() => {});
  });

  describe("loadHistory", () => {
    it("should load history from storage", () => {
      const mockHistory = ["Moscow", "London"];
      weatherStorage.getSearchHistory.mockReturnValue(mockHistory);

      historyModel.loadHistory();

      expect(historyModel.getHistory()).toEqual(mockHistory);
    });
  });

  describe("getHistory", () => {
    it("should return copy of history array", () => {
      const mockHistory = ["Moscow", "London"];
      weatherStorage.getSearchHistory.mockReturnValue(mockHistory);
      historyModel.loadHistory();

      const result = historyModel.getHistory();

      expect(result).toEqual(mockHistory);
      expect(result).not.toBe(mockHistory); // Should be a copy
    });
  });

  describe("getLastCity", () => {
    it("should return first city from history", () => {
      weatherStorage.getSearchHistory.mockReturnValue(["Moscow", "London"]);
      historyModel.loadHistory();

      const result = historyModel.getLastCity();

      expect(result).toBe("Moscow");
    });

    it("should return null when history is empty", () => {
      weatherStorage.getSearchHistory.mockReturnValue([]);
      historyModel.loadHistory();

      const result = historyModel.getLastCity();

      expect(result).toBeNull();
    });
  });

  describe("isEmpty", () => {
    it("should return true when history is empty", () => {
      weatherStorage.getSearchHistory.mockReturnValue([]);
      historyModel.loadHistory();

      expect(historyModel.isEmpty()).toBe(true);
    });

    it("should return false when history has items", () => {
      weatherStorage.getSearchHistory.mockReturnValue(["Moscow"]);
      historyModel.loadHistory();

      expect(historyModel.isEmpty()).toBe(false);
    });
  });

  describe("getCount", () => {
    it("should return number of cities in history", () => {
      weatherStorage.getSearchHistory.mockReturnValue([
        "Moscow",
        "London",
        "Paris",
      ]);
      historyModel.loadHistory();

      expect(historyModel.getCount()).toBe(3);
    });
  });

  describe("addCity", () => {
    it("should add new city to beginning of history", () => {
      weatherStorage.getSearchHistory.mockReturnValue(["London"]);
      historyModel.loadHistory();

      historyModel.addCity("Moscow");

      expect(historyModel.getHistory()).toEqual(["Moscow", "London"]);
      expect(weatherStorage.saveSearchHistory).toHaveBeenCalledWith([
        "Moscow",
        "London",
      ]);
    });

    it("should remove duplicate city and move to beginning", () => {
      weatherStorage.getSearchHistory.mockReturnValue([
        "Moscow",
        "London",
        "Paris",
      ]);
      historyModel.loadHistory();

      historyModel.addCity("London");

      expect(historyModel.getHistory()).toEqual(["London", "Moscow", "Paris"]);
    });

    it("should limit history to 10 items", () => {
      const tenCities = Array.from({ length: 10 }, (_, i) => `City${i + 1}`);
      weatherStorage.getSearchHistory.mockReturnValue(tenCities);
      historyModel.loadHistory();

      historyModel.addCity("NewCity");

      expect(historyModel.getHistory().length).toBe(10);
      expect(historyModel.getHistory()[0]).toBe("NewCity");
    });
  });

  describe("clearHistory", () => {
    it("should clear all history", () => {
      weatherStorage.getSearchHistory.mockReturnValue(["Moscow", "London"]);
      historyModel.loadHistory();

      historyModel.clearHistory();

      expect(historyModel.getHistory()).toEqual([]);
      expect(weatherStorage.saveSearchHistory).toHaveBeenCalledWith([]);
    });
  });

  describe("removeCity", () => {
    it("should remove specified city from history", () => {
      weatherStorage.getSearchHistory.mockReturnValue([
        "Moscow",
        "London",
        "Paris",
      ]);
      historyModel.loadHistory();

      historyModel.removeCity("London");

      expect(historyModel.getHistory()).toEqual(["Moscow", "Paris"]);
      expect(weatherStorage.saveSearchHistory).toHaveBeenCalledWith([
        "Moscow",
        "Paris",
      ]);
    });
  });

  describe("observer pattern", () => {
    it("should notify observers when history changes", () => {
      const observer = jest.fn();
      historyModel.addObserver(observer);

      weatherStorage.getSearchHistory.mockReturnValue(["Moscow"]);
      historyModel.loadHistory();

      expect(observer).toHaveBeenCalledWith(["Moscow"]);
    });

    it("should support removing observers", () => {
      const observer = jest.fn();
      historyModel.addObserver(observer);
      historyModel.removeObserver(observer);

      weatherStorage.getSearchHistory.mockReturnValue(["Moscow"]);
      historyModel.loadHistory();

      expect(observer).not.toHaveBeenCalled();
    });

    it("should support function observers", () => {
      const observerFunction = jest.fn();
      historyModel.addObserver(observerFunction);

      weatherStorage.getSearchHistory.mockReturnValue(["Moscow"]);
      historyModel.loadHistory();

      expect(observerFunction).toHaveBeenCalledWith(["Moscow"]);
    });

    it("should support object observers with onHistoryChanged method", () => {
      const observerObject = {
        onHistoryChanged: jest.fn(),
      };
      historyModel.addObserver(observerObject);

      weatherStorage.getSearchHistory.mockReturnValue(["Moscow"]);
      historyModel.loadHistory();

      expect(observerObject.onHistoryChanged).toHaveBeenCalledWith(["Moscow"]);
    });
  });
});
