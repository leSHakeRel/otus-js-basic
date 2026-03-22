import { runApp } from "./runApp";
import { getWeatherData } from "./weatherApi";
import { getWeatherSearchUI } from "./weatherSearch";
import { getWeatherResultUI, setWeatherData } from "./weatherResult";

jest.mock("./weatherApi");
jest.mock("./weatherSearch");
jest.mock("./weatherResult");

describe("runApp", () => {
  let mockElement;
  let mockForm;
  let mockMainContainer;
  let mockResultContainer;

  beforeEach(() => {
    jest.clearAllMocks();

    mockForm = document.createElement("form");
    mockForm.id = "locationForm";
    mockForm.addEventListener = jest.fn();

    mockElement = {
      append: jest.fn(),
      querySelector: jest.fn().mockReturnValue(mockForm),
    };

    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === "div") {
        mockMainContainer = {
          classList: {
            add: jest.fn(),
          },
          append: jest.fn(),
        };
        return mockMainContainer;
      }
      if (tag === "section") {
        mockResultContainer = {
          classList: {
            add: jest.fn(),
          },
        };
        return mockResultContainer;
      }
      return {};
    });
  });

  test("should log a warning if element is not an object", () => {
    console.warn = jest.fn();

    runApp(null);

    expect(console.warn).toHaveBeenCalledWith("element null is not object");
  });

  test("should create main container and append it to the element", () => {
    runApp(mockElement);

    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(mockMainContainer.classList.add).toHaveBeenCalledWith(
      "main-container",
    );
    expect(mockElement.append).toHaveBeenCalledWith(mockMainContainer);
  });

  test("should call getWeatherSearchUI with mainContainer", () => {
    runApp(mockElement);

    expect(getWeatherSearchUI).toHaveBeenCalledWith(mockMainContainer);
  });

  test("should find the form and add submit event listener", () => {
    runApp(mockElement);

    expect(mockElement.querySelector).toHaveBeenCalledWith("#locationForm");
    expect(mockForm.addEventListener).toHaveBeenCalledWith(
      "submit",
      expect.any(Function),
    );
  });

  test("should create and append resultContainer with correct class", () => {
    runApp(mockElement);

    expect(document.createElement).toHaveBeenCalledWith("section");
    expect(mockResultContainer.classList.add).toHaveBeenCalledWith("row");
    expect(getWeatherResultUI).toHaveBeenCalledWith(mockResultContainer);
    expect(mockMainContainer.append).toHaveBeenCalledWith(mockResultContainer);
  });

  describe("form submit handler", () => {
    let submitHandler;

    beforeEach(() => {
      runApp(mockElement);

      submitHandler = mockForm.addEventListener.mock.calls.find(
        (call) => call[0] === "submit",
      )[1];
    });

    test("should handle form submit with correct data", async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
      };

      const mockFormData = {
        get: jest
          .fn()
          .mockReturnValueOnce("city")
          .mockReturnValueOnce("London"),
      };
      global.FormData = jest.fn().mockReturnValue(mockFormData);

      const mockWeatherResponse = {
        weather: {
          temperature: 20,
          condition: "sunny",
        },
        location: {
          queryCityName: "London",
          country: "UK",
          localizedName: "London",
          geo: {
            lat: 51.5,
            lng: -0.1,
          },
        },
      };

      getWeatherData.mockResolvedValue(mockWeatherResponse);

      await submitHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(FormData).toHaveBeenCalledWith(mockForm);
      expect(mockFormData.get).toHaveBeenCalledWith("searchType");
      expect(mockFormData.get).toHaveBeenCalledWith("cityName");
      expect(getWeatherData).toHaveBeenCalledWith({
        type: "city",
        cityName: "London",
      });

      expect(setWeatherData).toHaveBeenCalledWith({
        status: true,
        message: "",
        weather: mockWeatherResponse,
      });
    });

    test("should handle form submit with error", async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
      };

      const mockFormData = {
        get: jest
          .fn()
          .mockReturnValueOnce("city")
          .mockReturnValueOnce("InvalidCity"),
      };
      global.FormData = jest.fn().mockReturnValue(mockFormData);

      const mockError = new Error("City not found");
      getWeatherData.mockRejectedValue(mockError);

      await submitHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(getWeatherData).toHaveBeenCalledWith({
        type: "city",
        cityName: "InvalidCity",
      });

      expect(setWeatherData).toHaveBeenCalledWith({
        status: false,
        message: mockError.message,
        weather: undefined,
      });
    });
  });

  test("should not add event listener if form is not found", () => {
    mockElement.querySelector.mockReturnValue(null);

    runApp(mockElement);

    expect(mockElement.querySelector).toHaveBeenCalledWith("#locationForm");
    expect(mockForm.addEventListener).not.toHaveBeenCalled();
  });

  test("should load saved data from localStorage", async () => {
    const mockSavedData = {
      type: "city",
      cityName: "Paris",
    };

    const getItemSpy = jest.spyOn(Storage.prototype, "getItem");
    getItemSpy.mockReturnValue(JSON.stringify(mockSavedData));

    const mockCityRadio = document.createElement("input");
    mockCityRadio.checked = false;
    const mockCityNameInput = document.createElement("input");
    mockCityNameInput.style = {};

    mockElement.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === "#locationForm") return mockForm;
      if (selector === "#cityNameSearch") return mockCityRadio;
      if (selector === ".cityNameInput") return mockCityNameInput;
      return null;
    });

    const mockWeatherResponse = {
      weather: {
        temperature: 25,
        condition: "sunny",
      },
      location: {
        queryCityName: "Paris",
      },
    };
    getWeatherData.mockResolvedValue(mockWeatherResponse);

    runApp(mockElement);

    expect(getItemSpy).toHaveBeenCalledWith("searchData");
    expect(mockCityRadio.checked).toBe(true);
    expect(mockCityNameInput.value).toBe("Paris");
    expect(mockCityNameInput.style.display).toBe("block");
    expect(getWeatherData).toHaveBeenCalledWith(mockSavedData);

    await new Promise(process.nextTick);

    expect(setWeatherData).toHaveBeenCalledWith({
      status: true,
      message: "",
      weather: mockWeatherResponse,
    });

    getItemSpy.mockRestore();
  });
});
