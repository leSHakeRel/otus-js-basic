// weatherSearchHistoryView.test.js
import { historyView } from "./weatherSearchHistoryView.js";

// Мокаем CSS
jest.mock("./weatherSearchHistoryView.css", () => ({}));

describe("WeatherSearchHistoryView", () => {
  let container;
  let mockController;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    mockController = {
      clearHistory: jest.fn(),
      removeCity: jest.fn(),
      getHistory: jest.fn().mockReturnValue([]),
      addCity: jest.fn(),
      getLastCity: jest.fn(),
      isEmpty: jest.fn(),
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  describe("render", () => {
    it("should create DOM structure", () => {
      mockController.getHistory.mockReturnValue([]);

      historyView.render(container, mockController);

      const searchHistoryDiv = container.querySelector(".search-history");
      expect(searchHistoryDiv).toBeTruthy();

      const heading = container.querySelector("h3");
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("История поиска");

      const historyListContainer = container.querySelector(
        ".history-list-container",
      );
      expect(historyListContainer).toBeTruthy();

      const historyList = container.querySelector(".history-list");
      expect(historyList).toBeTruthy();
    });

    it("should store container and controller references", () => {
      mockController.getHistory.mockReturnValue([]);

      historyView.render(container, mockController);

      expect(historyView.container).toBe(container);
      expect(historyView.controller).toBe(mockController);
    });

    it("should clear container before rendering", () => {
      container.innerHTML = "<div>Existing content</div>";
      mockController.getHistory.mockReturnValue([]);

      historyView.render(container, mockController);

      expect(container.innerHTML).not.toContain("Existing content");
    });
  });

  describe("update", () => {
    beforeEach(() => {
      mockController.getHistory.mockReturnValue([]);
      historyView.render(container, mockController);
    });

    it("should render empty state when history is empty", () => {
      historyView.update([]);

      const emptyDiv = container.querySelector(".empty-history");
      expect(emptyDiv).toBeTruthy();
      expect(emptyDiv.textContent).toContain("История поиска пуста");

      const clearButton = container.querySelector(".clear-history-btn");
      expect(clearButton).toBeTruthy();
      expect(clearButton.disabled).toBe(true);
    });

    it("should render empty state when history is null", () => {
      historyView.update(null);

      const emptyDiv = container.querySelector(".empty-history");
      expect(emptyDiv).toBeTruthy();
    });

    it("should render history list when history has items", () => {
      const mockHistory = ["Moscow", "London", "Paris"];

      historyView.update(mockHistory);

      const historyItems = container.querySelectorAll(".history-item-wrapper");
      expect(historyItems.length).toBe(3);
    });

    it("should show correct indices in history list", () => {
      const mockHistory = ["Moscow", "London"];

      historyView.update(mockHistory);

      const numbers = container.querySelectorAll(".history-item-number");
      expect(numbers[0].textContent).toContain("1.");
      expect(numbers[1].textContent).toContain("2.");
    });

    it("should create correct links for history items", () => {
      const mockHistory = ["New York", "Los Angeles"];

      historyView.update(mockHistory);

      const links = container.querySelectorAll(".history-item");
      expect(links[0].getAttribute("href")).toBe("/weather/New%20York");
      expect(links[1].getAttribute("href")).toBe("/weather/Los%20Angeles");
    });

    it("should have data-router-link attribute on links", () => {
      const mockHistory = ["Moscow"];

      historyView.update(mockHistory);

      const link = container.querySelector(".history-item");
      expect(link.getAttribute("data-router-link")).toBe("");
    });

    it("should include remove buttons for each history item", () => {
      const mockHistory = ["Moscow", "London"];

      historyView.update(mockHistory);

      const removeButtons = container.querySelectorAll(".remove-history-item");
      expect(removeButtons.length).toBe(2);
      expect(removeButtons[0].getAttribute("data-city")).toBe("Moscow");
      expect(removeButtons[1].getAttribute("data-city")).toBe("London");
    });
  });

  describe("event handling", () => {
    beforeEach(() => {
      const mockHistory = ["Moscow", "London", "Paris"];
      mockController.getHistory.mockReturnValue(mockHistory);
      historyView.render(container, mockController);
    });

    it("should call controller.clearHistory when clear button clicked", () => {
      const clearButton = container.querySelector(".clear-history-btn");
      clearButton.click();

      expect(mockController.clearHistory).toHaveBeenCalled();
    });

    it("should call controller.removeCity when remove button clicked", () => {
      const removeButton = container.querySelector(".remove-history-item");
      removeButton.click();

      expect(mockController.removeCity).toHaveBeenCalledWith("Moscow");
    });

    it("should not call removeCity when city data is missing", () => {
      const removeButton = container.querySelector(".remove-history-item");
      removeButton.dataset.city = "";
      removeButton.click();

      expect(mockController.removeCity).not.toHaveBeenCalled();
    });

    it("should handle click on different remove buttons", () => {
      const removeButtons = container.querySelectorAll(".remove-history-item");

      removeButtons[1].click();
      expect(mockController.removeCity).toHaveBeenCalledWith("London");

      removeButtons[2].click();
      expect(mockController.removeCity).toHaveBeenCalledWith("Paris");
    });
  });

  describe("renderHistoryItem", () => {
    beforeEach(() => {
      mockController.getHistory.mockReturnValue([]);
      historyView.render(container, mockController);
    });

    it("should generate correct HTML for history item", () => {
      const html = historyView.renderHistoryItem("Moscow", 0);

      expect(html).toContain('data-city="Moscow"');
      expect(html).toContain("/weather/Moscow");
      expect(html).toContain("history-item-number");
      expect(html).toContain("1.");
      expect(html).toContain("history-item-name");
      expect(html).toContain("Moscow");
      expect(html).toContain("remove-history-item");
    });

    it("should encode special characters in city name", () => {
      const html = historyView.renderHistoryItem("New York", 0);

      expect(html).toContain("/weather/New%20York");
    });

    it("should handle city names with special characters", () => {
      const html = historyView.renderHistoryItem("Los Ángeles", 0);

      expect(html).toContain("/weather/Los%20%C3%81ngeles");
    });
  });

  describe("renderEmpty", () => {
    beforeEach(() => {
      mockController.getHistory.mockReturnValue([]);
      historyView.render(container, mockController);

      // Очищаем historyList для теста renderEmpty
      historyView.elements.historyList.innerHTML = "";
    });

    it("should render empty state message", () => {
      historyView.renderEmpty();

      const emptyDiv = container.querySelector(".empty-history");
      expect(emptyDiv).toBeTruthy();
      const emptyParagraph = emptyDiv.querySelector("p");
      if (emptyParagraph) {
        expect(emptyParagraph.textContent).toBe("История поиска пуста");
      }
    });

    it("should render hint text", () => {
      historyView.renderEmpty();

      const hint = container.querySelector(".empty-hint");
      expect(hint).toBeTruthy();
      expect(hint.textContent).toBe(
        "Найдите погоду в городе, чтобы добавить её в историю",
      );
    });

    it("should render disabled clear button", () => {
      historyView.renderEmpty();

      const clearButton = container.querySelector(".clear-history-btn");
      expect(clearButton).toBeTruthy();
      expect(clearButton.disabled).toBe(true);
    });
  });

  describe("renderHistory", () => {
    beforeEach(() => {
      mockController.getHistory.mockReturnValue([]);
      historyView.render(container, mockController);
    });

    it("should render history items", () => {
      const mockHistory = ["Moscow", "London"];

      historyView.renderHistory(mockHistory);

      const historyItems = container.querySelectorAll(".history-item-wrapper");
      expect(historyItems.length).toBe(2);
    });

    it("should render clear button when history has items", () => {
      const mockHistory = ["Moscow"];

      historyView.renderHistory(mockHistory);

      const clearButton = container.querySelector(".clear-history-btn");
      expect(clearButton).toBeTruthy();
      expect(clearButton.disabled).toBeFalsy();
    });
  });

  describe("createDOM", () => {
    it("should create DOM when container exists", () => {
      historyView.container = container;

      historyView.createDOM();

      expect(historyView.elements.historyList).toBeTruthy();
      expect(container.querySelector(".search-history")).toBeTruthy();
    });

    it("should reset container innerHTML", () => {
      container.innerHTML = "<div>Existing</div>";
      historyView.container = container;

      historyView.createDOM();

      expect(container.innerHTML).not.toContain("Existing");
      expect(container.querySelector(".search-history")).toBeTruthy();
    });
  });

  describe("attachEvents", () => {
    beforeEach(() => {
      mockController.getHistory.mockReturnValue(["Moscow"]);
      historyView.render(container, mockController);
    });

    it("should not attach events when container is null", () => {
      historyView.container = null;

      expect(() => historyView.attachEvents()).not.toThrow();
    });

    it("should attach events when container exists", () => {
      historyView.container = container;

      expect(() => historyView.attachEvents()).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle update when history list element is missing", () => {
      historyView.elements.historyList = null;

      expect(() => historyView.update(["Moscow"])).not.toThrow();
    });

    it("should handle update when container is null", () => {
      historyView.container = null;
      mockController.getHistory.mockReturnValue(["Moscow"]);

      expect(() => historyView.render(null, mockController)).not.toThrow();
    });

    it("should handle large history list (max 10 items)", () => {
      const largeHistory = Array.from({ length: 10 }, (_, i) => `City${i + 1}`);
      mockController.getHistory.mockReturnValue(largeHistory);

      historyView.render(container, mockController);

      const historyItems = container.querySelectorAll(".history-item-wrapper");
      expect(historyItems.length).toBe(10);
    });
  });
});
