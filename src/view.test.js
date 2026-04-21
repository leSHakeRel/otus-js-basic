import { addElement } from "./view";

describe("addElement", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("should return null when container is undefined", () => {
    const result = addElement(undefined, "div");
    expect(result).toBeNull();
  });

  it("should return null when container is null", () => {
    const result = addElement(null, "div");
    expect(result).toBeNull();
  });

  it("should return null when elementName is undefined", () => {
    const result = addElement(container, undefined);
    expect(result).toBeNull();
  });

  it("should create and append element with text content", () => {
    const result = addElement(container, "p", "Hello World");

    expect(result.tagName).toBe("P");
    expect(result.textContent).toBe("Hello World");
    expect(container.contains(result)).toBe(true);
  });

  it("should add single class name as string", () => {
    const result = addElement(container, "div", "", "my-class");

    expect(result.classList.contains("my-class")).toBe(true);
  });

  it("should add multiple class names as array", () => {
    const result = addElement(container, "div", "", ["class1", "class2"]);

    expect(result.classList.contains("class1")).toBe(true);
    expect(result.classList.contains("class2")).toBe(true);
  });

  it("should not add classes when className is empty string", () => {
    const result = addElement(container, "div", "", "");

    expect(result.classList.length).toBe(0);
  });

  it("should not add text content when elementContent is empty", () => {
    const result = addElement(container, "div", "");

    expect(result.textContent).toBe("");
  });
});
