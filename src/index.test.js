import { runApp } from "./runApp";

jest.mock("./runApp", () => ({
  runApp: jest.fn(),
}));

describe("index.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call runApp with document.body", () => {
    require("./index");

    expect(runApp).toHaveBeenCalledTimes(1);
    expect(runApp).toHaveBeenCalledWith(document.body);
  });
});
