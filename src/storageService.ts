interface StorageService {
  set(key: string, value: unknown): boolean;
  get<T>(key: string, defaultValue?: T): T;
  remove(key: string): boolean;
  has(key: string): boolean;
  clear(): boolean;
}

class StorageService {
  private pfx: string;

  constructor() {
    this.pfx = "weather_app_";
  }

  /**
   * Получить ключ с префиксом
   * @param key - исходный ключ
   * @returns ключ с префиксом
   */
  private _getPrefixedKey(key: string): string {
    return this.pfx + key;
  }

  /**
   * Установить значение по ключу
   * @param key - ключ
   * @param value - значение
   */
  public set(key: string, value: unknown): boolean {
    try {
      const prefixedKey = this._getPrefixedKey(key);
      const dataToStore =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);
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
   * @param key - ключ
   * @param defaultValue - значение по умолчанию
   * @returns значение
   */
  public get<T>(key: string, defaultValue: T = null as T): T {
    try {
      const prefixedKey = this._getPrefixedKey(key);
      const value = localStorage.getItem(prefixedKey);

      if (value === null) {
        return defaultValue;
      }

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
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
   * @param key - ключ
   */
  public remove(key: string): boolean {
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
   * @param key - ключ
   * @returns boolean
   */
  public has(key: string): boolean {
    const prefixedKey = this._getPrefixedKey(key);
    return localStorage.getItem(prefixedKey) !== null;
  }

  /**
   * Очистить все данные приложения
   */
  public clear(): boolean {
    try {
      const keysToRemove: string[] = [];
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
