/// <reference types="jest" />
import { addElement } from "./view.ts";

describe("view", () => {
  describe("addElement", () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement("div");
    });

    it("should create and append element to container", () => {
      const result = addElement(container, "p", "Hello", "test-class");

      expect(result).toBeTruthy();
      expect(result instanceof HTMLElement).toBe(true);
      expect(container.contains(result)).toBe(true);
    });

    it("should set textContent when elementContent is provided", () => {
      const result = addElement(container, "p", "Hello World", "");

      expect(result?.textContent).toBe("Hello World");
    });

    it("should add single class to element", () => {
      const result = addElement(container, "div", "", "my-class");

      expect(result?.classList.contains("my-class")).toBe(true);
    });

    it("should add multiple classes to element", () => {
      const result = addElement(container, "div", "", ["class1", "class2", "class3"]);

      expect(result?.classList.contains("class1")).toBe(true);
      expect(result?.classList.contains("class2")).toBe(true);
      expect(result?.classList.contains("class3")).toBe(true);
    });

    it("should return null when container is null", () => {
      const result = addElement(null as unknown as HTMLElement, "p", "test", "");
      expect(result).toBeNull();
    });

    it("should return null when container is undefined", () => {
      const result = addElement(undefined as unknown as HTMLElement, "p", "test", "");
      expect(result).toBeNull();
    });

    it("should return null when elementName is null", () => {
      const result = addElement(container, null as unknown as string, "", "");
      expect(result).toBeNull();
    });

    it("should return null when elementName is undefined", () => {
      const result = addElement(container, undefined as unknown as string, "", "");
      expect(result).toBeNull();
    });

    it("should return null when elementContent is null", () => {
      const result = addElement(container, "p", null as unknown as string, "");
      expect(result).toBeNull();
    });

    it("should not return null when elementContent is undefined", () => {
      const result = addElement(container, "p", undefined as unknown as string, "");
      expect(result).not.toBeNull();
    });

    it("should return null when className is null", () => {
      const result = addElement(container, "p", "test", null as unknown as string | string[]);
      expect(result).toBeNull();
    });

    it("should not return null when className is undefined", () => {
      const result = addElement(container, "p", "test", undefined as unknown as string | string[]);
      expect(result).not.toBeNull();
    });

    it("should handle empty string className", () => {
      const result = addElement(container, "p", "test", "");
      expect(result).toBeTruthy();
    });

    it("should handle empty string elementContent", () => {
      const result = addElement(container, "p", "", "test-class");
      expect(result).toBeTruthy();
      expect(result?.textContent).toBe("");
    });

    it("should create element with correct tagName", () => {
      const result = addElement(container, "section", "", "test");

      expect(result?.tagName).toBe("SECTION");
    });

    it("should append element to container", () => {
      const result = addElement(container, "span", "text", "span-class");

      expect(container.children.length).toBe(1);
      expect(container.firstChild).toBe(result);
    });
  });
});
