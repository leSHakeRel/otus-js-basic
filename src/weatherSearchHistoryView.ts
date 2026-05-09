import "./weatherSearchHistoryView.css";

interface HistoryController {
  getHistory(): string[];
  clearHistory(): void;
  removeCity(cityName: string): void;
}

class WeatherSearchHistoryView {
  private container: HTMLElement | null = null;
  private controller: HistoryController | null = null;
  private elements: {
    historyList: HTMLElement | null;
  };

  constructor() {
    this.elements = {
      historyList: null,
    };
  }

  /**
   * Рендер компонента
   * @param container - контейнер для истории
   * @param controller - контроллер для обработки событий
   */
  render(container: HTMLElement, controller: HistoryController): void {
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
  private createDOM(): void {
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
  private attachEvents(): void {
    if (!this.container) return;

    this.container.addEventListener("click", (e) => {
      if (e.target instanceof HTMLElement && e.target.classList.contains("clear-history-btn")) {
        this.controller?.clearHistory();
      }

      if (e.target instanceof HTMLElement && e.target.classList.contains("remove-history-item")) {
        const city = e.target.dataset.city;
        if (city) {
          this.controller?.removeCity(city);
        }
      }
    });
  }

  /**
   * Обновление представления
   * @param history - массив городов
   */
  public update(history: string[]): void {
    if (!this.elements.historyList) return;

    if (!history || history.length === 0) {
      this.renderEmpty();
    } else {
      this.renderHistory(history);
    }
  }

  /**
   * Рендер списка истории
   * @param history - массив городов
   */
  private renderHistory(history: string[]): void {
    if (!this.elements.historyList) return;
    
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
   * @param city - название города
   * @param index - индекс в списке
   * @returns HTML строку
   */
  private renderHistoryItem(city: string, index: number): string {
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
  private renderEmpty(): void {
    if (!this.elements.historyList) return;
    
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
