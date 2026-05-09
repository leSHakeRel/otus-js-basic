/**
 * Создание и добавление элемента в контейнер
 * @param container - контейнер
 * @param elementName - тэг
 * @param elementContent - текстовые данные элемента
 * @param className - класс/классы нового элемента
 * @returns новый элемент
 */
export function addElement(
  container: HTMLElement | null | undefined,
  elementName: string | null | undefined,
  elementContent: string | null | undefined = "",
  className: string | string[] | null | undefined = "",
): HTMLElement | null {
  if (
    container === undefined ||
    container === null ||
    elementName === undefined ||
    elementName === null ||
    elementContent === undefined ||
    elementContent === null ||
    className === undefined ||
    className === null
  ) {
    return null;
  }

  const element = document.createElement(elementName);
  if (elementContent.length > 0) {
    element.textContent = elementContent;
  }
  if (className.length > 0) {
    if (typeof className === "string") {
      element.classList.add(className);
    } else if (className instanceof Array) {
      element.classList.add(...className);
    }
  }
  container.append(element);
  return element;
}
