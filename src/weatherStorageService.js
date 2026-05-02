import { storage, StorageKeys } from "./storageService.js";
import { bus } from "./eventbus.js";

class WeatherStorageService {
  /**
   * Получить историю поиска
   * @returns {string[]} - массив городов
   */
  getSearchHistory() {
    return storage.get(StorageKeys.SEARCH_HISTORY, []);
  }

  /**
   * Сохранить историю поиска
   * @param {string[]} history - массив городов
   */
  saveSearchHistory(history) {
    storage.set(StorageKeys.SEARCH_HISTORY, history);
  }

  /**
   * Добавить город в историю
   * @param {string} cityName - название города
   * @param {number} maxItems - максимальное количество элементов в истории
   * @returns {string[]} - обновленная история
   */
  addToHistory(cityName, maxItems = 10) {
    const history = this.getSearchHistory();
    const filtered = history.filter((city) => city !== cityName);
    filtered.unshift(cityName);
    const newHistory = filtered.slice(0, maxItems);
    this.saveSearchHistory(newHistory);
    bus.emit("history:updated", newHistory);
    return newHistory;
  }

  /**
   * Очистить историю поиска
   */
  clearHistory() {
    storage.remove(StorageKeys.SEARCH_HISTORY);
  }

  /**
   * Проверить, есть ли города в истории
   * @returns {boolean}
   */
  hasHistory() {
    return this.getSearchHistory().length > 0;
  }

  /**
   * Получить последний город из истории
   * @returns {string|null}
   */
  getLastCity() {
    const history = this.getSearchHistory();
    return history.length > 0 ? history[0] : null;
  }

  /**
   * Удалить конкретный город из истории
   * @param {string} cityName - название города
   */
  removeFromHistory(cityName) {
    const history = this.getSearchHistory();
    const filtered = history.filter((city) => city !== cityName);
    this.saveSearchHistory(filtered);
  }
}

export const weatherStorage = new WeatherStorageService();
