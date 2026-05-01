class StorageService {
  constructor() {
    this.pfx = "weather_app_";
  }

  /**
   * Получить ключ с префиксом
   * @param {string} key - исходный ключ
   * @returns {string} - ключ с префиксом
   */
  _getPrefixedKey(key) {
    return this.pfx + key;
  }

  /**
   * Установить значение по ключу
   * @param {string} key - ключ
   * @param {any} value - значение
   */
  set(key, value) {
    try {
      const prefixedKey = this._getPrefixedKey(key);
      const dataToStore =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : value;
      localStorage.setItem(prefixedKey, dataToStore);
      return true;
    } catch (error) {
      console.error(
        `StorageService: ошибка установки значения для ключа "${key}"`,
        error,
      );
      return false;
    }
  }

  /**
   * Получить значение по ключу
   * @param {string} key - ключ
   * @param {any} defaultValue - значение по умолчанию
   * @returns {any} - значение
   */
  get(key, defaultValue = null) {
    try {
      const prefixedKey = this._getPrefixedKey(key);
      const value = localStorage.getItem(prefixedKey);

      if (value === null) {
        return defaultValue;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(
        `StorageService: ошибка получения значения для ключа "${key}"`,
        error,
      );
      return defaultValue;
    }
  }

  /**
   * Удалить значение по ключу
   * @param {string} key - ключ
   */
  remove(key) {
    try {
      const prefixedKey = this._getPrefixedKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error(
        `StorageService: ошибка удаления для ключа "${key}"`,
        error,
      );
      return false;
    }
  }

  /**
   * Проверить существование ключа
   * @param {string} key - ключ
   * @returns {boolean}
   */
  has(key) {
    const prefixedKey = this._getPrefixedKey(key);
    return localStorage.getItem(prefixedKey) !== null;
  }

  /**
   * Очистить все данные приложения
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.pfx)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error("StorageService: ошибка очистки всех данных", error);
      return false;
    }
  }
}

export const storage = new StorageService();

export const StorageKeys = {
  SEARCH_HISTORY: "searchHistory",
};
