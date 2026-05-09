/// <reference types="jest" />

jest.mock("./weatherSearchView.ts", () => ({
  renderWeatherSearch: jest.fn(),
  setSearchType: jest.fn(),
  setCityName: jest.fn(),
}));

jest.mock("./weatherResultView.ts", () => ({
  renderWeatherResult: jest.fn(),
}));

jest.mock("./weatherController.ts", () => ({
  initController: jest.fn(),
  fetchWeather: jest.fn(),
  getCurrentWeather: jest.fn(),
}));

jest.mock("./weatherSearchHistoryController.ts", () => ({
  historyController: {
    init: jest.fn(),
    addCity: jest.fn(),
  },
}));

jest.mock("./weatherStorageService.ts", () => ({
  weatherStorage: {
    addToHistory: jest.fn(),
    getLastCity: jest.fn(),
  },
}));

jest.mock("./aboutView.ts", () => ({
  renderAbout: jest.fn(),
}));

jest.mock("./router.ts", () => ({
  router: {
    addRoute: jest.fn(),
    setNotFoundHandler: jest.fn(),
    getCurrentParams: jest.fn(),
    getCurrentPath: jest.fn().mockReturnValue("/"),
  },
}));

import { runApp } from "./runApp.ts";
import { bus } from "./eventbus.ts";
import { router } from "./router.ts";

