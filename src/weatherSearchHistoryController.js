// weatherSearchHistoryController.js
import { historyModel } from "./weatherSearchHistoryModel.js";
import { historyView } from "./weatherSearchHistoryView.js";

class WeatherSearchHistoryController {
  constructor() {
    this.view = historyView;
    this.model = historyModel;

    this.model.addObserver(this.onHistoryChanged.bind(this));
  }

  /**
   * Инициализация контроллера
   * @param {HTMLElement} container - заполнение контейнера виджетом истории поиска
   */
  init(container) {
    this.view.render(container, this);
  }

  /**
   * Обработчик изменения истории
   * @param {*} history
   */
  onHistoryChanged(history) {
    this.view.update(history);
  }

  /**
   * Добавить город в историю
   * @param {string} cityName - название города
   */
  addCity(cityName) {
    if (cityName && cityName.trim()) {
      this.model.addCity(cityName.trim());
    }
  }

  /**
   * Очистить всю историю
   */
  clearHistory() {
    if (confirm("Вы уверены, что хотите очистить всю историю поиска?")) {
      this.model.clearHistory();
    }
  }

  /**
   * Удалить конкретный город
   * @param {string} cityName - название города
   */
  removeCity(cityName) {
    if (confirm(`Удалить "${cityName}" из истории поиска?`)) {
      this.model.removeCity(cityName);
    }
  }

  /**
   * Получить историю
   * @returns {Array} - массив истории поиска
   */
  getHistory() {
    return this.model.getHistory();
  }

  /**
   * Получить последний город из истории
   * @returns {string|null}
   */
  getLastCity() {
    return this.model.getLastCity();
  }

  /**
   * Проверить, пуста ли история
   * @returns {boolean}
   */
  isEmpty() {
    return this.model.isEmpty();
  }
}

export const historyController = new WeatherSearchHistoryController();
