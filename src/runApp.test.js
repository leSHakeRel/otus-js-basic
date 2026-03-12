/**
 * @jest-environment jsdom
 */

import { runApp } from "./runApp";

jest.mock("./style.css", () => ({}), { virtual: true });

describe("runApp function", () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("successful execution with object element", () => {
    test("should set innerHTML with provided text", () => {
      const mockElement = { innerHTML: "" };
      const testText = "Hello, World!";

      runApp(mockElement, testText);

      expect(mockElement.innerHTML).toBe(
        '<h1 class="neon-text">Hello, World!</h1>',
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle empty string as text", () => {
      const mockElement = { innerHTML: "" };
      const testText = "";

      runApp(mockElement, testText);

      expect(mockElement.innerHTML).toBe('<h1 class="neon-text"></h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle text with special characters", () => {
      const mockElement = { innerHTML: "" };
      const testText = "Hello & Welcome to <JavaScript>!";

      runApp(mockElement, testText);

      expect(mockElement.innerHTML).toBe(
        '<h1 class="neon-text">Hello & Welcome to <JavaScript>!</h1>',
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle text with numbers", () => {
      const mockElement = { innerHTML: "" };
      const testText = "12345";

      runApp(mockElement, testText);

      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">12345</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle multiline text", () => {
      const mockElement = { innerHTML: "" };
      const testText = "Hello\nWorld\nTest";

      runApp(mockElement, testText);

      expect(mockElement.innerHTML).toBe(
        '<h1 class="neon-text">Hello\nWorld\nTest</h1>',
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle undefined text parameter", () => {
      const mockElement = { innerHTML: "" };

      runApp(mockElement);

      expect(mockElement.innerHTML).toBe(
        '<h1 class="neon-text">undefined</h1>',
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle null as text parameter", () => {
      const mockElement = { innerHTML: "" };

      runApp(mockElement, null);

      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">null</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle boolean as text parameter", () => {
      const mockElement = { innerHTML: "" };

      runApp(mockElement, true);
      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">true</h1>');

      runApp(mockElement, false);
      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">false</h1>');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle number as text parameter", () => {
      const mockElement = { innerHTML: "" };

      runApp(mockElement, 42);
      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">42</h1>');

      runApp(mockElement, 3.14);
      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">3.14</h1>');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle object as text parameter", () => {
      const mockElement = { innerHTML: "" };
      const testObject = { key: "value" };

      runApp(mockElement, testObject);

      expect(mockElement.innerHTML).toBe(
        '<h1 class="neon-text">[object Object]</h1>',
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle array as text parameter", () => {
      const mockElement = { innerHTML: "" };
      const testArray = [1, 2, 3];

      runApp(mockElement, testArray);

      expect(mockElement.innerHTML).toBe('<h1 class="neon-text">1,2,3</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle function as text parameter", () => {
      const mockElement = { innerHTML: "" };
      const testFunction = () => "test";

      runApp(mockElement, testFunction);

      expect(mockElement.innerHTML).toBe(
        '<h1 class="neon-text">() => "test"</h1>',
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("warning scenarios when element is not object", () => {
    const nonObjectCases = [
      { value: undefined, expectedLog: "element undefined is not object" },
      { value: 42, expectedLog: "element 42 is not object" },
      { value: "string", expectedLog: "element string is not object" },
      { value: true, expectedLog: "element true is not object" },
      { value: false, expectedLog: "element false is not object" },
    ];

    nonObjectCases.forEach(({ value, expectedLog }) => {
      test(`should log warning for ${String(value)} element`, () => {
        const mockElement = { innerHTML: "initial content" };
        const testText = "some text";

        runApp(value, testText);

        expect(mockElement.innerHTML).toBe("initial content");
        expect(consoleWarnSpy).toHaveBeenCalledWith(expectedLog);
      });
    });

    test("should not modify element and log warning for non-object element with various text parameters", () => {
      const mockElement = { innerHTML: "initial" };
      const textCases = ["text", "", null, undefined, 123, true];

      textCases.forEach((text) => {
        runApp("not an object", text);

        expect(mockElement.innerHTML).toBe("initial");
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "element not an object is not object",
        );

        consoleWarnSpy.mockClear();
      });
    });
  });

  describe("edge cases with object-like elements", () => {
    test("should handle array as element", () => {
      const arrayElement = [];
      arrayElement.innerHTML = "";
      const testText = "test";

      runApp(arrayElement, testText);

      expect(arrayElement.innerHTML).toBe('<h1 class="neon-text">test</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle Date object as element", () => {
      const dateElement = new Date();
      dateElement.innerHTML = "";
      const testText = "test";

      runApp(dateElement, testText);

      expect(dateElement.innerHTML).toBe('<h1 class="neon-text">test</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should handle RegExp object as element", () => {
      const regexpElement = /test/;
      regexpElement.innerHTML = "";
      const testText = "test";

      runApp(regexpElement, testText);

      expect(regexpElement.innerHTML).toBe('<h1 class="neon-text">test</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("integration with real DOM (if using jsdom)", () => {
    test("should work with actual DOM element", () => {
      document.body.innerHTML = '<div id="test"></div>';
      const element = document.getElementById("test");
      const testText = "DOM Test";

      runApp(element, testText);

      expect(element.innerHTML).toBe('<h1 class="neon-text">DOM Test</h1>');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test("should override existing content in DOM element", () => {
      document.body.innerHTML = '<div id="test">Old content</div>';
      const element = document.getElementById("test");
      const testText = "New Content";

      runApp(element, testText);

      expect(element.innerHTML).toBe('<h1 class="neon-text">New Content</h1>');
      expect(element.textContent).toBe("New Content");
    });
  });
});
