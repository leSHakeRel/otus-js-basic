/// <reference types="jest" />
import { historyModel } from "./weatherSearchHistoryModel.ts";

describe("weatherSearchHistoryModel", () => {
  describe("getHistory", () => {
    it("should return history array", () => {
      const result = historyModel.getHistory();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getLastCity", () => {
    it("should return last city from history", () => {
      const result = historyModel.getLastCity();
      expect(result).toBeNull();
    });
  });

  describe("isEmpty", () => {
    it("should return true when history is empty", () => {
      const result = historyModel.isEmpty();
      expect(result).toBe(true);
    });
  });

  describe("getCount", () => {
    it("should return count of cities in history", () => {
      const result = historyModel.getCount();
      expect(result).toBe(0);
    });
  });

  describe("addCity", () => {
    it("should add city to history", () => {
      historyModel.addCity("Moscow");
      const result = historyModel.getHistory();
      expect(result).toContain("Moscow");
    });

    it("should not add duplicate city", () => {
      historyModel.addCity("Moscow");
      historyModel.addCity("Moscow");
      const result = historyModel.getHistory();
      expect(result.filter((city) => city === "Moscow").length).toBe(1);
    });

    it("should add city to the beginning of history", () => {
      historyModel.addCity("London");
      historyModel.addCity("Moscow");
      const result = historyModel.getHistory();
      expect(result[0]).toBe("Moscow");
    });

    it("should limit history to 10 items", () => {
      for (let i = 0; i < 15; i++) {
        historyModel.addCity(`City ${i}`);
      }
      const result = historyModel.getHistory();
      expect(result.length).toBe(10);
    });
  });

  describe("clearHistory", () => {
    it("should clear all history", () => {
      historyModel.addCity("Moscow");
      historyModel.addCity("London");
      historyModel.clearHistory();
      const result = historyModel.getHistory();
      expect(result.length).toBe(0);
    });
  });

  describe("removeCity", () => {
    it("should remove city from history", () => {
      historyModel.addCity("Moscow");
      historyModel.addCity("London");
      historyModel.removeCity("London");
      const result = historyModel.getHistory();
      expect(result).not.toContain("London");
    });

    it("should not affect other cities", () => {
      historyModel.addCity("Moscow");
      historyModel.addCity("London");
      historyModel.removeCity("London");
      const result = historyModel.getHistory();
      expect(result).toContain("Moscow");
    });
  });

  describe("observer pattern", () => {
    it("should notify observers when history changes", () => {
      const observer = jest.fn();
      historyModel.addObserver(observer);
      historyModel.addCity("Moscow");
      expect(observer).toHaveBeenCalledWith(["Moscow"]);
    });

    it("should notify observers with current history", () => {
      const observer = jest.fn();
      historyModel.addObserver(observer);
      historyModel.addCity("Moscow");
      historyModel.addCity("London");
      expect(observer).toHaveBeenCalledWith(["London", "Moscow"]);
    });

    it("should remove observer when removed", () => {
      const observer = jest.fn();
      historyModel.addObserver(observer);
      historyModel.removeObserver(observer);
      historyModel.addCity("Moscow");
      expect(observer).not.toHaveBeenCalled();
    });
  });
});