describe("runApp", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    bus.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should create main container div", () => {
    runApp(container);

    const mainContainer = container.querySelector(".main-container");
    expect(mainContainer).toBeTruthy();
    expect(mainContainer instanceof HTMLElement).toBe(true);
  });

  it("should render weather search view", () => {
    const { renderWeatherSearch } = jest.requireMock("./weatherSearchView.ts");

    runApp(container);

    expect(renderWeatherSearch).toHaveBeenCalled();
  });

  it("should render weather result view", () => {
    const { renderWeatherResult } = jest.requireMock("./weatherResultView.ts");

    runApp(container);

    expect(renderWeatherResult).toHaveBeenCalled();
  });

  it("should initialize weather controller", () => {
    const { initController } = jest.requireMock("./weatherController.ts");

    runApp(container);

    expect(initController).toHaveBeenCalled();
  });

  it("should initialize history controller", () => {
    const { historyController } = jest.requireMock(
      "./weatherSearchHistoryController.ts",
    );

    runApp(container);

    expect(historyController.init).toHaveBeenCalled();
  });

  it("should setup weather:addCity event listener", () => {
    const { weatherStorage } = jest.requireMock("./weatherStorageService.ts");
    const { historyController } = jest.requireMock(
      "./weatherSearchHistoryController.ts",
    );

    runApp(container);

    bus.emit("weather:addCity", "Moscow");

    expect(historyController.addCity).toHaveBeenCalledWith("Moscow");
    expect(weatherStorage.addToHistory).toHaveBeenCalledWith("Moscow");
  });

  it("should setup search:submit event listener", () => {
    const { fetchWeather } = jest.requireMock("./weatherController.ts");

    runApp(container);

    bus.emit("search:submit", { type: "city", cityName: "Paris" });

    expect(fetchWeather).toHaveBeenCalledWith({
      type: "city",
      cityName: "Paris",
    });
  });

  it("should handle invalid element", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    runApp(null as unknown as HTMLElement);

    expect(consoleSpy).toHaveBeenCalledWith("element null is not object");

    consoleSpy.mockRestore();
  });

  it("should create data container section", () => {
    runApp(container);

    const dataContainer = container.querySelector(".row");
    expect(dataContainer).toBeTruthy();
  });

  it("should create result container section", () => {
    runApp(container);

    const resultContainer = container.querySelector(".row");
    expect(resultContainer).toBeTruthy();
  });

  it("should create search history container section", () => {
    runApp(container);

    const historyContainer = container.querySelector(".row");
    expect(historyContainer).toBeTruthy();
  });

  it("should setup routes for /", () => {
    const { router } = jest.requireMock("./router.ts");

    runApp(container);

    expect(router.addRoute).toHaveBeenCalledWith("/", expect.any(Function));
  });

  it("should setup routes for /main", () => {
    const { router } = jest.requireMock("./router.ts");

    runApp(container);

    expect(router.addRoute).toHaveBeenCalledWith("/main", expect.any(Function));
  });

  it("should setup routes for /weather/:city", () => {
    const { router } = jest.requireMock("./router.ts");

    runApp(container);

    expect(router.addRoute).toHaveBeenCalledWith(
      "/weather/:city",
      expect.any(Function),
    );
  });

  it("should setup routes for /about", () => {
    const { router } = jest.requireMock("./router.ts");

    runApp(container);

    expect(router.addRoute).toHaveBeenCalledWith(
      "/about",
      expect.any(Function),
    );
  });

  it("should setup 404 handler", () => {
    const { router } = jest.requireMock("./router.ts");

    runApp(container);

    expect(router.setNotFoundHandler).toHaveBeenCalled();
  });

  it("should render about page when navigating to /about", async () => {
    const { renderAbout } = jest.requireMock("./aboutView.ts");
    const { router } = jest.requireMock("./router.ts");

    let aboutHandler: (() => Promise<void>) | undefined;
    (router.addRoute as jest.Mock).mockImplementation(
      (path: string, handler: () => Promise<void>) => {
        if (path === "/about") {
          aboutHandler = handler;
        }
      },
    );

    runApp(container);

    const mainContainer = container.querySelector(".main-container")!;

    if (aboutHandler) {
      await aboutHandler();
    }

    expect(renderAbout).toHaveBeenCalledWith(mainContainer);
  });

  it("should fetch weather when navigating to /weather/:city", async () => {
    const { fetchWeather } = jest.requireMock("./weatherController.ts");
    const { router } = jest.requireMock("./router.ts");

    let weatherHandler:
      | ((pathname: string, params: { city: string }) => Promise<void>)
      | undefined;
    (router.addRoute as jest.Mock).mockImplementation(
      (path: string, handler: any) => {
        if (path === "/weather/:city") {
          weatherHandler = handler;
        }
      },
    );

    runApp(container);

    if (weatherHandler) {
      await weatherHandler("/weather/moscow", { city: "moscow" });
    }

    expect(fetchWeather).toHaveBeenCalledWith({
      type: "city",
      cityName: "moscow",
    });
  });

  it("should fetch auto weather when navigating to /", async () => {
    const { fetchWeather } = jest.requireMock("./weatherController.ts");
    const { router } = jest.requireMock("./router.ts");

    let rootHandler: (() => Promise<void>) | undefined;
    (router.addRoute as jest.Mock).mockImplementation(
      (path: string, handler: () => Promise<void>) => {
        if (path === "/") {
          rootHandler = handler;
        }
      },
    );

    runApp(container);

    if (rootHandler) {
      await rootHandler();
    }

    expect(fetchWeather).toHaveBeenCalledWith({ type: "auto" });
  });

  it("should reinitialize UI when navigating to /main", async () => {
    const { renderWeatherSearch } = jest.requireMock("./weatherSearchView.ts");
    const { renderWeatherResult } = jest.requireMock("./weatherResultView.ts");
    const { historyController } = jest.requireMock(
      "./weatherSearchHistoryController.ts",
    );
    const { router } = jest.requireMock("./router.ts");

    let mainHandler: (() => Promise<void>) | undefined;
    (router.addRoute as jest.Mock).mockImplementation(
      (path: string, handler: () => Promise<void>) => {
        if (path === "/main") {
          mainHandler = handler;
        }
      },
    );

    runApp(container);

    if (mainHandler) {
      await mainHandler();
    }

    expect(renderWeatherSearch).toHaveBeenCalled();
    expect(renderWeatherResult).toHaveBeenCalled();
    expect(historyController.init).toHaveBeenCalled();
  });
});
