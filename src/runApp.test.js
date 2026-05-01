import { runApp } from "./runApp";
import * as weatherSearchView from "./weatherSearchView";
import * as weatherResultView from "./weatherResultView";
import * as weatherController from "./weatherController";
import { addElement } from "./view.js";
import { bus } from "./eventbus.js";

jest.mock("./weatherSearchView");
jest.mock("./weatherResultView");
jest.mock("./weatherController");
jest.mock("./view.js");
jest.mock("./eventbus.js", () => ({
  bus: {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
  },
}));

describe("runApp", () => {
  let mockElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    addElement.mockReturnValue(document.createElement("div"));
    weatherSearchView.renderWeatherSearch.mockImplementation(() => {});
    weatherResultView.renderWeatherResult.mockImplementation(() => {});
    weatherController.initController.mockImplementation(() => {});
    bus.on.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should do nothing when element is not an object", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    runApp(null);
    expect(consoleSpy).toHaveBeenCalledWith("element null is not object");

    consoleSpy.mockRestore();
  });

  it("should do nothing when element is undefined", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    runApp(undefined);
    expect(consoleSpy).toHaveBeenCalledWith("element undefined is not object");

    consoleSpy.mockRestore();
  });

  it("should create main container and render search view", () => {
    runApp(mockElement);

    expect(addElement).toHaveBeenCalledWith(
      mockElement,
      "div",
      "",
      "main-container",
    );
    expect(weatherSearchView.renderWeatherSearch).toHaveBeenCalled();
  });

  it("should render result view with result container", () => {
    runApp(mockElement);

    expect(weatherResultView.renderWeatherResult).toHaveBeenCalled();
  });

  it("should initialize controller", () => {
    runApp(mockElement);

    expect(weatherController.initController).toHaveBeenCalled();
  });

  it("should subscribe to search:submit event", () => {
    runApp(mockElement);

    expect(bus.on).toHaveBeenCalledWith("search:submit", expect.any(Function));
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
