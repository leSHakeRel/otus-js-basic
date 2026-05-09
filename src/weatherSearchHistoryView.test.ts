/// <reference types="jest" />
import { historyView } from "./weatherSearchHistoryView.ts";

describe("weatherSearchHistoryView", () => {
  let container: HTMLElement;
  let mockController: {
    getHistory: () => string[];
    clearHistory: () => void;
    removeCity: (cityName: string) => void;
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    
    mockController = {
      getHistory: jest.fn(() => ["Moscow", "London"]),
      clearHistory: jest.fn(),
      removeCity: jest.fn(),
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("render", () => {
    it("should render history container", () => {
      historyView.render(container, mockController);

      expect(container.querySelector(".search-history")).toBeTruthy();
      expect(container.querySelector(".history-list")).toBeTruthy();
    });

    it("should create history list items", () => {
      historyView.render(container, mockController);

      const historyItems = container.querySelectorAll(".history-item");
      expect(historyItems.length).toBe(2);
    });

    it("should create clear history button", () => {
      historyView.render(container, mockController);

      const clearButton = container.querySelector(".clear-history-btn");
      expect(clearButton).toBeTruthy();
    });
  });

  describe("update", () => {
    it("should render history items when history is not empty", () => {
      historyView.render(container, mockController);
      
      historyView.update(["Paris", "Berlin"]);

      const historyItems = container.querySelectorAll(".history-item");
      expect(historyItems.length).toBe(2);
    });

    it("should render empty state when history is empty", () => {
      historyView.render(container, mockController);
      
      historyView.update([]);

      const emptyHistory = container.querySelector(".empty-history");
      expect(emptyHistory).toBeTruthy();
    });

    it("should disable clear button when history is empty", () => {
      historyView.render(container, mockController);
      
      historyView.update([]);

      const clearButton = container.querySelector(".clear-history-btn") as HTMLButtonElement;
      expect(clearButton.disabled).toBe(true);
    });
  });

  describe("event handling", () => {
    it("should call clearHistory when clear button is clicked", () => {
      historyView.render(container, mockController);
      
      const clearButton = container.querySelector(".clear-history-btn") as HTMLButtonElement;
      clearButton.click();

      expect(mockController.clearHistory).toHaveBeenCalled();
    });

    it("should call removeCity when remove button is clicked", () => {
      historyView.render(container, mockController);
      
      const removeButton = container.querySelector(".remove-history-item") as HTMLButtonElement;
      removeButton.click();

      expect(mockController.removeCity).toHaveBeenCalledWith("Moscow");
    });
  });

  describe("renderHistoryItem", () => {
    it("should create link with city name", () => {
      historyView.render(container, mockController);
      
      const historyItem = container.querySelector(".history-item") as HTMLAnchorElement;
      expect(historyItem.textContent).toContain("Moscow");
    });

    it("should create remove button with city data", () => {
      historyView.render(container, mockController);
      
      const removeButton = container.querySelector(".remove-history-item") as HTMLButtonElement;
      expect(removeButton.dataset.city).toBe("Moscow");
    });
  });
});
