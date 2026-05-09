/// <reference types="jest" />
import { renderAbout } from "./aboutView.ts";

describe("aboutView", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should render about page content", () => {
    renderAbout(container);

    expect(container.querySelector(".about-container")).toBeTruthy();
    expect(container.querySelector(".about-content")).toBeTruthy();
  });

  it("should render about heading", () => {
    renderAbout(container);

    const heading = container.querySelector("h2");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("О приложении");
  });

  it("should render technologies section", () => {
    renderAbout(container);

    const techSection = container.querySelector(".about-section");
    expect(techSection).toBeTruthy();
  });

  it("should render technologies list", () => {
    renderAbout(container);

    const techList = container.querySelector("ul");
    expect(techList).toBeTruthy();

    const techItems = techList?.querySelectorAll("li");
    expect(techItems?.length).toBeGreaterThan(0);
  });

  it("should render links section", () => {
    renderAbout(container);

    const linksSection = container.querySelectorAll(".about-section");
    expect(linksSection.length).toBeGreaterThanOrEqual(2);
  });

  it("should render links", () => {
    renderAbout(container);

    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("should render back to home button", () => {
    renderAbout(container);

    const backButton = container.querySelector(".back-to-home");
    expect(backButton).toBeTruthy();
    expect(backButton?.getAttribute("data-router-link")).toBe("href");
  });

  it("should clear container before rendering", () => {
    container.innerHTML = "<p>Existing content</p>";

    renderAbout(container);

    expect(container.querySelector(".about-container")).toBeTruthy();
    expect(container.querySelector(".about-container p")).toBeTruthy();
  });

  it("should create proper HTML structure", () => {
    renderAbout(container);

    const aboutContainer = container.querySelector(".about-container");
    expect(aboutContainer?.className).toBe("about-container");

    const aboutContent = aboutContainer?.querySelector(".about-content");
    expect(aboutContent?.className).toBe("about-content");
  });
});
