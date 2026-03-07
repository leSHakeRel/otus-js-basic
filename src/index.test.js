import { runApp } from "./runApp.js";

jest.mock("./runApp.js", () => ({
  runApp: jest.fn(),
}));

describe("main application entry point", () => {
  let originalDocumentBody;

  beforeEach(() => {
    jest.clearAllMocks();
    originalDocumentBody = document.body;
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test('should import and call runApp with document.body and "Hello, world!"', () => {
    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(runApp).toHaveBeenCalledTimes(1);
    expect(runApp).toHaveBeenCalledWith(document.body, "Hello, world!");
  });

  test("should call runApp only once", () => {
    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(runApp).toHaveBeenCalledTimes(1);
  });

  test("should not call runApp before module import", () => {
    expect(runApp).not.toHaveBeenCalled();
  });

  test('should pass the exact string "Hello, world!" as second argument', () => {
    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(runApp).toHaveBeenCalledWith(expect.any(Object), "Hello, world!");

    const [firstArg, secondArg] = runApp.mock.calls[0];
    expect(secondArg).toBe("Hello, world!");
    expect(secondArg).toEqual(expect.stringMatching(/^Hello, world!$/));
    expect(secondArg.length).toBe(13);
  });

  test("should pass document.body as first argument", () => {
    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(runApp).toHaveBeenCalledWith(document.body, expect.any(String));

    const [firstArg] = runApp.mock.calls[0];
    expect(firstArg).toBe(document.body);
    expect(firstArg).toBeInstanceOf(HTMLElement);
    expect(firstArg.tagName).toBe("BODY");
  });
});

describe("integration tests with actual runApp implementation", () => {
  beforeEach(() => {
    jest.unmock("./runApp.js");
    jest.resetModules();
    document.body.innerHTML = "";
  });

  test("should actually update DOM when runApp is called", () => {
    const { runApp: actualRunApp } = require("./runApp.js");

    actualRunApp(document.body, "Integration Test");

    expect(document.body.innerHTML).toBe(
      '<h1 class="neon-text">Integration Test</h1>',
    );
  });

  test("should handle different text in real implementation", () => {
    const { runApp: actualRunApp } = require("./runApp.js");

    actualRunApp(document.body, "Testing 123");

    expect(document.body.innerHTML).toBe(
      '<h1 class="neon-text">Testing 123</h1>',
    );
  });
});

describe("test isolation and module loading", () => {
  test("should isolate module loading to prevent test interference", () => {
    let callCount = 0;

    jest.doMock("./runApp.js", () => ({
      runApp: jest.fn(() => callCount++),
    }));

    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(callCount).toBe(1);
  });

  test("multiple isolates should each call runApp once", () => {
    let totalCalls = 0;

    jest.doMock("./runApp.js", () => ({
      runApp: jest.fn(() => totalCalls++),
    }));

    jest.isolateModules(() => {
      require("./index.js");
    });

    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(totalCalls).toBe(2);
  });
});

describe("error handling and edge cases", () => {
  test("should handle case when document.body is null (theoretically)", () => {
    const originalBody = document.body;

    Object.defineProperty(document, "body", {
      value: null,
      configurable: true,
    });

    jest.isolateModules(() => {
      const { runApp: actualRunApp } = require("./runApp.js");
      actualRunApp(document.body, "Test");
      expect(document.body).toBeNull();
    });

    Object.defineProperty(document, "body", {
      value: originalBody,
      configurable: true,
    });
  });
});

describe("spy on actual runApp implementation", () => {
  test("should spy on runApp without mocking it", () => {
    const actualModule = jest.requireActual("./runApp.js");
    const runAppSpy = jest.spyOn(actualModule, "runApp");

    jest.doMock("./runApp.js", () => ({
      runApp: runAppSpy,
    }));

    jest.isolateModules(() => {
      require("./index.js");
    });

    expect(runAppSpy).toHaveBeenCalledWith(document.body, "Hello, world!");
    expect(runAppSpy).toHaveBeenCalledTimes(1);

    runAppSpy.mockRestore();
  });
});
