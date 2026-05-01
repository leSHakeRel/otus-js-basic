// runApp.test.js
import { runApp } from "./runApp";
import * as weatherSearchView from "./weatherSearchView";
import * as weatherResultView from "./weatherResultView";
import * as weatherController from "./weatherController";
import { weatherStorage } from "./weatherStorageService";
import { historyController } from "./weatherSearchHistoryController";
import { renderAbout } from "./aboutView";
import { addElement } from "./view.js";
import { bus } from "./eventbus.js";
import { router } from "./router.js";

jest.mock("./weatherSearchView");
jest.mock("./weatherResultView");
jest.mock("./weatherController");
jest.mock("./weatherStorageService");
jest.mock("./weatherSearchHistoryController");
jest.mock("./aboutView");
jest.mock("./view.js");
jest.mock("./eventbus.js", () => ({
  bus: {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
  },
}));
jest.mock("./router.js", () => ({
  router: {
    addRoute: jest.fn().mockReturnThis(),
    setNotFoundHandler: jest.fn().mockReturnThis(),
    getCurrentPath: jest.fn(() => "/"),
  },
}));

describe("runApp", () => {
  let mockElement;
  let mockMainContainer;

  beforeEach(() => {
    mockElement = document.createElement("div");
    mockMainContainer = document.createElement("div");

    addElement.mockReturnValue(mockMainContainer);
    weatherSearchView.renderWeatherSearch.mockImplementation(() => {});
    weatherResultView.renderWeatherResult.mockImplementation(() => {});
    weatherController.initController.mockImplementation(() => {});
    weatherController.fetchWeather.mockResolvedValue();
    historyController.init.mockImplementation(() => {});
    historyController.addCity.mockImplementation(() => {});
    weatherStorage.addToHistory.mockImplementation(() => {});
    renderAbout.mockImplementation(() => {});

    bus.on.mockClear();
    router.addRoute.mockClear();
    router.setNotFoundHandler.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("element validation", () => {
    it("should do nothing when element is not an object (null)", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      runApp(null);
      expect(consoleSpy).toHaveBeenCalledWith("element null is not object");
      expect(addElement).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should do nothing when element is undefined", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      runApp(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(
        "element undefined is not object",
      );
      expect(addElement).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should do nothing when element is not an object (number)", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      runApp(123);
      expect(consoleSpy).toHaveBeenCalledWith("element 123 is not object");
      expect(addElement).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should do nothing when element is not an object (string)", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      runApp("invalid");
      expect(consoleSpy).toHaveBeenCalledWith("element invalid is not object");
      expect(addElement).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("initialization", () => {
    it("should create main container and render UI", () => {
      runApp(mockElement);

      expect(addElement).toHaveBeenCalledWith(
        mockElement,
        "div",
        "",
        "main-container",
      );
      expect(weatherSearchView.renderWeatherSearch).toHaveBeenCalledWith(
        mockMainContainer,
      );
      expect(weatherResultView.renderWeatherResult).toHaveBeenCalled();
      expect(historyController.init).toHaveBeenCalled();
    });

    it("should initialize controller", () => {
      runApp(mockElement);

      expect(weatherController.initController).toHaveBeenCalled();
    });
  });

  describe("event subscriptions", () => {
    it("should subscribe to weather:addCity events with historyController", () => {
      runApp(mockElement);

      expect(bus.on).toHaveBeenCalledWith(
        "weather:addCity",
        historyController.addCity,
        { context: historyController },
      );
    });

    it("should subscribe to weather:addCity events with weatherStorage", () => {
      runApp(mockElement);

      expect(bus.on).toHaveBeenCalledWith(
        "weather:addCity",
        weatherStorage.addToHistory,
        { context: weatherStorage },
      );
    });

    it("should subscribe to search:submit event", () => {
      runApp(mockElement);

      expect(bus.on).toHaveBeenCalledWith(
        "search:submit",
        expect.any(Function),
      );
    });

    it("should call fetchWeather when search:submit event is emitted", () => {
      let capturedCallback;
      bus.on.mockImplementation((event, callback) => {
        if (event === "search:submit") {
          capturedCallback = callback;
        }
      });

      runApp(mockElement);

      const searchData = { type: "city", cityName: "London" };
      capturedCallback(searchData);

      expect(weatherController.fetchWeather).toHaveBeenCalledWith(searchData);
    });
  });

  describe("route setup", () => {
    it("should setup all routes", () => {
      runApp(mockElement);

      expect(router.addRoute).toHaveBeenCalledWith("/", expect.any(Function));
      expect(router.addRoute).toHaveBeenCalledWith(
        "/main",
        expect.any(Function),
      );
      expect(router.addRoute).toHaveBeenCalledWith(
        "/weather/:city",
        expect.any(Function),
      );
      expect(router.addRoute).toHaveBeenCalledWith(
        "/about",
        expect.any(Function),
      );
      expect(router.setNotFoundHandler).toHaveBeenCalled();
    });

    it("should handle root route", async () => {
      let rootHandler;
      router.addRoute.mockImplementation((path, handler) => {
        if (path === "/") rootHandler = handler;
        return router;
      });

      runApp(mockElement);
      await rootHandler();

      expect(weatherController.fetchWeather).toHaveBeenCalledWith({
        type: "auto",
      });
    });

    it("should handle main route - reinitialize UI", async () => {
      let mainHandler;
      router.addRoute.mockImplementation((path, handler) => {
        if (path === "/main") mainHandler = handler;
        return router;
      });

      runApp(mockElement);
      await mainHandler();

      expect(weatherSearchView.renderWeatherSearch).toHaveBeenCalledWith(
        mockMainContainer,
      );
      expect(weatherResultView.renderWeatherResult).toHaveBeenCalled();
      expect(historyController.init).toHaveBeenCalled();
    });

    it("should handle weather route with city param", async () => {
      let weatherHandler;
      router.addRoute.mockImplementation((path, handler) => {
        if (path === "/weather/:city") weatherHandler = handler;
        return router;
      });

      runApp(mockElement);
      await weatherHandler("/weather/paris", { city: "paris" });

      expect(weatherController.fetchWeather).toHaveBeenCalledWith({
        type: "city",
        cityName: "paris",
      });
    });

    it("should handle about route", () => {
      let aboutHandler;
      router.addRoute.mockImplementation((path, handler) => {
        if (path === "/about") aboutHandler = handler;
        return router;
      });

      runApp(mockElement);
      aboutHandler();

      expect(renderAbout).toHaveBeenCalledWith(mockMainContainer);
    });
  });

  describe("navigation active state", () => {
    it("should update active class on route change", () => {
      let routeChangedCallback;
      bus.on.mockImplementation((event, callback) => {
        if (event === "router:routeChanged") {
          routeChangedCallback = callback;
        }
      });

      runApp(mockElement);

      const navLinks = mockMainContainer.querySelectorAll(".nav-link");
      routeChangedCallback({ pathname: "/about" });

      expect(navLinks.length).toBe(1);
    });

    it("should handle root path for active class", () => {
      let routeChangedCallback;
      bus.on.mockImplementation((event, callback) => {
        if (event === "router:routeChanged") {
          routeChangedCallback = callback;
        }
      });

      runApp(mockElement);

      const navLinks = mockMainContainer.querySelectorAll(".nav-link");
      routeChangedCallback({ pathname: "/" });

      expect(navLinks.length).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple route calls", async () => {
      let rootHandler;
      let weatherHandler;
      router.addRoute.mockImplementation((path, handler) => {
        if (path === "/") rootHandler = handler;
        if (path === "/weather/:city") weatherHandler = handler;
        return router;
      });

      runApp(mockElement);

      await rootHandler();
      await weatherHandler("/weather/london", { city: "london" });

      expect(weatherController.fetchWeather).toHaveBeenCalledWith({
        type: "auto",
      });
      expect(weatherController.fetchWeather).toHaveBeenCalledWith({
        type: "city",
        cityName: "london",
      });
    });
  });
});
