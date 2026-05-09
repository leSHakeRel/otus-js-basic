/// <reference types="jest" />

jest.mock("./runApp.ts", () => ({
  runApp: jest.fn(),
}));

import { runApp } from "./runApp.ts";

describe("index", () => {
  let mockBody: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBody = document.createElement("body");
    document.body = mockBody;
  });

  it("should call runApp with document.body", () => {
    jest.isolateModules(() => {
      require("./index.ts");
    });

    expect(runApp).toHaveBeenCalledWith(mockBody);
  });

  it("should call runApp exactly once", () => {
    jest.isolateModules(() => {
      require("./index.ts");
    });

    expect(runApp).toHaveBeenCalledTimes(1);
  });
});
