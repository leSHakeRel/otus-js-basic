import { storage, StorageKeys } from './storageService';
import { bus } from './eventbus';

interface WeatherStorageService {
  getSearchHistory(): string[];
  saveSearchHistory(history: string[]): void;
  addToHistory(cityName: string, maxItems?: number): string[];
  clearHistory(): void;
  hasHistory(): boolean;
  getLastCity(): string | null;
  removeFromHistory(cityName: string): void;
}

class WeatherStorageService {
  /**
   * Получить историю поиска
   * @returns массив городов
   */
  public getSearchHistory(): string[] {
    return storage.get(StorageKeys.SEARCH_HISTORY, []);
  }

  /**
   * Сохранить историю поиска
   * @param history - массив городов
   */
  public saveSearchHistory(history: string[]): void {
    storage.set(StorageKeys.SEARCH_HISTORY, history);
  }

  /**
   * Добавить город в историю
   * @param cityName - название города
   * @param maxItems - максимальное количество элементов в истории
   * @returns обновленная история
   */
  public addToHistory(cityName: string, maxItems: number = 10): string[] {
    const history = this.getSearchHistory();
    const filtered = history.filter((city) => city !== cityName);
    filtered.unshift(cityName);
    const newHistory = filtered.slice(0, maxItems);
    this.saveSearchHistory(newHistory);
    bus.emit('history:updated', newHistory);
    return newHistory;
  }

  /**
   * Очистить историю поиска
   */
  public clearHistory(): void {
    storage.remove(StorageKeys.SEARCH_HISTORY);
  }

  /**
   * Проверить, есть ли города в истории
   * @returns boolean
   */
  public hasHistory(): boolean {
    return this.getSearchHistory().length > 0;
  }

  /**
   * Получить последний город из истории
   * @returns string | null
   */
  public getLastCity(): string | null {
    const history = this.getSearchHistory();
    return history.length > 0 ? (history[0] as string) : null;
  }

  /**
   * Удалить конкретный город из истории
   * @param cityName - название города
   */
  public removeFromHistory(cityName: string): void {
    const history = this.getSearchHistory();
    const filtered = history.filter((city) => city !== cityName);
    this.saveSearchHistory(filtered);
  }
}

export const weatherStorage = new WeatherStorageService();
