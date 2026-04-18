/**
 * Создание и добавление элемента в контейнер
 * @param { HTMLElement } container - контейнер
 * @param { string } elementName - тэг
 * @param { string } elementContent - текстовые данные элемента
 * @param { string | Array} className - класс/классы нового элемента
 * @returns { HTMLElement } - новый элемент
 */
export function addElement(
  container,
  elementName,
  elementContent = "",
  className = "",
) {
  if (
    container === undefined ||
    container === null ||
    elementName === undefined ||
    elementName === null ||
    elementContent === undefined ||
    elementContent === null ||
    className === undefined ||
    className === null
  )
    return null;

  const element = document.createElement(elementName);
  if (elementContent.length > 0) element.textContent = elementContent;
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
