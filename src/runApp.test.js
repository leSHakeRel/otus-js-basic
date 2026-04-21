import { runApp } from "./runApp";
import * as weatherSearchView from "./weatherSearchView";
import * as weatherResultView from "./weatherResultView";
import * as weatherController from "./weatherController";
import { addElement } from "./view.js";

jest.mock("./weatherSearchView");
jest.mock("./weatherResultView");
jest.mock("./weatherController");
jest.mock("./view.js");

describe("runApp", () => {
  let mockElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
    addElement.mockReturnValue(document.createElement("div"));
    weatherSearchView.renderWeatherSearch.mockImplementation(
      (container, callback) => {},
    );
    weatherResultView.renderWeatherResult.mockImplementation(() => {});
    weatherController.initController.mockImplementation(() => {});
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

  it("should pass callback to renderWeatherSearch that calls fetchWeather", () => {
    let capturedCallback;
    weatherSearchView.renderWeatherSearch.mockImplementation(
      (container, callback) => {
        capturedCallback = callback;
      },
    );

    runApp(mockElement);

    const searchData = { type: "city", cityName: "London" };
    capturedCallback(searchData);

    expect(weatherController.fetchWeather).toHaveBeenCalledWith(searchData);
  });
});
