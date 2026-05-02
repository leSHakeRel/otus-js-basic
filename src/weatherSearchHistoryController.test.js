import { historyController } from "./weatherSearchHistoryController.js";
import { historyModel } from "./weatherSearchHistoryModel.js";
import { historyView } from "./weatherSearchHistoryView.js";

jest.mock("./weatherSearchHistoryModel.js");
jest.mock("./weatherSearchHistoryView.js");

describe("WeatherSearchHistoryController", () => {
  let mockContainer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer = document.createElement("div");
    historyModel.addObserver.mockImplementation((observer) => {
      historyModel.observers = [observer];
    });
  });

  describe("init", () => {
    it("should initialize view with container and controller", () => {
      historyController.init(mockContainer);

      expect(historyView.render).toHaveBeenCalledWith(
        mockContainer,
        historyController,
      );
    });
  });

  describe("onHistoryChanged", () => {
    it("should update view with new history", () => {
      const mockHistory = ["Moscow", "London"];
      historyController.init(mockContainer);

      historyController.onHistoryChanged(mockHistory);

      expect(historyView.update).toHaveBeenCalledWith(mockHistory);
    });
  });

  describe("addCity", () => {
    it("should add city to model when cityName is valid", () => {
      historyController.addCity("Moscow");

      expect(historyModel.addCity).toHaveBeenCalledWith("Moscow");
    });

    it("should trim city name", () => {
      historyController.addCity("  Moscow  ");

      expect(historyModel.addCity).toHaveBeenCalledWith("Moscow");
    });

    it("should not add empty city name", () => {
      historyController.addCity("");
      historyController.addCity("   ");

      expect(historyModel.addCity).not.toHaveBeenCalled();
    });

    it("should not add null or undefined", () => {
      historyController.addCity(null);
      historyController.addCity(undefined);

      expect(historyModel.addCity).not.toHaveBeenCalled();
    });
  });

  describe("clearHistory", () => {
    let confirmSpy;

    beforeEach(() => {
      confirmSpy = jest.spyOn(window, "confirm");
    });

    afterEach(() => {
      confirmSpy.mockRestore();
    });

    it("should clear history when confirmed", () => {
      confirmSpy.mockReturnValue(true);

      historyController.clearHistory();

      expect(confirmSpy).toHaveBeenCalledWith(
        "Вы уверены, что хотите очистить всю историю поиска?",
      );
      expect(historyModel.clearHistory).toHaveBeenCalled();
    });

    it("should not clear history when cancelled", () => {
      confirmSpy.mockReturnValue(false);

      historyController.clearHistory();

      expect(historyModel.clearHistory).not.toHaveBeenCalled();
    });
  });

  describe("removeCity", () => {
    let confirmSpy;

    beforeEach(() => {
      confirmSpy = jest.spyOn(window, "confirm");
    });

    afterEach(() => {
      confirmSpy.mockRestore();
    });

    it("should remove city when confirmed", () => {
      confirmSpy.mockReturnValue(true);

      historyController.removeCity("Moscow");

      expect(confirmSpy).toHaveBeenCalledWith(
        'Удалить "Moscow" из истории поиска?',
      );
      expect(historyModel.removeCity).toHaveBeenCalledWith("Moscow");
    });

    it("should not remove city when cancelled", () => {
      confirmSpy.mockReturnValue(false);

      historyController.removeCity("Moscow");

      expect(historyModel.removeCity).not.toHaveBeenCalled();
    });
  });

  describe("getHistory", () => {
    it("should return history from model", () => {
      const mockHistory = ["Moscow", "London"];
      historyModel.getHistory.mockReturnValue(mockHistory);

      const result = historyController.getHistory();

      expect(result).toEqual(mockHistory);
      expect(historyModel.getHistory).toHaveBeenCalled();
    });
  });
});
