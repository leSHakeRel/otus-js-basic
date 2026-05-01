// aboutView.helper.test.js
import { renderAbout } from "./aboutView.js";

// Helper function to find section by heading text
function findSectionByHeading(container, headingText) {
  const sections = container.querySelectorAll(".about-section");
  for (let i = 0; i < sections.length; i++) {
    const heading = sections[i].querySelector("h3");
    if (heading && heading.textContent === headingText) {
      return sections[i];
    }
  }
  return null;
}

describe("AboutView with helpers", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should find technologies section by heading", () => {
    renderAbout(container);

    const techSection = findSectionByHeading(container, "Технологии");
    expect(techSection).toBeTruthy();

    const techList = techSection.querySelectorAll("li");
    expect(techList.length).toBe(5);
  });

  it("should find links section by heading", () => {
    renderAbout(container);

    const linksSection = findSectionByHeading(container, "Ссылки");
    expect(linksSection).toBeTruthy();

    const links = linksSection.querySelectorAll("a");
    expect(links.length).toBe(2);
  });

  it("should not find non-existent section", () => {
    renderAbout(container);

    const nonExistentSection = findSectionByHeading(container, "Non Existent");
    expect(nonExistentSection).toBeNull();
  });
});
