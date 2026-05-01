// weatherSearchHistoryView.js
import "./weatherSearchHistoryView.css";

class WeatherSearchHistoryView {
  constructor() {
    this.container = null;
    this.controller = null;
    this.elements = {
      historyList: null,
    };
  }

  /**
   * Рендер компонента
   * @param {HTMLElement} container - контейнер для истории
   * @param {Object} controller - контроллер для обработки событий
   */
  render(container, controller) {
    if (!container) return;
    this.container = container;
    this.controller = controller;
    this.createDOM();
    this.attachEvents();
    this.update(controller.getHistory());
  }

  /**
   * Создание DOM структуры
   */
  createDOM() {
    if (!this.container) return;

    this.container.innerHTML = "";

    const historyDiv = document.createElement("div");
    historyDiv.className = "search-history";
    historyDiv.innerHTML = `
      <h3>История поиска</h3>
      <div class="history-list-container">
        <div class="history-list"></div>
      </div>
    `;

    this.container.appendChild(historyDiv);
    this.elements.historyList = historyDiv.querySelector(".history-list");
  }

  /**
   * Прикрепление обработчиков событий
   */
  attachEvents() {
    if (!this.container) return;

    // Делегирование событий для динамических элементов
    this.container.addEventListener("click", (e) => {
      // Обработка кнопки очистки
      if (e.target.classList.contains("clear-history-btn")) {
        this.controller.clearHistory();
      }

      // Обработка удаления конкретного города
      if (e.target.classList.contains("remove-history-item")) {
        const city = e.target.dataset.city;
        if (city) {
          this.controller.removeCity(city);
        }
      }
    });
  }

  /**
   * Обновление представления
   * @param {Array} history - массив городов
   */
  update(history) {
    if (!this.elements.historyList) return;

    if (!history || history.length === 0) {
      this.renderEmpty();
    } else {
      this.renderHistory(history);
    }
  }

  /**
   * Рендер списка истории
   * @param {Array} history - массив городов
   */
  renderHistory(history) {
    this.elements.historyList.innerHTML = `
      <div class="history-items">
        ${history.map((city, index) => this.renderHistoryItem(city, index)).join("")}
      </div>
      <button class="clear-history-btn">
        Очистить всю историю
      </button>
    `;
  }

  /**
   * Рендер одного элемента истории
   * @param {string} city - название города
   * @param {number} index - индекс в списке
   * @returns {string} - HTML строку
   */
  renderHistoryItem(city, index) {
    const encodedCity = encodeURIComponent(city);
    return `
      <div class="history-item-wrapper" data-city="${city}">
        <a href="/weather/${encodedCity}" data-router-link class="history-item">
          <span class="history-item-number">${index + 1}.</span>
          <span class="history-item-name">${city}</span>
        </a>
        <button class="remove-history-item" data-city="${city}" title="Удалить из истории">
          ✕
        </button>
      </div>
    `;
  }

  /**
   * Рендер пустого состояния
   */
  renderEmpty() {
    this.elements.historyList.innerHTML = `
      <div class="empty-history">
        <p>История поиска пуста</p>
        <p class="empty-hint">Найдите погоду в городе, чтобы добавить её в историю</p>
      </div>
      <button class="clear-history-btn" disabled>
        🗑 Очистить всю историю
      </button>
    `;
  }
}

export const historyView = new WeatherSearchHistoryView();
