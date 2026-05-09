/// <reference types="jest" />

jest.mock("./weatherSearchHistoryModel.ts", () => ({
  historyModel: {
    addObserver: jest.fn(),
    getHistory: jest.fn(() => ["Moscow", "London"]),
    addCity: jest.fn(),
    clearHistory: jest.fn(),
    removeCity: jest.fn(),
    getLastCity: jest.fn(() => "Moscow"),
    isEmpty: jest.fn(() => false),
  },
}));

jest.mock("./weatherSearchHistoryView.ts", () => ({
  historyView: {
    render: jest.fn(),
    update: jest.fn(),
  },
}));

import { historyController } from "./weatherSearchHistoryController.ts";
import { historyModel } from "./weatherSearchHistoryModel.ts";
import { historyView } from "./weatherSearchHistoryView.ts";

describe("weatherSearchHistoryController", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("init", () => {
    it("should call view render with container and controller", () => {
      historyController.init(container);

      expect(historyView.render).toHaveBeenCalledWith(
        container,
        historyController,
      );
    });
  });

  describe("addCity", () => {
    it("should add city to model", () => {
      historyController.addCity("Paris");

      expect(historyModel.addCity).toHaveBeenCalledWith("Paris");
    });

    it("should trim city name before adding", () => {
      historyController.addCity("  Berlin  ");

      expect(historyModel.addCity).toHaveBeenCalledWith("Berlin");
    });

    it("should not add empty city name", () => {
      historyController.addCity("");

      expect(historyModel.addCity).not.toHaveBeenCalled();
    });
  });

  describe("clearHistory", () => {
    it("should call model clearHistory when confirmed", () => {
      (window.confirm as jest.Mock) = jest.fn(() => true);

      historyController.clearHistory();

      expect(historyModel.clearHistory).toHaveBeenCalled();
    });

    it("should not clear history when not confirmed", () => {
      (window.confirm as jest.Mock) = jest.fn(() => false);

      historyController.clearHistory();

      expect(historyModel.clearHistory).not.toHaveBeenCalled();
    });
  });

  describe("removeCity", () => {
    it("should call model removeCity when confirmed", () => {
      (window.confirm as jest.Mock) = jest.fn(() => true);

      historyController.removeCity("Moscow");

      expect(historyModel.removeCity).toHaveBeenCalledWith("Moscow");
    });

    it("should not remove city when not confirmed", () => {
      (window.confirm as jest.Mock) = jest.fn(() => false);

      historyController.removeCity("Moscow");

      expect(historyModel.removeCity).not.toHaveBeenCalled();
    });
  });

  describe("getHistory", () => {
    it("should return history from model", () => {
      const result = historyController.getHistory();

      expect(result).toEqual(["Moscow", "London"]);
    });
  });

  describe("getLastCity", () => {
    it("should return last city from model", () => {
      const result = historyController.getLastCity();

      expect(result).toBe("Moscow");
    });
  });

  describe("isEmpty", () => {
    it("should return true when history is empty", () => {
      historyModel.isEmpty = jest.fn(() => true);

      const result = historyController.isEmpty();

      expect(result).toBe(true);
    });

    it("should return false when history is not empty", () => {
      historyModel.isEmpty = jest.fn(() => false);

      const result = historyController.isEmpty();

      expect(result).toBe(false);
    });
  });
});
